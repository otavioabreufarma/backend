import express from "express";
import { load, save } from "../database/jsonDB.js";

const router = express.Router();

// ⚠️ SEM SEGURANÇA AQUI
router.post("/payment/webhook", (req, res) => {
  try {
    const payload = req.body;

    const payments = load("payments.json");
    const vip = load("vip.json");

    const payment = payments.find(
      p => p.order_nsu === payload.order_nsu
    );

    if (!payment || payment.status === "paid") {
      return res.sendStatus(200);
    }

    payment.status = "paid";
    payment.paid_at = new Date().toISOString();
    payment.transaction_nsu = payload.transaction_nsu;

    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + 30);

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
    console.error("Erro webhook:", err);
    return res.sendStatus(400);
  }
});

export default router;
