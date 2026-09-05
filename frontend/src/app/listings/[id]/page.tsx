"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api";
import type { Listing, Order } from "../../../lib/types";

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

  function loadListing() {
    return api
      .get<Listing>(`/listings/${id}`)
      .then((listing) => setListing(listing))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load listing"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (id) void loadListing();
  }, [user, authLoading, id]);

  async function placeOrder() {
    setSubmitting(true);
    try {
      await api.post<Order>("/orders", {
        listingId: listing!.id,
        quantity: Number(qty),
        deliveryAddress: { lat: 0, lng: 0, address: addr },
      });
      router.push("/orders");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function placeBid() {
    setSubmitting(true);
    try {
      await api.post("/bids", { listingId: listing!.id, quantity: Number(qty), proposedPrice: Number(price), message: msg });
      router.push("/orders");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  const isBulk = user?.role === "bulk_buyer";
  const isConsumer = user?.role === "consumer";

  if (authLoading || loading) return <main className="container mx-auto p-6"><p className="text-zinc-500">Loading…</p></main>;
  if (!user || !listing) return null;

    return (
    <main className="container mx-auto max-w-3xl p-6">
      <button onClick={() => router.back()} className="text-sm text-zinc-500 hover:underline">← Back</button>
      <div className="mt-4 rounded-xl border border-zinc-200 p-6">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold text-emerald-700">{listing.cropName}</h1>
          <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-800">Grade {listing.qualityGrade}</span>
        </div>
        <p className="mt-2 text-sm text-zinc-600">{listing.variety && `Variety: ${listing.variety}`}</p>
        <p className="text-sm text-zinc-600">₹{listing.pricePerUnit}/kg · {listing.quantity}kg available · Harvest {listing.harvestDate}</p>
        <p className="text-sm text-zinc-600">{listing.location.address}</p>
        {listing.fpoAggregation && <span className="inline-block mt-1 text-xs font-medium text-emerald-700">FPO-aggregated</span>}
      </div>

      {(isConsumer || isBulk) && (
        <div className="mt-6 rounded-xl border border-zinc-200 p-6">
          <div className="flex gap-4 border-b border-zinc-200 pb-3">
            {isConsumer && <button onClick={() => setAction("buy")} className={`text-sm font-medium ${action === "buy" ? "text-emerald-700 border-b-2 border-emerald-700" : "text-zinc-500"}`}>Buy Now</button>}
            {isBulk && <button onClick={() => setAction("bid")} className={`text-sm font-medium ${action === "bid" ? "text-emerald-700 border-b-2 border-emerald-700" : "text-zinc-500"}`}>Place Bid</button>}
          </div>

          {action === "buy" && (
            <form onSubmit={(e) => { e.preventDefault(); placeOrder(); }} className="mt-4 space-y-3">
              <input type="number" min={1} max={listing.quantity} placeholder={`Max ${listing.quantity} kg`} value={qty}
                onChange={(e) => setQty(e.target.value)} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" required />
              <input type="text" placeholder="Delivery address" value={addr} onChange={(e) => setAddr(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" required />
              <p className="text-sm text-zinc-600">Total: ₹{qty ? Number(qty) * listing.pricePerUnit : 0}</p>
              <button disabled={submitting} className="w-full rounded-md bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">{submitting ? "Placing…" : "Place Order"}</button>
            </form>
          )}

          {action === "bid" && (
            <form onSubmit={(e) => { e.preventDefault(); placeBid(); }} className="mt-4 space-y-3">
              <input type="number" min={1} max={listing.quantity} placeholder={`Max ${listing.quantity} kg`} value={qty}
                onChange={(e) => setQty(e.target.value)} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" required />
              <input type="number" min={0} step={0.1} placeholder="Proposed price per kg (₹)" value={price}
                onChange={(e) => setPrice(e.target.value)} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" required />
              <input type="text" placeholder="Message to farmer (optional)" value={msg} onChange={(e) => setMsg(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              <p className="text-sm text-zinc-600">Total at your price: ₹{qty && price ? Number(qty) * Number(price) : 0}</p>
              <button disabled={submitting} className="w-full rounded-md bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">{submitting ? "Sending…" : "Submit Bid"}</button>
            </form>
          )}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </main>
  );
}
