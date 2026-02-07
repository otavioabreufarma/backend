import express from "express";
import passport from "../auth/steam.js";

const router = express.Router();

router.get("/steam", passport.authenticate("steam"));

router.get(
  "/steam/callback",
  passport.authenticate("steam", { failureRedirect: "/" }),
  (req, res) => {
    res.send("Steam vinculado com sucesso. Você pode fechar esta página.");
  }
);

export default router;
