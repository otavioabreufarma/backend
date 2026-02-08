import express from "express";
import passport from "passport";
import { load, save } from "../database/jsonDB.js";

const router = express.Router();

// ==================================================
// INÍCIO LOGIN STEAM
// ==================================================
router.get("/steam", (req, res, next) => {
  const { discord_id } = req.query;

  if (!discord_id) {
    return res
      .status(400)
      .send("discord_id é obrigatório para vincular a conta.");
  }

  // Salva na sessão
  req.session.discord_id = discord_id;

  // 🔑 PONTO CRÍTICO: FORÇA SALVAR A SESSÃO
  req.session.save(err => {
    if (err) {
      console.error("Erro ao salvar sessão:", err);
      return res.status(500).send("Erro ao salvar sessão.");
    }

    // Só agora redireciona para a Steam
    next();
  });
}, passport.authenticate("steam"));

// ==================================================
// CALLBACK STEAM
// ==================================================
router.get(
  "/steam/callback",
  passport.authenticate("steam", {
    failureRedirect: "/auth/steam/failure"
  }),
  (req, res) => {
    const steamId = req.user.steamid;
    const steamName = req.user.username;
    const discordId = req.session.discord_id;

    if (!discordId) {
      return res
        .status(500)
        .send("Erro crítico: discord_id não encontrado na sessão.");
    }

    const users = load("users.json");

    users[steamId] = {
      steam_id: steamId,
      steam_name: steamName,
      discord_id: discordId,
      linked_at: new Date().toISOString()
    };

    save("users.json", users);

    // Limpa a sessão
    delete req.session.discord_id;

    res.send(
      "Steam vinculada com sucesso. Você pode fechar esta página."
    );
  }
);

// ==================================================
// FALHA
// ==================================================
router.get("/steam/failure", (req, res) => {
  res.status(401).send("Falha ao autenticar com a Steam.");
});

export default router;
