import passport from "passport";
import SteamStrategy from "passport-steam";
import env from "../config/env.js";

// ==================================================
// STRATEGY STEAM (SEM SESSION)
// ==================================================

passport.use(
  new SteamStrategy(
    {
      returnURL: `${env.BASE_URL}/auth/steam/callback`,
      realm: env.STEAM_REALM,
      apiKey: env.STEAM_API_KEY
    },
    (identifier, profile, done) => {
      return done(null, {
        steamid: profile.id,
        username: profile.displayName
      });
    }
  )
);

export default passport;
