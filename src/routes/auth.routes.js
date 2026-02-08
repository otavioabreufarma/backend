import express from "express";
import crypto from "crypto";
import { load, save } from "../database/jsonDB.js";
import passport from "passport";

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

  // Salva login temporário
  const logins = load("logins.json");
  logins[loginId] = {
    discord_id,
    created_at: Date.now()
  };
  save("logins.json", logins);

  // Injeta login_id para o passport usar no returnURL
  req.loginId = loginId;
  next();
}, (req, res, next) => {
  const loginId = req.loginId;

  passport.authenticate("steam", {
    callbackURL: `${process.env.BASE_URL}/auth/steam/callback?login_id=${loginId}`
  })(req, res, next);
});

// ==================================================
// CALLBACK STEAM
// ==================================================
router.get(
  "/steam/callback",
  passport.authenticate("steam", { failureRedirect: "/auth/steam/failure" }),
  (req, res) => {
    const { login_id } = req.query;
    if (!login_id) {
      return res.status(400).send("login_id ausente");
    }

    const logins = load("logins.json");
    const login = logins[login_id];

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

    // Limpa login temporário
    delete logins[login_id];
    save("logins.json", logins);

    res.send("Steam vinculada com sucesso. Você pode fechar esta página.");
  }
);

// ==================================================
router.get("/steam/failure", (req, res) => {
  res.status(401).send("Falha ao autenticar com a Steam.");
});

export default router;
