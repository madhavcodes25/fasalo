/**
 * Data-access layer for Fasalo.
 *
 * WARNING: Demo-only implementation. A singleton store backed by a local JSON
 * file (data/store.json). This keeps Phase 1 fully runnable without Docker/
 * PostgreSQL on the dev machine.
 *
 * The production target is PostgreSQL (see docker-compose.yml). Swapping this
 * module for a Postgres-backed implementation is the intended Phase 2 upgrade
 * path — route handlers depend only on the Store interface from src/models, so
 * the change is localized to this file.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { v4 as uuidv4 } from "uuid";
import { type Bid, type BidStatus, type Dispute, type EscrowPayment, type KycRecord, type Listing, type Order, type PaginatedResult, type Review, type Shipment, type ShipmentStatus, type Store, type User } from "../models/index.js";

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "store.json");

function loadStore(): Store {
  if (existsSync(STORE_PATH)) {
    try {
      const saved = JSON.parse(readFileSync(STORE_PATH, "utf-8")) as Partial<Store>;
      return {
        users: saved.users ?? [], listings: saved.listings ?? [], orders: saved.orders ?? [], bids: saved.bids ?? [],
        kycRecords: saved.kycRecords ?? [], escrowPayments: saved.escrowPayments ?? [],
        reviews: saved.reviews ?? [], disputes: saved.disputes ?? [], shipments: saved.shipments ?? [],
      };
    } catch { /* corrupt file — fall back to empty */ }
  }
  return { users: [], listings: [], orders: [], bids: [], kycRecords: [], escrowPayments: [], reviews: [], disputes: [], shipments: [] };
}

export class FasaloStore {
  private data: Store;

  private constructor(data: Store) {
    this.data = data;
  }

  static create(): FasaloStore {
    return new FasaloStore(loadStore());
  }

  private save(): void {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(STORE_PATH, JSON.stringify(this.data, null, 2), "utf-8");
  }

  private newId(): string {
    return uuidv4();
  }

  private now(): string {
    return new Date().toISOString();
  }

  // ──────────────────────── Users ───────────────────────
  findUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  createUser(input: Omit<User, "id" | "createdAt" | "updatedAt">): User {
    if (this.findUserByEmail(input.email)) {
      throw new Error("User already exists with that email");
    }
    const now = this.now();
    const user: User = { ...input, id: this.newId(), createdAt: now, updatedAt: now };
    this.data.users.push(user);
    this.save();
    return { ...user };
  }

  updateUser(id: string, patch: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): User | undefined {
    const user = this.findUserById(id);
    if (!user) return undefined;
    Object.assign(user, patch, { updatedAt: this.now() });
    this.save();
    return { ...user };
  }

  // ──────────────────── Listings ───────────────────
  findListingById(id: string): Listing | undefined {
    return this.data.listings.find((l) => l.id === id);
  }

  listListings(opts?: {
    cropName?: string;
    qualityGrade?: string;
    farmerId?: string;
    status?: Listing["status"];
  }): Listing[] {
    let results = this.data.listings;
    if (opts?.cropName)
      results = results.filter((l) => l.cropName.toLowerCase().includes(opts.cropName!.toLowerCase()));
    if (opts?.qualityGrade) results = results.filter((l) => l.qualityGrade === opts.qualityGrade);
    if (opts?.farmerId) results = results.filter((l) => l.farmerId === opts.farmerId);
    if (opts?.status) results = results.filter((l) => l.status === opts.status);
    return results.map((l) => ({ ...l }));
  }

  createListing(input: Omit<Listing, "id" | "createdAt" | "updatedAt">): Listing {
    const now = this.now();
    const listing: Listing = { ...input, id: this.newId(), createdAt: now, updatedAt: now };
    this.data.listings.push(listing);
    this.save();
    return { ...listing };
  }

  updateListing(
    id: string,
    patch: Partial<Omit<Listing, "id" | "createdAt" | "updatedAt">>,
  ): Listing | undefined {
    const listing = this.findListingById(id);
    if (!listing) return undefined;
    Object.assign(listing, patch, { updatedAt: this.now() });
    this.save();
    return { ...listing };
  }

