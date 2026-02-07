import { load, save } from "../database/jsonDB.js";

export function handleWebhook(payload) {
  const payments = load("payments.json");
  const vip = load("vip.json");

  const payment = payments.find(p => p.order_nsu === payload.order_nsu);
  if (!payment || payment.status === "paid") return;

  payment.status = "paid";
  payment.paid_at = new Date().toISOString();
  payment.transaction_nsu = payload.transaction_nsu;

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
}
