import express from "express";
import { processWebhook } from "../services/webhook.service.js";

const router = express.Router();

router.post("/payment/webhook", (req, res) => {
  try {
    processWebhook(req.body);
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500);
  }
});

export default router;
