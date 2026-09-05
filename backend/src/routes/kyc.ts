import { Router } from "express";
import { store } from "../db/store.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

router.get("/me", requireAuth(), (req: AuthenticatedRequest, res) => {
  const user = store.findUserById(req.user!.id);
  res.json({ record: store.getKycRecord(req.user!.id) ?? null, verified: user?.kycVerified === true });
});

router.post("/submit", requireAuth(), (req: AuthenticatedRequest, res) => {
  res.status(201).json(store.submitKyc(req.user!.id));
});

// Hackathon-only stand-in for a verification-provider callback.
router.post("/mock-verify", requireAuth(), (req: AuthenticatedRequest, res) => {
  res.json(store.mockVerifyKyc(req.user!.id));
});

export default router;
