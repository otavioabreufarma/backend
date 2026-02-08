import passport from "passport";
import SteamStrategy from "passport-steam";
import env from "../config/env.js";

// ==================================================
// SERIALIZAÇÃO (OBRIGATÓRIA)
// ==================================================

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// ==================================================
// STRATEGY STEAM
// ==================================================

passport.use(
  new SteamStrategy(
    {
      returnURL: `${env.BASE_URL}/auth/steam/callback`,
      realm: env.STEAM_REALM,
      apiKey: env.STEAM_API_KEY,
      passReqToCallback: true // 🔑 IMPORTANTE
    },
    (req, identifier, profile, done) => {
      return done(null, {
        steamid: profile.id,
        username: profile.displayName
      });
    }
  )
);

export default passport;
