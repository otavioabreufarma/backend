import express from "express";
import session from "express-session";
import passport from "./auth/steam.js";
import env from "./config/env.js";

import authRoutes from "./routes/auth.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import internalRoutes from "./routes/internal.routes.js";

import webhookRoutes from "./routes/webhook.routes.js";
import paymentCheckRoutes from "./routes/payment.check.js";

const app = express();

app.use(express.json());
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/payment", paymentRoutes);
app.use("/internal", internalRoutes);

app.use(webhookRoutes);
app.use(paymentCheckRoutes);

export default app;
