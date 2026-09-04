import express, { type Express } from "express";
import cors from "cors";
import routes from "./health";

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: true }));
  app.use(express.json());

  // API root — Phase 0 only exposes /api/health
  app.use("/api", routes);

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
