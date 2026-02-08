import express from "express";
import passport from "passport";
import crypto from "crypto";
import { load, save } from "../database/jsonDB.js";

const router = express.Router();

// ==================================================
// INICIAR LOGIN STEAM (SEM SESSÃO)
// ==================================================
router.get("/steam/start", (req, res, next) => {
  const { discord_id } = req.query;
  if (!discord_id) {
    return res.status(400).send("discord_id obrigatório");
  }

  const loginId = crypto.randomUUID();

  const logins = load("logins.json");
  logins[loginId] = {
    discord_id,
    created_at: Date.now()
  };
  save("logins.json", logins);

  req.query.login_id = loginId;
  next();
}, passport.authenticate("steam"));

// ==================================================
// CALLBACK STEAM
// ==================================================
router.get(
  "/steam/callback",
  passport.authenticate("steam", { failureRedirect: "/auth/steam/failure" }),
  (req, res) => {
    const loginId = req.query.login_id;
    if (!loginId) {
      return res.status(400).send("login_id ausente");
    }

    const logins = load("logins.json");
    const login = logins[loginId];

    if (!login) {
      return res.status(400).send("login inválido ou expirado");
    }

    const steamId = req.user.steamid;
    const steamName = req.user.username;

    const users = load("users.json");
    users[steamId] = {
      steam_id: steamId,
      steam_name: steamName,
      discord_id: login.discord_id,
      linked_at: new Date().toISOString()
    };
    save("users.json", users);

    delete logins[loginId];
    save("logins.json", logins);

    res.send("Steam vinculada com sucesso. Você pode fechar esta página.");
  }
);

// ==================================================
router.get("/steam/failure", (req, res) => {
  res.status(401).send("Falha ao autenticar com a Steam.");
});

export default router;
