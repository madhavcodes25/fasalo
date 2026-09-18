"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api";
import type { Listing, Order } from "../../../lib/types";

const GRADE_COLORS: Record<string, string> = {
  A: "bg-green-100 text-green-800", B: "bg-blue-100 text-blue-800",
  C: "bg-amber-100 text-amber-800", D: "bg-zinc-100 text-zinc-600",
};
const CROP_EMOJIS: Record<string, string> = {
  tomato: "🍅", onion: "🧅", potato: "🥔", okra: "🥬", wheat: "🌾",
  corn: "🌽", mango: "🥭", garlic: "🧄", cauliflower: "🥦",
};
function cropEmoji(name: string) { return CROP_EMOJIS[name.toLowerCase()] ?? "🌱"; }

export default function ListingDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [action, setAction] = useState<"buy" | "bid" | null>(null);
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [addr, setAddr] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }
    if (id) void api.get<Listing>(`/listings/${id}`)
      .then(setListing)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [user, authLoading, id]);

  // Auto-open the correct tab for the user's role
  useEffect(() => {
    if (!user || !listing) return;
    if (user.role === "consumer" && !action) setAction("buy");
    if (user.role === "bulk_buyer" && !action) setAction("bid");
  }, [user, listing]);

  async function placeOrder() {
    setSubmitting(true); setError("");
    try {
      await api.post<Order>("/orders", {
        listingId: listing!.id, quantity: Number(qty),
        deliveryAddress: { lat: 0, lng: 0, address: addr || "Not specified" },
      });
      setSuccess("Order placed successfully! Redirecting to orders…");
      setTimeout(() => router.push("/orders"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally { setSubmitting(false); }
  }

  async function placeBid() {
    setSubmitting(true); setError("");
    try {
      await api.post("/bids", { listingId: listing!.id, quantity: Number(qty), proposedPrice: Number(price), message: msg });
      setSuccess("Bid submitted! The farmer will review your offer.");
      setTimeout(() => router.push("/orders"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit bid");
    } finally { setSubmitting(false); }
  }

  const isBulk = user?.role === "bulk_buyer";
  const isConsumer = user?.role === "consumer";
  const canOrder = isConsumer || isBulk;

  if (authLoading || loading) return (
    <main className="container mx-auto max-w-3xl p-8 flex justify-center">
      <div className="text-center"><div className="text-4xl animate-bounce mb-3">🌱</div><p className="text-zinc-500">Loading…</p></div>
    </main>
  );
  if (!user || !listing) return null;

  const totalPrice = qty ? Number(qty) * listing.pricePerUnit : 0;
  const bidTotal = qty && price ? Number(qty) * Number(price) : 0;

  return (
    <main className="container mx-auto max-w-5xl p-6">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-6 transition-colors">
        ← Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — listing info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Hero card */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-50 to-green-100 px-8 py-6 flex items-center gap-4">
              <span className="text-6xl">{cropEmoji(listing.cropName)}</span>
              <div>
                <h1 className="text-3xl font-extrabold text-zinc-900">{listing.cropName}</h1>
                {listing.variety && <p className="text-zinc-500 text-sm mt-1">Variety: {listing.variety}</p>}
                {listing.fpoAggregation && (
                  <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">FPO Aggregated</span>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-zinc-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-zinc-900">₹{listing.pricePerUnit}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">per kg</div>
                </div>
                <div className="bg-zinc-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-zinc-900">{listing.quantity}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">kg available</div>
                </div>
                <div className="bg-zinc-50 rounded-xl p-3 text-center">
                  <div className={`text-sm font-bold px-2 py-1 rounded-lg inline-block ${GRADE_COLORS[listing.qualityGrade]}`}>Grade {listing.qualityGrade}</div>
                  <div className="text-xs text-zinc-500 mt-1">Quality</div>
                </div>
                <div className="bg-zinc-50 rounded-xl p-3 text-center">
                  <div className="text-sm font-bold text-zinc-900">{listing.harvestDate}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Harvest date</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
                <span>📍</span>
                <span>{listing.location.address || "Nashik, Maharashtra"}</span>
              </div>
            </div>
          </div>

          {/* Why direct? */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
            <h3 className="font-semibold text-emerald-900 mb-2">✅ Why buy direct from Fasalo?</h3>
            <ul className="text-sm text-emerald-800 space-y-1">
              <li>• Payment held in escrow — released only on confirmed delivery</li>
              <li>• No mandi commissions or middlemen markup</li>
              <li>• Fresher produce — shorter supply chain</li>
            </ul>
          </div>
        </div>

        {/* Right — order/bid panel */}
        <div className="lg:col-span-1">
          {canOrder ? (
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm sticky top-20">
              {/* Tabs */}
              {isConsumer && isBulk ? (
                <div className="flex border-b border-zinc-100">
                  <button onClick={() => setAction("buy")} className={`flex-1 py-3 text-sm font-semibold transition-colors ${action === "buy" ? "text-emerald-700 border-b-2 border-emerald-600" : "text-zinc-500 hover:text-zinc-700"}`}>Buy Now</button>
                  <button onClick={() => setAction("bid")} className={`flex-1 py-3 text-sm font-semibold transition-colors ${action === "bid" ? "text-emerald-700 border-b-2 border-emerald-600" : "text-zinc-500 hover:text-zinc-700"}`}>Place Bid</button>
                </div>
              ) : (
                <div className="px-5 pt-4 pb-2">
                  <h2 className="font-bold text-zinc-900">{isConsumer ? "Place Order" : "Submit Bulk Bid"}</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">{isConsumer ? "Direct purchase at listed price" : "Negotiate price for large volumes"}</p>
                </div>
              )}

              <div className="p-5">
                {success && (
                  <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
                    ✅ {success}
                  </div>
                )}
                {error && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    {error}
                  </div>
                )}

                {action === "buy" && (
                  <form onSubmit={(e) => { e.preventDefault(); void placeOrder(); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Quantity (kg)</label>
                      <input type="number" min={1} max={listing.quantity} placeholder={`Max ${listing.quantity} kg`}
                        value={qty} onChange={(e) => setQty(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Delivery address</label>
                      <input type="text" placeholder="Your delivery address"
                        value={addr} onChange={(e) => setAddr(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all" required />
                    </div>
                    {qty && (
                      <div className="bg-emerald-50 rounded-xl p-3 text-sm">
                        <div className="flex justify-between font-semibold text-emerald-900">
                          <span>Total</span>
                          <span>₹{totalPrice.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-emerald-600 mt-1">Held in escrow until delivery confirmed</p>
                      </div>
                    )}
                    <button type="submit" disabled={submitting}
                      className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm text-sm">
                      {submitting ? "Placing order…" : "🛒 Place Order"}
                    </button>
                  </form>
                )}

                {action === "bid" && (
                  <form onSubmit={(e) => { e.preventDefault(); void placeBid(); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Quantity (kg)</label>
                      <input type="number" min={1} max={listing.quantity} placeholder={`Max ${listing.quantity} kg`}
                        value={qty} onChange={(e) => setQty(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Your price per kg (₹)</label>
                      <input type="number" min={0} step={0.5} placeholder={`Listed: ₹${listing.pricePerUnit}/kg`}
                        value={price} onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Message to farmer</label>
                      <input type="text" placeholder="Optional note…"
                        value={msg} onChange={(e) => setMsg(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all" />
                    </div>
                    {qty && price && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Your offer total</span>
                          <span>₹{bidTotal.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-amber-700 mt-1">Farmer will review and accept/reject your bid</p>
                      </div>
                    )}
                    <button type="submit" disabled={submitting}
                      className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-all shadow-sm text-sm">
                      {submitting ? "Submitting…" : "📤 Submit Bid"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-sm text-zinc-500">
              <p>Farmers cannot place orders on their own listings.</p>
              <p className="mt-2">Switch to a consumer account to purchase.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
