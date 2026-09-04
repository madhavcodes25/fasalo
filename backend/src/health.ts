import { Router } from "express";

const router = Router();

/**
 * GET /api/health
 * Liveness + readiness probe.
 *
 * Phase 0: Always returns `ok` so the frontend skeleton can verify
 * the backend is reachable.
 *
 * Phase 1+: Will also report DB connectivity status.
 */
router.get("/health", async (_req, res) => {
  // TODO (Phase 1): ping PostgreSQL connection pool here and reflect in `db` field.
  res.json({
    status: "ok",
    service: "fasalo-backend",
    timestamp: new Date().toISOString(),
    db: "not-yet-configured", // placeholder — Phase 1 will wire up Postgres
  });
});

export default router;
