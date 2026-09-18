"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { Order, Shipment, Listing, User } from "../../lib/types";
import Link from "next/link";

const STATUS_COLORS: Record<Order["status"], string> = {
  ordered: "bg-blue-100 text-blue-800",
  confirmed: "bg-amber-100 text-amber-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [listingsMap, setListingsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function loadData() {
    return Promise.all([
      api.get<Order[]>("/orders"),
      api.get<Shipment[]>("/logistics/shipments"),
      api.get<Listing[]>("/listings")
    ])
      .then(([ordersData, shipmentsData, listingsData]) => {
        setOrders(ordersData);
        setShipments(shipmentsData);
        const map: Record<string, string> = {};
        listingsData.forEach(l => { map[l.id] = l.cropName; });
        setListingsMap(map);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load orders"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }
    void loadData();
  }, [user, authLoading]);

  async function updateStatus(id: string, status: Order["status"]) {
    try {
      await api.patch<Order>(`/orders/${id}/status`, { status });
      void loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  }

  if (authLoading || loading) {
    return <main className="container mx-auto p-8 flex justify-center"><div className="text-center"><div className="text-4xl animate-bounce mb-3">📦</div><p className="text-zinc-500">Loading orders…</p></div></main>;
  }
  if (!user) return null;

  const isFarmer = user.role === "farmer" || user.role === "fpo";

  return (
    <main className="container mx-auto max-w-5xl p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          {isFarmer ? "Orders on Your Produce" : "My Purchases"}
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Manage your order history and track deliveries.</p>
      </div>

      {error && <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-300">
          <div className="text-4xl mb-4">🛒</div>
          <h3 className="text-lg font-semibold text-zinc-700 mb-2">No orders yet</h3>
          <p className="text-zinc-500 text-sm mb-6">Looks like you haven&apos;t placed any orders yet.</p>
          <Link href="/browse" className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm text-sm">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const shipment = shipments.find((entry) => entry.orderId === o.id);
            const cropName = listingsMap[o.listingId] || "Unknown Crop";
            return (
              <div key={o.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-zinc-900 text-lg">{cropName}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">Order #{o.id.slice(0, 8)} • {new Date(o.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[o.status]}`}>
                      {o.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    <div className="bg-zinc-50 rounded-xl p-3">
                      <div className="text-xs text-zinc-500 mb-1">Quantity</div>
                      <div className="font-bold text-zinc-900">{o.quantity} kg</div>
                    </div>
                    <div className="bg-zinc-50 rounded-xl p-3">
                      <div className="text-xs text-zinc-500 mb-1">Price/kg</div>
                      <div className="font-bold text-zinc-900">₹{o.pricePerUnit}</div>
                    </div>
                    <div className="bg-zinc-50 rounded-xl p-3 sm:col-span-2">
                      <div className="text-xs text-zinc-500 mb-1">Total Amount</div>
                      <div className="font-bold text-emerald-700 text-lg">₹{o.totalPrice.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-sm">
                      <span className="text-zinc-500">Order type: </span>
                      <span className="font-medium text-zinc-800">{o.type === "bulk_bid" ? "Bulk bid negotiation" : "Consumer purchase"}</span>
                    </div>
                    
                    {/* Status UI */}
                    {shipment ? (
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                        <span className="text-sm">🚚</span>
                        <span className="text-xs font-semibold text-blue-800 capitalize">{shipment.status.replaceAll("_", " ")}</span>
                      </div>
                    ) : o.status === "confirmed" ? (
                      <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                        <span className="text-sm">⏳</span>
                        <span className="text-xs font-semibold text-amber-800">Awaiting dispatch</span>
                      </div>
                    ) : o.status === "ordered" ? (
                      <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        <span className="text-sm">🔒</span>
                        <span className="text-xs font-semibold text-emerald-800">Payment in Escrow</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Farmer Action Sidebar */}
                {isFarmer && (
                  <div className="bg-zinc-50 p-6 md:w-64 border-t md:border-t-0 md:border-l border-zinc-200 flex flex-col justify-center gap-3">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Actions</h4>
                    
                    {o.status === "ordered" && (
                      <button onClick={() => updateStatus(o.id, "confirmed")}
                        className="w-full py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm">
                        Confirm Order
                      </button>
                    )}
                    
                    {o.status === "confirmed" && !shipment && (
                      <Link href="/logistics"
                        className="w-full py-2.5 bg-emerald-600 text-white text-center text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm">
                        Schedule Transport
                      </Link>
                    )}

                    {o.status === "confirmed" && shipment?.status === "delivered" && (
                      <button onClick={() => updateStatus(o.id, "delivered")}
                        className="w-full py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-all shadow-sm">
                        Mark Order Complete
                      </button>
                    )}

                    {o.status === "delivered" && (
                      <div className="text-center p-3 bg-green-100 text-green-800 rounded-xl text-sm font-semibold">
                        ✅ Escrow Released
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
