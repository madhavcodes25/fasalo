"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { Order, Shipment, Listing } from "../../lib/types";
import Link from "next/link";

const STATUS_COLORS: Record<Order["status"], { bg: string; text: string }> = {
  ordered: { bg: "#eff6ff", text: "#1d4ed8" },
  confirmed: { bg: "#fffbeb", text: "#d97706" },
  delivered: { bg: "#f2f9f0", text: "#2d6324" },
  cancelled: { bg: "#fee2e2", text: "#dc2626" },
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
      api.get<Listing[]>("/listings"),
    ]).then(([ordersData, shipmentsData, listingsData]) => {
      setOrders(ordersData);
      setShipments(shipmentsData);
      const map: Record<string, string> = {};
      listingsData.forEach((l) => { map[l.id] = l.cropName; });
      setListingsMap(map);
    }).catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load orders"))
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

  if (authLoading || loading) return (
    <main className="flex justify-center items-center min-h-screen" style={{ background: "#faf8f4" }}>
      <div className="text-center"><div className="spinner mx-auto mb-4"></div><p className="font-semibold" style={{ color: "#6d4d22" }}>Loading orders…</p></div>
    </main>
  );
  if (!user) return null;
  const isFarmer = user.role === "farmer" || user.role === "fpo";

  return (
    <main className="min-h-screen" style={{ background: "#faf8f4" }}>
      <div className="relative h-36 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80" alt="Orders" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(18,43,15,0.75), rgba(30,66,24,0.9))" }} />
        <div className="relative container mx-auto max-w-5xl px-6 h-full flex flex-col justify-center">
          <h1 className="text-3xl font-extrabold text-white animate-fade-up">{isFarmer ? "Orders on Your Produce" : "My Purchases"}</h1>
          <p className="text-sm mt-1 animate-fade-up delay-100" style={{ color: "#b8e3af" }}>Manage your order history and track deliveries</p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-6 py-8">
        {error && <div className="mb-6 px-4 py-3 rounded-xl text-sm font-semibold" style={{ background: "#fee2e2", color: "#dc2626" }}>{error}</div>}

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl animate-scale-in" style={{ border: "2px dashed #e8d0a3" }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "#f2f9f0" }}>
              <svg className="w-8 h-8" fill="none" stroke="#3a7d30" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "#1e4218" }}>No orders yet</h3>
            <p className="text-sm mb-6" style={{ color: "#8b6330" }}>Browse the marketplace to place your first order.</p>
            <Link href="/browse" className="px-6 py-3 font-bold rounded-xl text-sm shadow-sm" style={{ background: "#2d6324", color: "#fff" }}>
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o, i) => {
              const shipment = shipments.find((s) => s.orderId === o.id);
              const cropName = listingsMap[o.listingId] || "Unknown Produce";
              const sc = STATUS_COLORS[o.status];
              return (
                <div key={o.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row animate-fade-up delay-${Math.min(i * 100, 400)}`} style={{ border: "1px solid #e8d0a3" }}>
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-extrabold text-xl" style={{ color: "#1e4218" }}>{cropName}</h3>
                        <p className="text-xs mt-0.5" style={{ color: "#a87c42" }}>Order #{o.id.slice(0, 8)} &bull; {new Date(o.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: sc.bg, color: sc.text }}>
                        {o.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Quantity", value: `${o.quantity} kg` },
                        { label: "Price/kg", value: `₹${o.pricePerUnit}` },
                        { label: "Total", value: `₹${o.totalPrice.toLocaleString()}`, highlight: true },
                      ].map((m) => (
                        <div key={m.label} className="rounded-xl p-3" style={{ background: "#faf8f4" }}>
                          <div className="text-xs mb-1" style={{ color: "#8b6330" }}>{m.label}</div>
                          <div className={`font-extrabold ${m.highlight ? "text-lg" : ""}`} style={{ color: m.highlight ? "#2d6324" : "#1e4218" }}>{m.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 flex items-center justify-between gap-3" style={{ borderTop: "1px solid #f5ead6" }}>
                      <span className="text-sm" style={{ color: "#a87c42" }}>{o.type === "bulk_bid" ? "Bulk bid negotiation" : "Consumer purchase"}</span>
                      {shipment ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
                          In Transit: {shipment.status.replaceAll("_", " ")}
                        </div>
                      ) : o.status === "ordered" ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "#f2f9f0", color: "#2d6324", border: "1px solid #b8e3af" }}>
                          Payment in Escrow
                        </div>
                      ) : o.status === "confirmed" ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}>
                          Awaiting Dispatch
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {isFarmer && (
                    <div className="p-6 md:w-52 border-t md:border-t-0 md:border-l flex flex-col justify-center gap-3" style={{ background: "#faf8f4", borderColor: "#e8d0a3" }}>
                      <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "#8b6330" }}>Actions</h4>
                      {o.status === "ordered" && (
                        <button onClick={() => updateStatus(o.id, "confirmed")}
                          className="w-full py-2.5 font-bold rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-sm"
                          style={{ background: "#2d6324", color: "#fff" }}>
                          Confirm Order
                        </button>
                      )}
                      {o.status === "confirmed" && !shipment && (
                        <Link href="/logistics" className="w-full py-2.5 font-bold rounded-xl text-sm text-center transition-all hover:-translate-y-0.5 shadow-sm" style={{ background: "#2d6324", color: "#fff" }}>
                          Schedule Transport
                        </Link>
                      )}
                      {o.status === "confirmed" && shipment?.status === "delivered" && (
                        <button onClick={() => updateStatus(o.id, "delivered")}
                          className="w-full py-2.5 font-bold rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-sm"
                          style={{ background: "#4a9c3d", color: "#fff" }}>
                          Mark Complete
                        </button>
                      )}
                      {o.status === "delivered" && (
                        <div className="text-center p-3 rounded-xl text-sm font-bold" style={{ background: "#f2f9f0", color: "#2d6324" }}>
                          Escrow Released
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
