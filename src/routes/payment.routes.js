import express from "express";
import axios from "axios";
import env from "../config/env.js";
import { load, save } from "../database/jsonDB.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { discord_id, vip_type } = req.body;

    if (!discord_id || !vip_type) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    // 🔑 BUSCA USUÁRIO PELO DISCORD ID
    const users = load("users.json");

    const user = Object.values(users).find(
      u => u.discord_id === discord_id
    );

    if (!user) {
      return res.status(400).json({
        error: "Conta Steam não vinculada"
      });
    }

    const steamId = user.steam_id;

    // 💰 DEFINIÇÃO DE PREÇO
    const amount = vip_type === "VIP+" ? 3000 : 1500;

    // 🧾 ORDER NSU SEMPRE VÁLIDO
    const order_nsu = `vip_${steamId}_${Date.now()}`;

    // 🧠 REGISTRA PAGAMENTO PENDENTE
    const payments = load("payments.json");
    payments.push({
      order_nsu,
      steam_id: steamId,
      vip_type,
      amount,
      status: "pending",
      created_at: new Date().toISOString()
    });
    save("payments.json", payments);

    // 💳 CHAMADA INFINITEPAY (CHECKOUT)
    const response = await axios.post(
      "https://api.infinitepay.io/invoices/public/checkout/links",
      {
        handle: env.INFINITEPAY_HANDLE, // SEM $
        order_nsu,
        amount,
        redirect_url: env.PAYMENT_REDIRECT_URL,
        webhook_url: `${env.BASE_URL}/payment/webhook`
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return res.json({
      checkout_url: response.data.checkout_url
    });

  } catch (err) {
    console.error("Erro InfinitePay:", err.response?.data || err.message);
    return res.status(502).json({
      error: "Falha ao criar checkout"
    });
  }
});

export default router;
