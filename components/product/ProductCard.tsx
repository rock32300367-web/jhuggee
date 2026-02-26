"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    images: string[];
    price: number;
    mrp: number;
    rating: number;
    ratingCount: number;
    freeDelivery: boolean;
    category: string;
    createdAt?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { user, setCartCount, cartCount } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  const stars = Math.round(product.rating);
  const img = product.images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&q=80";

  // Check if product is less than 7 days old
  const isNew = product.createdAt
    ? new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    : false;

  const addToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { router.push("/login"); return; }
    setAdding(true);
    try {
      await axios.post("/api/cart", { productId: product._id, qty: 1 });
      setCartCount(cartCount + 1);
      toast.success("Added to cart! 🛒");
    } catch { toast.error("Failed to add to cart"); }
    finally { setAdding(false); }
  };

  return (
    <div
      onClick={() => router.push(`/product/${product._id}`)}
      className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-orange-200"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-orange-50">
        <img src={img} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {isNew && (
          <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs sm:text-sm font-extrabold px-2.5 py-1 rounded-md shadow-sm z-10 tracking-widest">
            NEW
          </div>
        )}
        <button onClick={e => { e.stopPropagation(); setWishlisted(!wishlisted); }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 ${wishlisted ? "bg-red-100 opacity-100 scale-100" : "bg-white"}`}>
          <Heart size={14} className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"} />
        </button>
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs sm:text-sm font-bold text-gray-500 tracking-wide uppercase">{product.category}</p>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-green-100 border-2 border-green-300 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl">
            <span className="text-sm sm:text-base font-black text-green-800 tracking-tight">
              {product.ratingCount > 0 ? product.rating.toFixed(1) : "4.0"}
            </span>
            <span className="text-sm sm:text-base text-green-600 mb-0.5">★</span>
            <span className="text-xs sm:text-sm font-bold text-green-700/90 border-l-2 border-green-400 pl-2 ml-0.5">
              {product.ratingCount > 0 ? (product.ratingCount / 1000).toFixed(1) : "0"}k
            </span>
          </div>
        </div>
        <p className="text-base sm:text-xl font-extrabold text-gray-800 truncate mb-1.5 leading-tight">{product.name}</p>
        <div className="flex items-baseline gap-1.5 sm:gap-2.5 flex-wrap mt-2">
          <span className="text-lg sm:text-2xl font-black text-gray-900">₹{product.price}</span>
          {product.mrp > product.price && <span className="text-sm sm:text-base text-gray-400 line-through font-semibold">₹{product.mrp}</span>}
        </div>
      </div>
    </div>
  );
}
