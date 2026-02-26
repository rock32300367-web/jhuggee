"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Trash2, ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function CartPage() {
  const router = useRouter();
  const { user, setCartCount } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    axios.get("/api/cart").then(res => setItems(res.data.data?.items || [])).finally(() => setLoading(false));
  }, [user]);

  const removeItem = async (productId: string, size?: string, color?: string) => {
    await axios.delete("/api/cart", { data: { productId, size, color } });
    setItems(prev => prev.filter(i => i.productId._id !== productId));
    setCartCount(items.length - 1);
    toast.success("Item removed");
  };

  const updateQty = async (item: any, qty: number) => {
    await axios.patch("/api/cart", { productId: item.productId._id, qty, size: item.size, color: item.color });
    setItems(prev => prev.map(i => i.productId._id === item.productId._id ? { ...i, qty } : i));
  };

  const total = items.reduce((s, i) => s + (i.productId?.price || 0) * i.qty, 0);
  const delivery = total >= 199 ? 0 : 49;

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (items.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ShoppingBag size={80} className="text-gray-200 mb-4" />
      <h2 className="font-baloo text-2xl font-bold text-gray-700 mb-2">Your cart is empty!</h2>
      <p className="text-gray-400 mb-6">Add some products and start shopping</p>
      <Button onClick={() => router.push("/")}>Start Shopping →</Button>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6">
      <h1 className="font-baloo text-2xl font-bold text-indigo-900 mb-6">🛒 My Cart ({items.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item, i) => {
            const p = item.productId;
            if (!p) return null;
            const img = p.images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&q=80";
            return (
              <div key={i} className="bg-white rounded-2xl p-4 flex gap-4 border-2 border-gray-100">
                <img src={img} alt={p.name} className="w-24 h-28 object-cover rounded-xl flex-shrink-0 bg-orange-50 cursor-pointer" onClick={() => router.push(`/product/${p._id}`)} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm mb-1 truncate">{p.name}</p>
                  {item.size && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mr-1">Size: {item.size}</span>}
                  {item.color && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Color: {item.color}</span>}
                  <div className="flex items-baseline gap-2 mt-2 mb-3">
                    <span className="font-bold text-lg">₹{p.price}</span>
                    {p.mrp > p.price && <span className="text-sm text-gray-400 line-through">₹{p.mrp}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => item.qty > 1 ? updateQty(item, item.qty - 1) : removeItem(p._id, item.size, item.color)} className="px-2.5 py-1.5 text-sm font-bold hover:bg-gray-50">−</button>
                      <span className="px-3 py-1.5 text-sm font-bold">{item.qty}</span>
                      <button onClick={() => updateQty(item, item.qty + 1)} className="px-2.5 py-1.5 text-sm font-bold hover:bg-gray-50">+</button>
                    </div>
                    <button onClick={() => removeItem(p._id, item.size, item.color)} className="text-red-400 hover:text-red-600 transition-colors p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
            <h2 className="font-baloo text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal ({items.length} items)</span><span>₹{total}</span></div>
              <div className="flex justify-between text-gray-600"><span>Delivery Charge</span><span className={delivery === 0 ? "text-green-600 font-semibold" : ""}>{delivery === 0 ? "FREE" : `₹${delivery}`}</span></div>
              {delivery > 0 && <p className="text-xs text-orange-500 bg-orange-50 px-3 py-2 rounded-lg">Add ₹{199 - total} more for FREE delivery!</p>}
              <div className="border-t pt-3 flex justify-between font-bold text-base">
                <span>Total</span><span>₹{total + delivery}</span>
              </div>
            </div>
            <Button onClick={() => router.push("/checkout")} fullWidth size="lg" className="mt-5">Proceed to Checkout →</Button>
            <p className="text-center text-xs text-gray-400 mt-3">🔒 Secure & Encrypted Payment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
