import express from "express";
import axios from "axios";
import env from "../config/env.js";
import { load, save } from "../database/jsonDB.js";
import { handleWebhook } from "../services/webhook.service.js";

const router = express.Router();

/**
 * ==================================================
 * 🔒 SEGURANÇA (APENAS PARA ROTAS INTERNAS)
 * ==================================================
 */
function internalAuth(req, res, next) {
  const token = req.headers["x-internal-token"];
  if (token !== env.INTERNAL_DISCORD_TOKEN) {
    return res.sendStatus(403);
  }
  next();
}

/**
 * ==================================================
 * 💳 CRIAR CHECKOUT (BOT DISCORD)
 * ==================================================
 */
router.post("/create", internalAuth, async (req, res) => {
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
      return res.status(400).json({
        error: "Usuário não vinculado ao Steam"
      });
    }

    const prices = {
      VIP: 1500,
      VIP_PLUS: 3000
    };

    const descriptions = {
      VIP: "VIP 30 dias",
      VIP_PLUS: "VIP+ 30 dias"
    };

    const price = prices[vip_type];
    if (!price) {
      return res.status(400).json({ error: "Tipo de VIP inválido" });
    }

    const order_nsu = `${vip_type}_${discord_id}_${Date.now()}`;

    /**
     * ==================================================
     * 📦 PAYLOAD INFINITEPAY (OFICIAL)
     * ==================================================
     */
    const payload = {
      handle: env.INFINITEPAY_HANDLE,
      order_nsu,
      redirect_url: env.PAYMENT_REDIRECT_URL,
      webhook_url: `${env.BASE_URL}/payment/webhook`,
      items: [
        {
          quantity: 1,
          price,
          description: descriptions[vip_type]
        }
      ]
    };

    const response = await axios.post(
      "https://api.infinitepay.io/invoices/public/checkout/links",
      payload,
      { timeout: 10000 }
    );

    const checkoutUrl = response.data?.url;
    if (!checkoutUrl) {
      throw new Error("Checkout não retornou URL");
    }

    const payments = load("payments.json");
    payments[order_nsu] = {
      discord_id,
      steam_id: user.steam_id,
      vip_type,
      status: "pending",
      created_at: new Date().toISOString()
    };

    save("payments.json", payments);

    return res.json({ url: checkoutUrl });

  } catch (err) {
    console.error("Erro InfinitePay:", err.response?.data || err.message);
    return res.status(502).json({ error: "Falha ao criar checkout" });
  }
});

/**
 * ==================================================
 * 🔔 WEBHOOK INFINITEPAY (PÚBLICO)
 * ==================================================
 * ⚠️ NÃO TEM TOKEN
 * ⚠️ NÃO TEM AUTH
 * ⚠️ A InfinitePay PRECISA ACESSAR
 */
router.post("/webhook", async (req, res) => {
  try {
    handleWebhook(req.body);
    return res.sendStatus(200);
  } catch (err) {
    console.error("Erro no webhook InfinitePay:", err);
    return res.sendStatus(400);
  }
});

export default router;
