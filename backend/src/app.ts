import express, { type Express } from "express";
import cors from "cors";
import healthRoutes from "./health.js";
import authRoutes from "./routes/auth.js";
import listingsRoutes from "./routes/listings.js";
import ordersRoutes from "./routes/orders.js";
import bidsRoutes from "./routes/bids.js";

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: true }));
  app.use(express.json());

  // API routes (Phase 0: /api/health; Phase 1: auth, listings, orders, bids)
  app.use("/api", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/listings", listingsRoutes);
  app.use("/api/orders", ordersRoutes);
  app.use("/api/bids", bidsRoutes);

  // Simple root route to prove the server is up
  app.get("/", (_req, res) => {
    res.json({
      service: "Fasalo Backend",
      message: "Welcome to the Fasalo marketplace API.",
      docs: "/api/health",
    });
  });

  return app;
}

