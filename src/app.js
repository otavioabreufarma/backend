import express from "express";
import cookieParser from "cookie-parser";
import passport from "./auth/steam.js";
import env from "./config/env.js";

// Rotas
import authRoutes from "./routes/auth.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import paymentCheckRoutes from "./routes/payment.check.js";
import internalRoutes from "./routes/internal.routes.js";

const app = express();

// ==================================================
// CONFIGURAÇÕES BÁSICAS
// ==================================================

// Necessário para rodar atrás do proxy HTTPS do Render
app.set("trust proxy", 1);

// Body parser
app.use(express.json());

// Cookies assinados (USADO NO LOGIN STEAM)
app.use(cookieParser(env.SESSION_SECRET));

// ==================================================
// PASSPORT (STEAM OPENID)
// ==================================================

app.use(passport.initialize());

// ==================================================
// ROTAS
// ==================================================

// Autenticação Steam (fluxo sem sessão)
app.use("/auth", authRoutes);

// Criação de pagamento (InfinitePay Checkout)
app.use("/payment", paymentRoutes);

// Webhook InfinitePay
app.use(webhookRoutes);

// Fallback de verificação de pagamento
app.use(paymentCheckRoutes);

// Rotas internas (Discord Bot / Plugin Rust)
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
