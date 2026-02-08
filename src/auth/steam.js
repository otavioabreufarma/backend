import passport from "passport";
import { Strategy as SteamStrategy } from "passport-steam";
import env from "../config/env.js";

/**
 * Estratégia Steam OpenID
 */
passport.use(
  new SteamStrategy(
    {
      returnURL: env.STEAM_RETURN_URL,
      realm: env.STEAM_REALM,
      apiKey: env.STEAM_API_KEY
    },
    (identifier, profile, done) => {
      /**
       * NUNCA confie em dados vindos do cliente.
       * O profile vem direto do Steam.
       */
      return done(null, {
        id: profile.id,
        displayName: profile.displayName,
        photos: profile.photos || []
      });
    }
  )
);

/**
 * SERIALIZAÇÃO DA SESSÃO
 * ESSENCIAL para não quebrar após o login Steam
 */
passport.serializeUser((user, done) => {
  /**
   * Armazenamos apenas o necessário na sessão
   * para evitar corrupção e problemas de memória
   */
  done(null, {
    id: user.id,
    displayName: user.displayName
  });
});

/**
 * DESERIALIZAÇÃO DA SESSÃO
 */
passport.deserializeUser((user, done) => {
  /**
   * Não acessa banco aqui.
   * Apenas reidrata a sessão.
   */
  done(null, user);
});

export default passport;
