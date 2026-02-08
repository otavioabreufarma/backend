import express from "express";
import passport from "passport";
import { load, save } from "../database/jsonDB.js";

const router = express.Router();

// ===============================
// INÍCIO DO LOGIN STEAM
// ===============================

router.get("/steam", (req, res, next) => {
  // Se veio do Discord, salva o discord_id na sessão
  if (req.query.discord_id) {
    req.session.discord_id = req.query.discord_id;
  }

  next();
}, passport.authenticate("steam"));

// ===============================
// CALLBACK DO STEAM (GET)
// ===============================

router.get(
  "/steam/callback",
  passport.authenticate("steam", {
    failureRedirect: "/auth/steam/error",
    session: true
  }),
  (req, res) => {
    try {
      const steamProfile = req.user;
      const discordId = req.session.discord_id || null;

      if (!steamProfile || !steamProfile.id) {
        return res.redirect("/auth/steam/error");
      }

      const users = load("users.json");

      users[steamProfile.id] = {
        steam_id: steamProfile.id,
        steam_name: steamProfile.displayName,
        discord_id: discordId,
        linked_at: new Date().toISOString()
      };

      save("users.json", users);

      // Limpa a sessão temporária
      delete req.session.discord_id;

      res.send("Steam vinculado com sucesso. Você pode fechar esta página.");
    } catch (err) {
      console.error("Erro no callback Steam:", err);
      res.redirect("/auth/steam/error");
    }
  }
);

// ===============================
// ROTA DE ERRO (DEBUG VISÍVEL)
// ===============================

router.get("/steam/error", (req, res) => {
  res.status(500).send(
    "Erro ao autenticar com a Steam.\n\n" +
    "Possíveis causas:\n" +
    "- Sessão inválida\n" +
    "- Cookie bloqueado\n" +
    "- Callback mal configurado\n\n" +
    "Verifique os logs do backend."
  );
});

export default router;
