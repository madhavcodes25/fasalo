/**
 * Shared TypeScript types used by the Fasalo frontend.
 *
 * These mirror the backend domain models (backend/src/models/index.ts). They are
 * duplicated here to keep the frontend build self-contained — the frontend does
 * not import from the backend package directly.
 */
export type UserRole = "farmer" | "fpo" | "consumer" | "bulk_buyer" | "admin";

export interface Address {
  lat: number;
  lng: number;
  address: string;
}

export interface Listing {
  id: string;
  farmerId: string;
  cropName: string;
  variety?: string;
  quantity: number;
  unit: "kg";
  pricePerUnit: number;
  qualityGrade: "A" | "B" | "C" | "D";
  harvestDate: string;
  location: Address;
  fpoAggregation: boolean;
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
  bidPrice?: number;
  type: "consumer" | "bulk_bid";
  status: OrderStatus;
  deliveryAddress: Address;
  statusUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  listingId: string;
  buyerId: string;
  quantity: number;
  proposedPrice: number;
  message?: string;
  status: "pending" | "accepted" | "rejected";
  orderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  village?: string;
  farmSizeAcres?: number;
  kycVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  defaultDeliveryAddress?: Address;
}
