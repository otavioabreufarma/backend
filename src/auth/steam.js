import passport from "passport";
import { Strategy as SteamStrategy } from "passport-steam";
import env from "../config/env.js";
import { load, save } from "../database/jsonDB.js";

passport.use(
  new SteamStrategy(
    {
      returnURL: env.STEAM_RETURN_URL,
      realm: env.STEAM_REALM,
      apiKey: env.STEAM_API_KEY
    },
    (identifier, profile, done) => {
      const users = load("users.json");

      users[profile.id] = {
        steam_id: profile.id,
        steam_name: profile.displayName,
        linked_at: new Date().toISOString()
      };

      save("users.json", users);
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

export default passport;
