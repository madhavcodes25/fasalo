import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[fasalo] Backend API listening at ${env.backendUrl} (env=${env.nodeEnv})`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  server.close(() => {
    process.exit(0);
  });
});

export default app;
