"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { Order, Shipment } from "../../lib/types";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shipments, setShipments] = useState<Shipment[]>([]);

  function loadOrders() {
    return api
      .get<Order[]>("/orders")
      .then(async (data) => {
        setOrders(data);
        const shipmentData = await api.get<Shipment[]>("/logistics/shipments");
        setShipments(shipmentData);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load orders"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    void loadOrders();
  }, [user, authLoading]);

  async function updateStatus(id: string, status: Order["status"]) {
    try {
      await api.patch<Order>(`/orders/${id}/status`, { status });
      loadOrders();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  }

  if (authLoading || loading) {
    return <main className="container mx-auto p-6"><p className="text-zinc-500">Loading orders…</p></main>;
  }
  if (!user) return null;

  const isFarmer = user.role === "farmer" || user.role === "fpo";

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-emerald-700 mb-4">
        {isFarmer ? "Orders on Your Produce" : "My Orders"}
      </h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {orders.length === 0 ? (
        <p className="text-sm text-zinc-500">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border border-zinc-200 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${STATUS_COLORS[o.status]}`}>
                    {o.status.toUpperCase()}
                  </span>
                  <span className="ml-2 text-xs text-zinc-500">order #{o.id.slice(0, 8)}</span>
                </div>
                <span className="text-sm font-medium">Total: ₹{o.totalPrice}</span>
              </div>
                            <p className="mt-1 text-sm text-zinc-700">
                {o.quantity}kg @ ₹{o.pricePerUnit}/kg
              </p>
              <p className="text-xs text-zinc-500">
                Buyer: {isFarmer ? (o.buyerId) : (o.farmerId)} · {o.type === "bulk_bid" ? "Bulk bid" : "Consumer order"}
              </p>
              {(() => {
                const shipment = shipments.find((entry) => entry.orderId === o.id);
                return shipment ? <p className="mt-2 rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-800">Logistics: <span className="font-semibold capitalize">{shipment.status.replaceAll("_", " ")}</span> · {shipment.transporterName}</p> : o.status === "confirmed" ? <p className="mt-2 text-xs text-amber-700">Logistics: awaiting transport scheduling</p> : null;
              })()}

              {/* Farmer action buttons to advance the lifecycle */}
              {isFarmer && o.status === "ordered" && (
                <button
                  onClick={() => updateStatus(o.id, "confirmed")}
                  className="mt-2 rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700"
                >
                  Confirm Order
                </button>
              )}
              {isFarmer && o.status === "confirmed" && (
                <button
                  onClick={() => updateStatus(o.id, "delivered")}
                  className="mt-2 rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                >
                  Mark Delivered
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
