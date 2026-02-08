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

// ===============================
// CONFIGURAÇÕES BÁSICAS
// ===============================

// Necessário para funcionar corretamente atrás do proxy HTTPS do Render
app.set("trust proxy", 1);

// Body parser
app.use(express.json());

// ===============================
// SESSION STORE EM ARQUIVO (PRODUÇÃO)
// ===============================

const FileStore = FileStoreFactory(session);

app.use(
  session({
    name: "rust_vip_session",
    store: new FileStore({
      path: "./data/sessions",
      retries: 0,
      ttl: 60 * 60 * 24, // 24h
      logFn: function () {} // silencia logs internos
    }),
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,        // HTTPS obrigatório
      httpOnly: true,
      sameSite: "none"     // necessário para Steam OpenID
    }
  })
);

// ===============================
// PASSPORT (STEAM OPENID)
// ===============================

app.use(passport.initialize());
app.use(passport.session());

// ===============================
// ROTAS
// ===============================

// Autenticação Steam
app.use("/auth", authRoutes);

// Criação de pagamento (checkout)
app.use("/payment", paymentRoutes);

// Webhook InfinitePay
app.use(webhookRoutes);

// Fallback de verificação de pagamento
app.use(paymentCheckRoutes);

// Rotas internas (Discord Bot / Plugin Rust)
app.use("/internal", internalRoutes);

// ===============================
// HEALTH CHECK (OPCIONAL)
// ===============================

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "rust-vip-backend",
    timestamp: new Date().toISOString()
  });
});

export default app;
