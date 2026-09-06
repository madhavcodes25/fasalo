import { Router } from "express";
import { store } from "../db/store.js";
import { requireAuth, requireFarmer, type AuthenticatedRequest } from "../middleware/auth.js";
import type { Shipment, ShipmentStatus } from "../models/index.js";

const router = Router();

// Demo-only catalogue: replace with a partner/API-backed source in production.
const COLD_STORAGES = [
  { id: "cs-nashik-01", name: "Nashik FreshHub Cold Storage", location: "Pimpalgaon Baswant, Nashik", lat: 20.009, lng: 74.105, capacityTonnes: 180, availableTonnes: 62, contact: "+91 98765 43210" },
  { id: "cs-pune-01", name: "Pune AgriCold Centre", location: "Chakan, Pune", lat: 18.756, lng: 73.863, capacityTonnes: 120, availableTonnes: 35, contact: "+91 98765 43211" },
  { id: "cs-mumbai-01", name: "Mumbai Produce Cold Chain", location: "Vashi, Navi Mumbai", lat: 19.077, lng: 73.005, capacityTonnes: 250, availableTonnes: 96, contact: "+91 98765 43212" },
];

const TRANSPORTERS = [
  { id: "tr-green-01", name: "GreenRoute Logistics", vehicleNumber: "MH 15 AB 2401", vehicleType: "Refrigerated mini truck", capacityKg: 1500, ratePerKm: 18, phone: "+91 98765 43301" },
  { id: "tr-farm-02", name: "FarmLink Transport", vehicleNumber: "MH 12 CD 7832", vehicleType: "Pickup van", capacityKg: 800, ratePerKm: 13, phone: "+91 98765 43302" },
  { id: "tr-harvest-03", name: "Harvest Haul", vehicleNumber: "MH 14 EF 5109", vehicleType: "Refrigerated truck", capacityKg: 3000, ratePerKm: 24, phone: "+91 98765 43303" },
];

router.get("/cold-storages", requireAuth(), (_req, res) => {
  res.json({ dataSource: "mock", facilities: COLD_STORAGES });
});

router.get("/transporters", requireAuth(), (req: AuthenticatedRequest, res) => {
  const orderId = typeof req.query.orderId === "string" ? req.query.orderId : undefined;
  const order = orderId ? store.findOrderById(orderId) : undefined;
  if (order && order.farmerId !== req.user!.id && order.buyerId !== req.user!.id && req.user!.role !== "admin") {
    return res.status(403).json({ error: "Not authorized for this order" });
  }
  const suitable = order ? TRANSPORTERS.filter((transporter) => transporter.capacityKg >= order.quantity) : TRANSPORTERS;
  res.json({ dataSource: "mock", transporters: suitable });
});

router.get("/shipments", requireAuth(), (req: AuthenticatedRequest, res) => {
  res.json(store.listShipmentsForUser(req.user!.id, req.user!.role));
});

router.post("/shipments", requireFarmer(), (req: AuthenticatedRequest, res) => {
  const { orderId, transporterId, estimatedDeliveryAt } = req.body ?? {};
  if (!orderId || !transporterId || !estimatedDeliveryAt) return res.status(400).json({ error: "orderId, transporterId, and estimatedDeliveryAt are required" });
  const order = store.findOrderById(orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.farmerId !== req.user!.id) return res.status(403).json({ error: "Only the order's farmer can arrange transport" });
  if (order.status !== "confirmed") return res.status(400).json({ error: "Confirm the order before scheduling transport" });
  if (store.findShipmentByOrderId(order.id)) return res.status(409).json({ error: "A shipment already exists for this order" });
  const transporter = TRANSPORTERS.find((entry) => entry.id === transporterId);
  if (!transporter) return res.status(404).json({ error: "Transporter not found" });
  const eta = new Date(estimatedDeliveryAt);
  if (Number.isNaN(eta.valueOf())) return res.status(400).json({ error: "estimatedDeliveryAt must be a valid date" });
  const shipment = store.createShipment({ orderId: order.id, transporterId: transporter.id, transporterName: transporter.name, vehicleNumber: transporter.vehicleNumber, estimatedDeliveryAt: eta.toISOString() });
  res.status(201).json(shipment);
});

const TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  scheduled: ["picked_up", "cancelled"],
  picked_up: ["in_transit", "cancelled"],
  in_transit: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

router.patch("/shipments/:id/status", requireAuth(), (req: AuthenticatedRequest, res) => {
  const shipment = store.listShipmentsForUser(req.user!.id, req.user!.role).find((entry) => entry.id === req.params.id);
  if (!shipment) return res.status(404).json({ error: "Shipment not found" });
  const { status, note } = req.body ?? {};
  if (!status || !Object.hasOwn(TRANSITIONS, status)) return res.status(400).json({ error: "A valid shipment status is required" });
  if (!TRANSITIONS[shipment.status].includes(status as ShipmentStatus)) return res.status(400).json({ error: `Cannot move from ${shipment.status} to ${status}` });
  const order = store.findOrderById(shipment.orderId)!;
  if (req.user!.id !== order.farmerId && req.user!.role !== "admin") return res.status(403).json({ error: "Only the farmer can update shipment tracking" });
  const updated = store.updateShipmentStatus(shipment.id, status as ShipmentStatus, typeof note === "string" ? note : undefined)!;
  if (updated.status === "delivered" && order.status === "confirmed") store.updateOrderStatus(order.id, "delivered");
  if (updated.status === "cancelled" && order.status === "confirmed") store.updateOrderStatus(order.id, "cancelled");
  res.json(updated);
});

export default router;
