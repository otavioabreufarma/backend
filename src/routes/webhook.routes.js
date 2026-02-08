import express from "express";
import { load, save } from "../database/jsonDB.js";

const router = express.Router();

// ⚠️ WEBHOOK PÚBLICO — SEM TOKEN
router.post("/infinitepay", (req, res) => {
  try {
    const payload = req.body;

    // Validação mínima do payload
    if (!payload?.order_nsu || !payload?.transaction_nsu) {
      return res.sendStatus(400);
    }

    const payments = load("payments.json");
    const vip = load("vip.json");

    const payment = payments.find(
      p => p.order_nsu === payload.order_nsu
    );

    // Idempotência
    if (!payment || payment.status === "paid") {
      return res.sendStatus(200);
    }

    // Atualiza pagamento
    payment.status = "paid";
    payment.paid_at = new Date().toISOString();
    payment.transaction_nsu = payload.transaction_nsu;
    payment.invoice_slug = payload.invoice_slug || null;

    // Ativa VIP
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + 30);

    vip[payment.steam_id] = {
      vip_type: payment.vip_type,
      start_date: now.toISOString(),
      end_date: end.toISOString(),
      active: true
    };

    save("payments.json", payments);
    save("vip.json", vip);

    return res.sendStatus(200);

  } catch (err) {
    console.error("Erro webhook InfinitePay:", err);
    return res.sendStatus(400);
  }
});

export default router;
