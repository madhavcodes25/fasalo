import { Router } from "express";
import { store } from "../db/store.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import type { Dispute } from "../models/index.js";

const router = Router();
const VALID_STATUSES: Dispute["status"][] = ["open", "in_review", "resolved", "rejected"];

router.get("/", requireAuth(), (req: AuthenticatedRequest, res) => res.json(store.listDisputesForUser(req.user!.id)));

router.post("/", requireAuth(), (req: AuthenticatedRequest, res) => {
  const { orderId, reason } = req.body ?? {};
  const order = store.findOrderById(orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (req.user!.id !== order.farmerId && req.user!.id !== order.buyerId) return res.status(403).json({ error: "Not authorized" });
  if (!reason || typeof reason !== "string") return res.status(400).json({ error: "reason is required" });
  res.status(201).json(store.createDispute({ orderId: order.id, raisedById: req.user!.id, reason }));
});

// Demo-only: either participant can record the agreed resolution; production needs an independent case manager.
router.patch("/:id", requireAuth(), (req: AuthenticatedRequest, res) => {
  const dispute = store.findDisputeById(req.params.id);
  if (!dispute) return res.status(404).json({ error: "Dispute not found" });
  const order = store.findOrderById(dispute.orderId);
  if (!order || (req.user!.id !== order.farmerId && req.user!.id !== order.buyerId && req.user!.role !== "admin")) return res.status(403).json({ error: "Not authorized" });
  const { status, resolution } = req.body ?? {};
  if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: "Invalid dispute status" });
  if ((status === "resolved" || status === "rejected") && !resolution) return res.status(400).json({ error: "resolution is required when closing a dispute" });
  res.json(store.updateDispute(dispute.id, { status, resolution: typeof resolution === "string" ? resolution : undefined }));
});

export default router;
