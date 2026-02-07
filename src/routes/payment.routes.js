import express from "express";
import { v4 as uuid } from "uuid";
import { load, save } from "../database/jsonDB.js";
import { createCheckout } from "../services/infinitepay.service.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  const { steam_id, vip_type } = req.body;

  const amount = vip_type === "VIP+" ? 3000 : 1500;
  const order_nsu = `vip_${steam_id}_${Date.now()}`;

  const checkout = await createCheckout({
    order_nsu,
    amount,
    redirect_url: "https://seusite.com/obrigado"
  });

  const payments = load("payments.json");

  payments.push({
    order_nsu,
    steam_id,
    vip_type,
    amount,
    status: "pending",
    created_at: new Date().toISOString(),
    invoice_slug: checkout.slug
  });

  save("payments.json", payments);

  res.json({ url: checkout.url });
});

export default router;
