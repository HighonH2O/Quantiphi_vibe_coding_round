import express from "express";
import cors from "cors";
import { subscriptionRouter } from "./routes/subscriptions.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "subscription-tracker-api" });
  });

  app.use("/api/subscriptions", subscriptionRouter);

  app.use((err, _req, res, _next) => {
    const status = err.statusCode || 500;
    res.status(status).json({
      error: err.message || "Internal server error",
    });
  });

  return app;
}
