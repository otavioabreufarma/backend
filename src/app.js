import express from "express";
import session from "express-session";
import FileStoreFactory from "session-file-store";
import passport from "./auth/steam.js";
import env from "./config/env.js";

// Rotas
import authRoutes from "./routes/auth.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import paymentCheckRoutes from "./routes/payment.check.js";
import internalRoutes from "./routes/internal.routes.js";

const app = express();
const FileStore = FileStoreFactory(session);

// ==================================================
// CONFIGURAÇÕES BÁSICAS
// ==================================================

app.set("trust proxy", 1);
app.use(express.json());

// ==================================================
// SESSION — CONFIGURAÇÃO CORRETA PARA STEAM OPENID
// ==================================================

app.use(
  session({
    name: "rust_vip_session",
    store: new FileStore({
      path: "./data/sessions",
      retries: 0
    }),
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: true,        // HTTPS
      httpOnly: true,
      sameSite: "lax"      // 🔑 ESSA É A CHAVE
    }
  })
);

// ==================================================
// PASSPORT
// ==================================================

app.use(passport.initialize());
app.use(passport.session());

// ==================================================
// ROTAS
// ==================================================

app.use("/auth", authRoutes);
app.use("/payment", paymentRoutes);
app.use(webhookRoutes);
app.use(paymentCheckRoutes);
app.use("/internal", internalRoutes);

// ==================================================
// HEALTH CHECK
// ==================================================

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "rust-vip-backend",
    timestamp: new Date().toISOString()
  });
});

export default app;
