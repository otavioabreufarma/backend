import express from "express";
import axios from "axios";
import env from "../config/env.js";
import { load, save } from "../database/jsonDB.js";

const router = express.Router();

// ===============================
// SEGURANÇA (APENAS BOT DISCORD)
// ===============================
router.use((req, res, next) => {
  const token = req.headers["x-internal-token"];
  if (token !== env.INTERNAL_DISCORD_TOKEN) {
    return res.sendStatus(403);
  }
  next();
});

// ===============================
// CRIAR CHECKOUT
// ===============================
router.post("/create", async (req, res) => {
  try {
    const { discord_id, vip_type } = req.body;

    if (!discord_id || !vip_type) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const users = load("users.json");
    const user = Object.values(users).find(
      u => u.discord_id === discord_id
    );

    if (!user || !user.steam_id) {
      return res.status(400).json({ error: "Usuário não vinculado ao Steam" });
    }

    const prices = {
      VIP: 1500,
      VIP_PLUS: 3000
    };

    const descriptions = {
      VIP: "VIP 30 dias",
      VIP_PLUS: "VIP+ 30 dias"
    };

    if (!prices[vip_type]) {
      return res.status(400).json({ error: "Tipo de VIP inválido" });
    }

    const order_nsu = `${vip_type}_${user.steam_id}_${Date.now()}`;

    const payload = {
      handle: env.INFINITEPAY_HANDLE,
      order_nsu,
      webhook_url: `${env.BASE_URL}/payment/webhook`,
      redirect_url: env.PAYMENT_REDIRECT_URL,
      items: [
        {
          quantity: 1,
          price: prices[vip_type],
          description: descriptions[vip_type]
        }
      ]
    };

    const response = await axios.post(
      "https://api.infinitepay.io/invoices/public/checkout/links",
      payload
    );

    const payments = load("payments.json");
    payments.push({
      order_nsu,
      steam_id: user.steam_id,
      discord_id,
      vip_type,
      status: "pending",
      created_at: new Date().toISOString()
    });
    save("payments.json", payments);

    res.json({ url: response.data.url });

  } catch (err) {
    console.error("Erro InfinitePay:", err.response?.data || err.message);
    res.status(502).json({ error: "Falha ao criar checkout" });
  }
});

export default router;
