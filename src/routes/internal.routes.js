import express from "express";
import env from "../config/env.js";
import { load } from "../database/jsonDB.js";

const router = express.Router();

// ==================================================
// MIDDLEWARE DE SEGURANÇA (TOKEN INTERNO)
// ==================================================

//router.use((req, res, next) => {
  //const token = req.headers["x-internal-token"];

  //const allowed =
    //token === env.INTERNAL_RUST_TOKEN ||
    //token === env.INTERNAL_DISCORD_TOKEN;

  //if (!allowed) {
    //return res.sendStatus(403);
  //}

  //next();
//});

// ==================================================
// CONSULTA VIP POR STEAMID (PLUGIN RUST)
// ==================================================

router.get("/vip/:steamId", (req, res) => {
  const vip = load("vip.json");
  const data = vip[req.params.steamId] || null;
  res.json(data);
});

// ==================================================
// CONSULTA USUÁRIO POR DISCORD ID (BOT DISCORD)
// ==================================================

router.get("/user/by-discord/:discordId", (req, res) => {
  const users = load("users.json");

  const user = Object.values(users).find(
    u => u.discord_id === req.params.discordId
  );

  if (!user) {
    return res.sendStatus(404);
  }

  res.json(user);
});

// ==================================================
// CONSULTA USUÁRIO POR STEAM ID (BOT / DEBUG)
// ==================================================

router.get("/user/by-steam/:steamId", (req, res) => {
  const users = load("users.json");

  const user = users[req.params.steamId] || null;

  if (!user) {
    return res.sendStatus(404);
  }

  res.json(user);
});

export default router;
