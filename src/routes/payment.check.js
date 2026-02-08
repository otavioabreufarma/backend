import express from "express";
import axios from "axios";
import env from "../config/env.js";
import { load, save } from "../database/jsonDB.js";

const router = express.Router();

// ==================================================
// MIDDLEWARE DE SEGURANÇA (DISCORD / RUST)
// ==================================================
router.use((req, res, next) => {
  const token = req.headers["x-internal-token"];

  if (
    token !== env.INTERNAL_DISCORD_TOKEN &&
    token !== env.INTERNAL_RUST_TOKEN
  ) {
    return res.sendStatus(403);
  }

  next();
});

// ==================================================
// CRIAR PAGAMENTO (CHECKOUT INFINITEPAY)
// ==================================================
router.post("/create", async (req, res) => {
  try {
    const { discord_id, vip_type } = req.body;

    // -------------------------------
    // VALIDAÇÕES
    // -------------------------------
    if (!discord_id || !vip_type) {
      return res.status(400).json({
        error: "discord_id e vip_type são obrigatórios"
      });
    }

    if (vip_type !== "VIP" && vip_type !== "VIP+") {
      return res.status(400).json({
        error: "vip_type inválido"
      });
    }

    // -------------------------------
    // BUSCAR USUÁRIO PELO DISCORD ID
    // -------------------------------
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

    // -------------------------------
    // DEFINIR VALOR
    // -------------------------------
    const amount = vip_type === "VIP+" ? 3000 : 1500;

    // -------------------------------
    // GERAR ORDER NSU ÚNICO
    // -------------------------------
    const order_nsu = `vip_${steamId}_${Date.now()}`;

    // -------------------------------
    // REGISTRAR PAGAMENTO (PENDENTE)
    // -------------------------------
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

    // -------------------------------
    // CRIAR CHECKOUT NA INFINITEPAY
    // -------------------------------
    const response = await axios.post(
      "https://api.infinitepay.io/invoices/public/checkout/links",
      {
        handle: env.INFINITEPAY_HANDLE, // SEM $
        order_nsu,
        redirect_url: env.PAYMENT_REDIRECT_URL,
        webhook_url: `${env.BASE_URL}/payment/webhook`,

        // ⚠️ CAMPO OBRIGATÓRIO
        items: [
          {
            name: vip_type === "VIP+" ? "VIP Plus" : "VIP",
            quantity: 1,
            unit_price: amount
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    // -------------------------------
    // SUCESSO
    // -------------------------------
    return res.json({
      checkout_url: response.data.checkout_url
    });

  } catch (err) {
    console.error(
      "[PAYMENT_CREATE_ERROR]",
      err.response?.data || err.message
    );

    return res.status(502).json({
      error: "Falha ao criar checkout"
    });
  }
});

export default router;
