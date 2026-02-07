import { load, save } from "../database/jsonDB.js";
import { activateVip } from "./vip.service.js";
import { log } from "../utils/logger.js";

export function processWebhook(payload) {
  const payments = load("payments.json");

  const payment = payments.find(p => p.order_nsu === payload.order_nsu);

  if (!payment) {
    log("webhook_unknown", payload);
    return;
  }

  // idempotente
  if (payment.status === "paid") {
    log("webhook_duplicate", payload);
    return;
  }

  if (payload.status !== "paid") return;

  payment.status = "paid";
  payment.paid_at = new Date().toISOString();
  payment.transaction_nsu = payload.transaction_nsu;

  activateVip({
    steam_id: payment.steam_id,
    vip_type: payment.vip_type
  });

  save("payments.json", payments);

  log("webhook_paid", payment);
}
