"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Package, X, CheckCircle, Truck, Home } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  returned: "bg-gray-100 text-gray-700",
};

const STATUS_ICONS: Record<string, string> = {
  pending: "⏳", confirmed: "✅", shipped: "🚚", delivered: "🎉", cancelled: "❌", returned: "↩️"
};

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<any>(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    axios.get("/api/orders").then(res => setOrders(res.data.data || [])).finally(() => setLoading(false));
  }, [user]);

  const handleCancel = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancellingId(orderId);
    try {
      await axios.put(`/api/orders/${orderId}/cancel`);
      toast.success("Order cancelled successfully");
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: "cancelled", paymentStatus: o.paymentStatus === "paid" ? "refund_pending" : o.paymentStatus } : o));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (orders.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <Package size={80} className="text-gray-200 mb-4" />
      <h2 className="font-baloo text-2xl font-bold text-gray-700 mb-2">No orders yet</h2>
      <p className="text-gray-400 mb-6">Start shopping and place your first order!</p>
      <Button onClick={() => router.push("/")}>Start Shopping →</Button>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6">
      <h1 className="font-baloo text-2xl font-bold text-indigo-900 mb-6">📦 My Orders</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order._id} className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
            {/* Order header */}
            <div className="bg-gray-50 px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400">Order ID</p>
                <p className="font-bold text-sm text-gray-800">{order.orderId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Placed on</p>
                <p className="font-semibold text-sm">{new Date(order.createdAt).toLocaleDateString("hi-IN")}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Total</p>
                <p className="font-bold text-sm">₹{order.total + (order.deliveryCharge || 0)}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                {STATUS_ICONS[order.status]} {order.status}
              </span>
            </div>

            {/* Items */}
            <div className="p-5 space-y-3">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex gap-3 items-center">
                  <img src={item.image || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&q=80"} alt={item.name} className="w-14 h-16 object-cover rounded-xl bg-orange-50 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.qty} {item.size ? `· Size: ${item.size}` : ""}</p>
                    <p className="font-bold text-sm mt-0.5">₹{item.price * item.qty}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 pb-4 flex gap-3 flex-wrap">
              {order.status === "delivered" && (
                <button onClick={() => toast("Product reviews coming soon! 🌟", { icon: "🚧" })} className="text-sm font-semibold text-orange-500 border-2 border-orange-300 px-4 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">Rate & Review</button>
              )}
              {["pending", "confirmed"].includes(order.status) && (
                <button disabled={cancellingId === order._id} onClick={() => handleCancel(order._id)} className="text-sm font-semibold text-red-500 border-2 border-red-200 px-4 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                  {cancellingId === order._id ? "Cancelling..." : "Cancel Order"}
                </button>
              )}
              <button onClick={() => setTrackingOrder(order)} className="text-sm font-semibold text-indigo-700 border-2 border-indigo-200 px-4 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">Track Order</button>
            </div>
          </div>
        ))}
      </div>

      {trackingOrder && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gray-50 border-b p-5 flex items-center justify-between">
              <div>
                <h3 className="font-baloo text-xl font-bold text-gray-800">Track Order</h3>
                <p className="text-sm text-gray-500 font-mono mt-0.5">{trackingOrder.orderId}</p>
              </div>
              <button onClick={() => setTrackingOrder(null)} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 hover:text-gray-900 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Timeline Body */}
            <div className="p-6 sm:p-8 relative">
              {trackingOrder.status === 'cancelled' || trackingOrder.status === 'returned' ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-1">Order {trackingOrder.status === 'cancelled' ? 'Cancelled' : 'Returned'}</h4>
                  <p className="text-gray-500 text-sm">This order will not be delivered.</p>
                  {trackingOrder.paymentStatus === 'refund_pending' && (
                    <p className="text-blue-500 text-sm font-semibold mt-2 bg-blue-50 p-2 rounded inline-block">Refund initiated to source account.</p>
                  )}
                </div>
              ) : (
                <div className="relative pl-6 sm:pl-8 border-l-2 border-gray-100 space-y-8">
                  {[
                    { status: "pending", title: "Order Placed", desc: "We received your order", icon: Package },
                    { status: "confirmed", title: "Confirmed", desc: "Order is verified and processing", icon: CheckCircle },
                    { status: "shipped", title: "Shipped", desc: "Handed over to delivery partner", icon: Truck },
                    { status: "delivered", title: "Delivered", desc: "Item reached your destination", icon: Home },
                  ].map((step, idx) => {
                    const statuses = ["pending", "confirmed", "shipped", "delivered"];
                    const currentIdx = statuses.indexOf(trackingOrder.status);

                    const isCompleted = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;
                    const Icon = step.icon;

                    return (
                      <div key={idx} className="relative">
                        {/* Status Bubble */}
                        <div className={`absolute -left-[37px] sm:-left-[45px] w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white shadow-sm' : 'bg-gray-200 text-gray-400'}`}>
                          <Icon size={14} strokeWidth={isCompleted ? 3 : 2} />
                        </div>
                        {/* Status Content */}
                        <div>
                          <h4 className={`text-base font-bold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>{step.title}</h4>
                          <p className={`text-sm mt-0.5 ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>{step.desc}</p>
                          {isCurrent && trackingOrder.status === 'shipped' && (
                            <p className="text-xs bg-orange-100 text-orange-600 px-3 py-1.5 rounded mt-2 font-semibold inline-block border border-orange-200">Arriving soon via trusted carriers</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <Button variant="outline" onClick={() => setTrackingOrder(null)}>Close Tracker</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
