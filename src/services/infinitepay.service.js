import axios from "axios";
import env from "../config/env.js";

export async function createCheckout({ order_nsu, amount, redirect_url }) {
  const response = await axios.post(
    "https://api.infinitepay.io/invoices/public/checkout/links",
    {
      handle: env.INFINITEPAY_HANDLE,
      order_nsu,
      amount,
      redirect_url
    }
  );

  return response.data;
}