  // ────────────────────── Orders ──────────────────────
  findOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id);
  }

  listOrdersForUser(userId: string, role: User["role"]): Order[] {
    if (role === "admin") return this.data.orders.map((o) => ({ ...o }));
    if (role === "farmer" || role === "fpo") {
      return this.data.orders.filter((o) => o.farmerId === userId).map((o) => ({ ...o }));
    }
    return this.data.orders.filter((o) => o.buyerId === userId).map((o) => ({ ...o }));
  }

  listOrders(opts?: { status?: Order["status"] }): Order[] {
    let results = this.data.orders;
    if (opts?.status) results = results.filter((o) => o.status === opts!.status);
    return results.map((o) => ({ ...o }));
  }

  createOrder(input: Omit<Order, "id" | "createdAt" | "updatedAt" | "statusUpdatedAt" | "status">): Order {
    const now = this.now();
    const order: Order = {
      ...input,
      id: this.newId(),
      status: "ordered",
      statusUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    this.data.orders.push(order);
    this.save();
    return { ...order };
  }

  updateOrderStatus(id: string, status: Order["status"]): Order | undefined {
    const order = this.findOrderById(id);
    if (!order) return undefined;
    order.status = status;
    order.statusUpdatedAt = this.now();
    order.updatedAt = this.now();
    this.save();
    return { ...order };
  }

  applyOrderToListing(order: Order): void {
    const listing = this.findListingById(order.listingId);
    if (!listing) return;
    listing.quantity = Math.max(0, listing.quantity - order.quantity);
    if (listing.quantity === 0) listing.status = "sold_out";
    listing.updatedAt = this.now();
    this.save();
  }

  // ─────────────────────── Bids ───────────────────────
  findBidById(id: string): Bid | undefined {
    return this.data.bids.find((b) => b.id === id);
  }

  listBidsForListing(listingId: string, farmerId?: string): Bid[] {
    let results = this.data.bids.filter((b) => b.listingId === listingId);
    if (farmerId) {
      const listing = this.findListingById(listingId);
      if (!listing || listing.farmerId !== farmerId) results = [];
    }
    return results.map((b) => ({ ...b }));
  }

  createBid(input: Omit<Bid, "id" | "createdAt" | "updatedAt" | "status">): Bid {
    const now = this.now();
    const bid: Bid = {
      ...input,
      id: this.newId(),
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    this.data.bids.push(bid);
    this.save();
    return { ...bid };
  }

  updateBidStatus(id: string, status: BidStatus, orderId?: string): Bid | undefined {
    const bid = this.findBidById(id);
    if (!bid) return undefined;
    bid.status = status;
    if (orderId) bid.orderId = orderId;
    bid.updatedAt = this.now();
    this.save();
    return { ...bid };
  }

  // ----- Phase 2: KYC, escrow, reviews, and disputes -----
  getKycRecord(userId: string): KycRecord | undefined {
    return this.data.kycRecords.find((record) => record.userId === userId);
  }

  submitKyc(userId: string): KycRecord {
    const now = this.now();
    const existing = this.getKycRecord(userId);
    if (existing) {
      existing.status = "submitted";
      existing.submittedAt = now;
      existing.updatedAt = now;
      this.save();
      return { ...existing };
    }
    const record: KycRecord = { id: this.newId(), userId, status: "submitted", submittedAt: now, updatedAt: now };
    this.data.kycRecords.push(record);
    this.save();
    return { ...record };
  }

  mockVerifyKyc(userId: string): KycRecord {
    const now = this.now();
    const record = this.getKycRecord(userId) ?? this.submitKyc(userId);
    record.status = "verified";
    record.verifiedAt = now;
    record.updatedAt = now;
    this.updateUser(userId, { kycVerified: true });
    this.save();
    return { ...record };
  }

  findEscrowByOrderId(orderId: string): EscrowPayment | undefined {
    return this.data.escrowPayments.find((payment) => payment.orderId === orderId);
  }

  holdEscrow(order: Order): EscrowPayment {
    const existing = this.findEscrowByOrderId(order.id);
    if (existing) return { ...existing };
    const now = this.now();
    const payment: EscrowPayment = { id: this.newId(), orderId: order.id, amount: order.totalPrice, currency: "INR", status: "held", heldAt: now, updatedAt: now };
    this.data.escrowPayments.push(payment);
    this.save();
    return { ...payment };
  }

  updateEscrowStatus(orderId: string, status: EscrowPayment["status"]): EscrowPayment | undefined {
    const payment = this.findEscrowByOrderId(orderId);
    if (!payment) return undefined;
    const now = this.now();
    payment.status = status;
    payment.updatedAt = now;
    if (status === "released") payment.releasedAt = now;
    if (status === "refunded") payment.refundedAt = now;
    this.save();
    return { ...payment };
  }

  createReview(input: Omit<Review, "id" | "createdAt">): Review {
    const review: Review = { ...input, id: this.newId(), createdAt: this.now() };
    this.data.reviews.push(review);
    this.save();
    return { ...review };
  }

  findReview(orderId: string, authorId: string): Review | undefined {
    return this.data.reviews.find((review) => review.orderId === orderId && review.authorId === authorId);
  }

  listReviewsForUser(userId: string): Review[] {
    return this.data.reviews.filter((review) => review.recipientId === userId).map((review) => ({ ...review }));
  }

  createDispute(input: Omit<Dispute, "id" | "createdAt" | "updatedAt" | "status">): Dispute {
    const now = this.now();
    const dispute: Dispute = { ...input, id: this.newId(), status: "open", createdAt: now, updatedAt: now };
    this.data.disputes.push(dispute);
    this.save();
    return { ...dispute };
  }

  findDisputeById(id: string): Dispute | undefined { return this.data.disputes.find((dispute) => dispute.id === id); }

  listDisputesForUser(userId: string): Dispute[] {
    return this.data.disputes.filter((dispute) => {
      const order = this.findOrderById(dispute.orderId);
      return dispute.raisedById === userId || order?.farmerId === userId || order?.buyerId === userId;
    }).map((dispute) => ({ ...dispute }));
  }

  updateDispute(id: string, patch: Pick<Dispute, "status"> & Partial<Pick<Dispute, "resolution">>): Dispute | undefined {
    const dispute = this.findDisputeById(id);
    if (!dispute) return undefined;
    Object.assign(dispute, patch, { updatedAt: this.now() });
    this.save();
    return { ...dispute };
  }

  // ─────────────────── Phase 3: Logistics ───────────────────
  findShipmentByOrderId(orderId: string): Shipment | undefined {
    return this.data.shipments.find((shipment) => shipment.orderId === orderId);
  }

  listShipmentsForUser(userId: string, role: User["role"]): Shipment[] {
    if (role === "admin") return this.data.shipments.map((shipment) => ({ ...shipment, events: [...shipment.events] }));
    return this.data.shipments
      .filter((shipment) => {
        const order = this.findOrderById(shipment.orderId);
        return order?.farmerId === userId || order?.buyerId === userId;
      })
      .map((shipment) => ({ ...shipment, events: [...shipment.events] }));
  }

  createShipment(input: Omit<Shipment, "id" | "createdAt" | "updatedAt" | "status" | "events">): Shipment {
    const now = this.now();
    const shipment: Shipment = {
      ...input,
      id: this.newId(),
      status: "scheduled",
      events: [{ status: "scheduled", note: "Transport scheduled", occurredAt: now }],
      createdAt: now,
      updatedAt: now,
    };
    this.data.shipments.push(shipment);
    this.save();
    return { ...shipment, events: [...shipment.events] };
  }

  updateShipmentStatus(id: string, status: ShipmentStatus, note?: string): Shipment | undefined {
    const shipment = this.data.shipments.find((entry) => entry.id === id);
    if (!shipment) return undefined;
    const now = this.now();
    shipment.status = status;
    shipment.updatedAt = now;
    shipment.events.push({ status, note: note?.trim() || status.replaceAll("_", " "), occurredAt: now });
    this.save();
    return { ...shipment, events: [...shipment.events] };
  }

  // Pagination helper
  paginate<T>(items: T[], page: number, limit: number): PaginatedResult<T> {
    const total = items.length;
    const start = (page - 1) * limit;
    const data = items.slice(start, start + limit);
    return { data, total, page, limit };
  }
}

export const store = FasaloStore.create();

export type { Bid, Listing, Order, PaginatedResult, User, UserRole, BidStatus, KycRecord, EscrowPayment, Review, Dispute, Shipment, ShipmentStatus } from "../models/index.js";
