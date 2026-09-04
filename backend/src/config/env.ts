import { config } from "dotenv";
config();

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: (process.env.NODE_ENV || "development") as "development" | "production" | "test",
  databaseUrl: process.env.DATABASE_URL || "",
  backendUrl: process.env.BACKEND_URL || `http://localhost:${parseInt(process.env.PORT || "4000", 10)}`,
} as const;
