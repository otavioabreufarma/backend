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

app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser(env.SESSION_SECRET));

// ==================================================
// PASSPORT (SEM SESSION)
// ==================================================

app.use(passport.initialize());

// ==================================================
// ROTAS
// ==================================================

// Steam OpenID
app.use("/auth", authRoutes);

// Pagamentos (BOT – COM TOKEN)
app.use("/payment", paymentRoutes);

// Webhook InfinitePay (PÚBLICO – SEM TOKEN)
app.use("/webhook", webhookRoutes);

// Fallback de verificação manual
app.use(paymentCheckRoutes);

// Rotas internas (BOT + PLUGIN)
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
