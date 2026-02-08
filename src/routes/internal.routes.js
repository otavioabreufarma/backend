import express from "express";
import { load } from "../database/jsonDB.js";

const router = express.Router();

// ===============================
// CONSULTA VIP POR STEAMID
// ===============================
router.get("/vip/:steamId", (req, res) => {
  const vip = load("vip.json");
  res.json(vip[req.params.steamId] || null);
});

// ===============================
// USUÁRIO POR DISCORD ID
// ===============================
router.get("/user/by-discord/:discordId", (req, res) => {
  const users = load("users.json");
  const user = Object.values(users).find(
    u => u.discord_id === req.params.discordId
  );
  if (!user) return res.sendStatus(404);
  res.json(user);
});

// ===============================
// USUÁRIO POR STEAM ID
// ===============================
router.get("/user/by-steam/:steamId", (req, res) => {
  const users = load("users.json");
  const user = users[req.params.steamId];
  if (!user) return res.sendStatus(404);
  res.json(user);
});

export default router;
