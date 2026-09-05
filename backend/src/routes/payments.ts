import { Router } from "express";
import { store } from "../db/store.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

function canAccessOrder(req: AuthenticatedRequest, order: { farmerId: string; buyerId: string }): boolean {
  return req.user!.role === "admin" || req.user!.id === order.farmerId || req.user!.id === order.buyerId;
}

router.get("/orders/:orderId", requireAuth(), (req: AuthenticatedRequest, res) => {
  const order = store.findOrderById(req.params.orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (!canAccessOrder(req, order)) return res.status(403).json({ error: "Not authorized" });
  res.json(store.findEscrowByOrderId(order.id) ?? null);
});

/** Buyer releases a held payment after the farmer marks the order delivered. */
router.post("/orders/:orderId/release", requireAuth(), (req: AuthenticatedRequest, res) => {
  const order = store.findOrderById(req.params.orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (req.user!.id !== order.buyerId && req.user!.role !== "admin") return res.status(403).json({ error: "Only the buyer can release payment" });
  if (order.status !== "delivered") return res.status(400).json({ error: "Payment can be released after delivery" });
  const payment = store.findEscrowByOrderId(order.id);
  if (!payment) return res.status(400).json({ error: "No held payment for this order" });
  if (payment.status !== "held") return res.status(400).json({ error: `Payment is already ${payment.status}` });
  res.json(store.updateEscrowStatus(order.id, "released"));
});

export default router;
