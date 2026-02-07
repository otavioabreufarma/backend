import express from "express";
import { load } from "../database/jsonDB.js";
import env from "../config/env.js";

const router = express.Router();

router.use((req, res, next) => {
  if (req.headers["x-internal-token"] !== env.INTERNAL_DISCORD_TOKEN)
    return res.sendStatus(403);
  next();
});

router.get("/payment/check/:order_nsu", (req, res) => {
  const payments = load("payments.json");
  const payment = payments.find(p => p.order_nsu === req.params.order_nsu);

  if (!payment) return res.sendStatus(404);
  res.json(payment);
});

export default router;
