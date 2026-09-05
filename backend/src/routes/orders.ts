import { Router } from "express";
import { store } from "../db/store.js";
import { requireAuth, requireBuyer, type AuthenticatedRequest } from "../middleware/auth.js";
import type { Listing, Order } from "../models/index.js";

const router = Router();

/**
 * GET /api/orders
 * Returns orders relevant to the authenticated user:
 *   - farmer/FPO: orders on their listings
 *   - consumer/bulk_buyer: orders they placed
 */
router.get("/", requireAuth(), (req: AuthenticatedRequest, res) => {
  const orders = store.listOrdersForUser(req.user!.id, req.user!.role);
  res.json(orders);
});

/**
 * POST /api/orders
 * Place a new order against a listing (consumer flow).
 * Body: { listingId, quantity, deliveryAddress, bidPrice? }
 */
router.post("/", requireBuyer(), (req: AuthenticatedRequest, res) => {
  const { listingId, quantity, deliveryAddress, bidPrice } = req.body ?? {};

  if (!listingId || quantity == null || !deliveryAddress) {
    return res.status(400).json({ error: "listingId, quantity, and deliveryAddress are required" });
  }

  const listing = store.findListingById(listingId) as Listing | undefined;
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  if (listing.status !== "active") return res.status(400).json({ error: "Listing is not available" });
  const qty = Number(quantity);
  if (qty <= 0) return res.status(400).json({ error: "Quantity must be positive" });
  if (qty > listing.quantity) {
    return res.status(400).json({ error: `Only ${listing.quantity}kg available` });
  }

  const pricePerUnit = bidPrice != null ? Number(bidPrice) : listing.pricePerUnit;
  const totalPrice = pricePerUnit * qty;
  const type: Order["type"] = bidPrice != null ? "bulk_bid" : "consumer";

  const order = store.createOrder({
    listingId: listing.id,
    buyerId: req.user!.id,
    farmerId: listing.farmerId,
    quantity: qty,
    pricePerUnit,
    totalPrice,
    type,
    deliveryAddress,
  });

  // Stock is deducted when the order is confirmed (Phase 1 lifecycle).
  res.status(201).json(order);
});

/**
 * PATCH /api/orders/:id/status
 * Advance order lifecycle:
 *   ordered -> confirmed -> delivered  (farmer drives this)
 *   ordered -> cancelled                (buyer or farmer)
 */
const ALLOWED_TRANSITIONS: Record<Order["status"], Order["status"][]> = {
  ordered: ["confirmed", "cancelled"],
  confirmed: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

router.patch("/:id/status", requireAuth(), (req: AuthenticatedRequest, res) => {
  const order = store.findOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  const { status: newStatus } = req.body ?? {};
  if (!newStatus) return res.status(400).json({ error: "status is required" });

  const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(newStatus as Order["status"])) {
    return res.status(400).json({
      error: `Cannot move from ${order.status} to ${newStatus}`,
      allowed,
    });
  }

  const isOwner = req.user!.id === order.farmerId || req.user!.id === order.buyerId;
  if (!isOwner && req.user!.role !== "admin") {
    return res.status(403).json({ error: "Not authorized for this order" });
  }

  // Only the farmer confirms/delivers; only the buyer cancels (unless farmer cancels too)
  if (newStatus === "confirmed" || newStatus === "delivered") {
    if (req.user!.id !== order.farmerId && req.user!.role !== "admin") {
      return res.status(403).json({ error: "Only the farmer can confirm/deliver" });
    }
    // Deduct stock once the order is confirmed
    if (newStatus === "confirmed") {
      store.applyOrderToListing(order);
    }
  }

  const updated = store.updateOrderStatus(order.id, newStatus as Order["status"]);
  if (!updated) return res.status(404).json({ error: "Order not found" });
  if (updated.status === "confirmed") store.holdEscrow(updated);
  if (updated.status === "cancelled") {
    const payment = store.findEscrowByOrderId(updated.id);
    if (payment?.status === "held") store.updateEscrowStatus(updated.id, "refunded");
  }
  res.json(updated);
});

/** GET /api/orders/:id — detail (owner/admin only) */
router.get("/:id", requireAuth(), (req: AuthenticatedRequest, res) => {
  const order = store.findOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  const isOwner = req.user!.id === order.farmerId || req.user!.id === order.buyerId;
  if (!isOwner && req.user!.role !== "admin") return res.status(403).json({ error: "Not authorized" });
  res.json(order);
});

export default router;
