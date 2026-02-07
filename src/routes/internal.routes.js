import express from "express";
import env from "../config/env.js";
import { load } from "../database/jsonDB.js";

const router = express.Router();

router.use((req, res, next) => {
  if (req.headers["x-internal-token"] !== env.INTERNAL_RUST_TOKEN)
    return res.sendStatus(403);
  next();
});

router.get("/vip/:steamId", (req, res) => {
  const vip = load("vip.json");
  res.json(vip[req.params.steamId] || null);
});

export default router;
