import { Router } from "express";
import { store } from "../db/store.js";
import { requireFarmer, requireBuyer, type AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

/**
 * POST /api/bids
 * Submit a bid/negotiation proposal against a listing (bulk buyer).
 * Body: { listingId, quantity, proposedPrice, message? }
 */
router.post("/", requireBuyer(), (req: AuthenticatedRequest, res) => {
  const { listingId, quantity, proposedPrice, message } = req.body ?? {};

  if (!listingId || quantity == null || proposedPrice == null) {
    return res.status(400).json({ error: "listingId, quantity, proposedPrice are required" });
  }

  const listing = store.findListingById(listingId);
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  if (listing.status !== "active") return res.status(400).json({ error: "Listing not available" });

  const qty = Number(quantity);
  if (qty <= 0) return res.status(400).json({ error: "Quantity must be positive" });
  if (qty > listing.quantity) {
    return res.status(400).json({ error: `Only ${listing.quantity}kg available` });
  }

  const bid = store.createBid({
    listingId: listing.id,
    buyerId: req.user!.id,
    quantity: qty,
    proposedPrice: Number(proposedPrice),
    message,
  });

  res.status(201).json(bid);
});

/**
 * GET /api/bids?listingId=<id>
 * Farmer: list pending bids on a listing they own.
 */
router.get("/", requireFarmer(), (req: AuthenticatedRequest, res) => {
  const { listingId } = req.query;
  if (typeof listingId !== "string") {
    return res.status(400).json({ error: "listingId query param required" });
  }
  const bids = store.listBidsForListing(listingId, req.user!.id);
  res.json(bids);
});

/**
 * PATCH /api/bids/:id  { action: "accept" | "reject" }
 * Farmer accepts (→ order created, stock deducted) or rejects a bid.
 */
router.patch("/:id", requireFarmer(), (req: AuthenticatedRequest, res) => {
  const bid = store.findBidById(req.params.id);
  if (!bid) return res.status(404).json({ error: "Bid not found" });

  // Ensure the farmer owns the listing the bid is against
  const listing = store.findListingById(bid.listingId);
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  if (listing.farmerId !== req.user!.id) {
    return res.status(403).json({ error: "You do not own this listing" });
  }

  if (bid.status !== "pending") {
    return res.status(400).json({ error: `Bid already ${bid.status}` });
  }

  const { action } = req.body ?? {};
  if (action === "reject") {
    const updated = store.updateBidStatus(bid.id, "rejected");
    return res.json(updated);
  }

  if (action === "accept") {
    if (bid.quantity > listing.quantity) {
      return res.status(400).json({ error: `Not enough stock: ${listing.quantity}kg left` });
    }
    // Accepting a bid creates a bulk-bid order at the negotiated price, already confirmed.
    const order = store.createOrder({
      listingId: listing.id,
      buyerId: bid.buyerId,
      farmerId: listing.farmerId,
      quantity: bid.quantity,
      pricePerUnit: bid.proposedPrice,
      totalPrice: bid.proposedPrice * bid.quantity,
      type: "bulk_bid",
      deliveryAddress: { lat: 0, lng: 0, address: "To be confirmed" }, // negotiated deals resolve address later; Phase 1 simplification
    });
        store.applyOrderToListing(order);
    // Accepting a bid confirms the order immediately (price already settled).
    const confirmedOrder = store.updateOrderStatus(order.id, "confirmed");
    const updated = store.updateBidStatus(bid.id, "accepted", order.id);
    return res.json({ bid: updated, order: confirmedOrder });
  }

  return res.status(400).json({ error: 'action must be "accept" or "reject"' });
});

export default router;
