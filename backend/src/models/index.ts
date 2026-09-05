/**
 * Shared domain models for Fasalo.
 *
 * All models here are plain TypeScript types/interfaces. Persistence is
 * implemented in src/db/store.ts (file-backed JSON for hackathon demo; the
 * production target is PostgreSQL via docker-compose.yml).
 */

export type UserRole =
  | "farmer"
  | "fpo"
  | "consumer"
  | "bulk_buyer"
  | "admin";

export interface User {
  id: string; // uuid
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  // Farmer / FPO fields
  farmSizeAcres?: number;
  village?: string;
  // Consumer / buyer fields
  defaultDeliveryAddress?: Address;
  // Metadata
  kycVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  lat: number;
  lng: number;
  address: string;
}

export interface Listing {
  id: string;
  farmerId: string; // user id of the farmer / FPO
  cropName: string;
  variety?: string;
  quantity: number; // in kg
  unit: "kg";
  pricePerUnit: number; // INR per kg
  qualityGrade: "A" | "B" | "C" | "D";
  harvestDate: string; // ISO date string
  location: Address;
  fpoAggregation: boolean; // pooled produce from multiple small farmers
  status: "active" | "sold_out" | "draft";
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = "ordered" | "confirmed" | "delivered" | "cancelled";

export interface Order {
  id: string;
  listingId: string;
  buyerId: string;
  farmerId: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  /** For bulk buyers negotiating a different price; present when type === 'bulk_bid' */
  bidPrice?: number;
  type: "consumer" | "bulk_bid";
  status: OrderStatus;
  deliveryAddress: Address;
  /** ISO timestamp when status last transitioned */
  statusUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type BidStatus = "pending" | "accepted" | "rejected";

export interface Bid {
  id: string;
  listingId: string;
  buyerId: string;
  quantity: number;
  proposedPrice: number; // INR per kg
  message?: string;
  status: BidStatus;
  /** orderId created when the bid is accepted (undefined until then) */
  orderId?: string;
  createdAt: string;
  updatedAt: string;
}

/** Demo-only KYC record. No identity document is stored in Fasalo. */
export interface KycRecord {
  id: string;
  userId: string;
  status: "not_started" | "submitted" | "verified" | "rejected";
  submittedAt?: string;
  verifiedAt?: string;
  updatedAt: string;
}

/** Demo escrow ledger; it deliberately does not call a payment provider. */
export interface EscrowPayment {
  id: string;
  orderId: string;
  amount: number;
  currency: "INR";
  status: "held" | "released" | "refunded";
  heldAt: string;
  releasedAt?: string;
  refundedAt?: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  authorId: string;
  recipientId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  raisedById: string;
  reason: string;
  status: "open" | "in_review" | "resolved" | "rejected";
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  users: User[];
  listings: Listing[];
  orders: Order[];
  bids: Bid[];
  kycRecords: KycRecord[];
  escrowPayments: EscrowPayment[];
  reviews: Review[];
  disputes: Dispute[];
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
