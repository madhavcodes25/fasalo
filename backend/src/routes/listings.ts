import { Router } from "express";
import { store } from "../db/store.js";
import { requireFarmer, type AuthenticatedRequest } from "../middleware/auth.js";
import type { Listing } from "../models/index.js";

const router = Router();

const VALID_GRADES = ["A", "B", "C", "D"] as const;

function parseLocation(body: any) {
  // Accept either a structured object or simple string fallback coordinates
  if (body.location && typeof body.location === "object") {
    return {
      lat: Number(body.location.lat),
      lng: Number(body.location.lng),
      address: body.location.address ?? "",
    };
  }
  return { lat: 0, lng: 0, address: body.locationAddress || "" };
}

/**
 * GET /api/listings
 * Browse all active listings (public). Supports filters:
 *   ?cropName=Tomato&qualityGrade=A&farmerId=<id>
 * A farmer can pass ?mine=true to see only their own listings (requires auth).
 */
router.get("/", (req, res) => {
  const { cropName, qualityGrade, farmerId, mine, status } = req.query;

  const opts: Parameters<typeof store.listListings>[0] = {};
  if (typeof cropName === "string") opts.cropName = cropName;
  if (typeof qualityGrade === "string") opts.qualityGrade = qualityGrade as Listing["qualityGrade"];
  if (typeof farmerId === "string") opts.farmerId = farmerId;
  if (typeof status === "string") opts.status = status as Listing["status"];

  // If the farmer wants their own listings, require auth
  let result = store.listListings(opts);
  if (mine === "true") {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      return res.status(401).json({ error: "Auth required for ?mine=true" });
    }
    if (user.role !== "farmer" && user.role !== "fpo") {
      return res.status(403).json({ error: "Only farmers can use ?mine=true" });
    }
    result = store.listListings({ ...opts, farmerId: user.id });
  }

  res.json(result);
});

/** POST /api/listings — create a crop listing (farmer/FPO only) */
router.post("/", requireFarmer(), (req: AuthenticatedRequest, res) => {
  const body = req.body ?? {};
  const { cropName, variety, quantity, pricePerUnit, qualityGrade, harvestDate, fpoAggregation } = body;

  if (!cropName || quantity == null || pricePerUnit == null || !qualityGrade || !harvestDate) {
    return res.status(400).json({
      error: "cropName, quantity, pricePerUnit, qualityGrade, harvestDate are required",
    });
  }
  if (!VALID_GRADES.includes(qualityGrade as any)) {
    return res.status(400).json({ error: `qualityGrade must be one of: ${VALID_GRADES.join(", ")}` });
  }

  const listing = store.createListing({
    farmerId: req.user!.id,
    cropName,
    variety,
    quantity: Number(quantity),
    unit: "kg",
    pricePerUnit: Number(pricePerUnit),
    qualityGrade: qualityGrade as Listing["qualityGrade"],
    harvestDate,
    location: parseLocation(body),
    fpoAggregation: !!fpoAggregation,
    status: "active",
  });

  res.status(201).json(listing);
});

/** GET /api/listings/:id — listing detail */
router.get("/:id", (req, res) => {
  const listing = store.findListingById(req.params.id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  res.json(listing);
});

/** PATCH /api/listings/:id — update a listing (farmer/FPO owner only) */
router.patch("/:id", requireFarmer(), (req: AuthenticatedRequest, res) => {
  const listing = store.findListingById(req.params.id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  if (listing.farmerId !== req.user!.id) {
    return res.status(403).json({ error: "You do not own this listing" });
  }

  const patch: Record<string, unknown> = { ...(req.body ?? {}) };
  delete patch.id;
  delete patch.farmerId;
  delete patch.createdAt;
  const updated = store.updateListing(req.params.id, patch);
  if (!updated) return res.status(404).json({ error: "Listing not found" });
  res.json(updated);
});

export default router;
