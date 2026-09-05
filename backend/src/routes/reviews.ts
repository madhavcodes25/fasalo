import { Router } from "express";
import { store } from "../db/store.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

router.get("/users/:userId", (req, res) => res.json(store.listReviewsForUser(req.params.userId)));

router.post("/", requireAuth(), (req: AuthenticatedRequest, res) => {
  const { orderId, rating, comment } = req.body ?? {};
  const order = store.findOrderById(orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.status !== "delivered") return res.status(400).json({ error: "Reviews are available after delivery" });
  const isBuyer = req.user!.id === order.buyerId;
  const isFarmer = req.user!.id === order.farmerId;
  if (!isBuyer && !isFarmer) return res.status(403).json({ error: "Not authorized" });
  const score = Number(rating);
  if (!Number.isInteger(score) || score < 1 || score > 5) return res.status(400).json({ error: "rating must be an integer from 1 to 5" });
  if (store.findReview(order.id, req.user!.id)) return res.status(409).json({ error: "You have already reviewed this order" });
  res.status(201).json(store.createReview({ orderId: order.id, authorId: req.user!.id, recipientId: isBuyer ? order.farmerId : order.buyerId, rating: score, comment: typeof comment === "string" ? comment : undefined }));
});

export default router;
