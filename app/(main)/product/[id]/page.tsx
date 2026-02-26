"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { ShoppingCart, Heart, Truck, RotateCcw, Shield, MapPin, Star, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/product/ProductCard";

function StarRow({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
        <Star size={11} fill="white" /> {rating}
      </span>
      <span className="text-sm text-gray-400">{(count / 1000).toFixed(1)}k ratings</span>
    </div>
  );
}
export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, cartCount, setCartCount } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pinChecked, setPinChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "reviews" | "shipping">("details");
  const [similar, setSimilar] = useState<any[]>([]);
  const [showStickyBar, setShowStickyBar] = useState(true);
  const similarRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get(`/api/products/${params.id}`)
      .then(res => {
        const p = res.data.data;
        setProduct(p);
        // fetch similar by category
        axios.get(`/api/products?category=${p.category}&limit=4`)
          .then(r => {
            const filtered = (r.data.data?.products || []).filter((x: any) => x._id !== p._id);
            setSimilar(filtered);
          })
          .catch(() => setSimilar([]));
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    const handleScroll = () => {
      let isBottomZone = false;

      if (similarRef.current) {
        const top = similarRef.current.getBoundingClientRect().top;
        if (top < window.innerHeight) isBottomZone = true;
      }

      if (!isBottomZone && bottomRef.current) {
        const top = bottomRef.current.getBoundingClientRect().top;
        if (top < window.innerHeight) isBottomZone = true;
      }

      // Fallback for very bottom
      if (document.documentElement.scrollHeight - (window.innerHeight + window.scrollY) < 100) {
        isBottomZone = true;
      }

      setShowStickyBar(!isBottomZone);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run after a tiny delay on mount to ensure layout is painted
    setTimeout(handleScroll, 100);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [similar]);

  const addToCart = async (buyNow = false) => {
    if (!user) { router.push("/login"); return; }
    if (product.sizes?.length && !selectedSize) { toast.error("Please select a size first"); return; }
    setAdding(true);
    try {
      await axios.post("/api/cart", { productId: product._id, qty, size: selectedSize, color: selectedColor });
      setCartCount(cartCount + qty);
      if (buyNow) router.push("/cart");
      else toast.success("Added to cart! 🛒");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "An error occurred, please try again");
    } finally {
      setAdding(false);
    }
  };



  const checkPincode = () => {
    if (pincode.length === 6) {
      setPinChecked(true);
      toast.success(`📍 Delivery is available at ${pincode}!`);
    } else {
      toast.error("Enter a 6-digit pincode");
    }
  };

  // ── LOADING SKELETON ──
  if (loading) return (
    <div className="max-w-[1600px] mx-auto px-4 py-8">
      <div className="h-4 bg-gray-100 rounded w-48 mb-6 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3].map(i => <div key={i} className="w-16 h-16 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        </div>
        <div className="space-y-4 pt-2">
          {[240, 120, 80, 160, 200, 120].map((w, i) => (
            <div key={i} className={`h-8 bg-gray-100 rounded-xl animate-pulse`} style={{ width: `${w}px` }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const imgs = product.images?.length
    ? product.images
    : ["https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80"];

  const isNew = product.createdAt
    ? new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    : false;

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-4 sm:py-6 overflow-x-hidden">

      {/* ── BREADCRUMB ── */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 sm:mb-8 flex-wrap">
        <button onClick={() => router.push("/")} className="hover:text-orange-500 transition-colors font-semibold">Home</button>
        <ChevronRight size={14} />
        <button onClick={() => router.push(`/?category=${product.category}`)} className="hover:text-orange-500 transition-colors font-semibold">{product.category}</button>
        <ChevronRight size={14} />
        <span className="text-gray-600 font-bold truncate max-w-[180px] sm:max-w-xs">{product.name}</span>
      </nav>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-14 mb-10">

        {/* ── LEFT: IMAGE GALLERY ── */}
        <div className="md:sticky md:top-24 md:self-start">
          {/* Main Image */}
          <div className="relative aspect-[3/4] sm:aspect-square md:aspect-[3/4] rounded-2xl overflow-hidden bg-orange-50 mb-3 group">
            <img
              src={imgs[activeImg]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            {isNew && (
              <div className="absolute top-4 left-4 bg-indigo-600 text-white text-sm sm:text-base font-extrabold px-3 py-1.5 rounded-lg shadow-md z-10 tracking-widest">
                NEW
              </div>
            )}
            <button
              onClick={() => { setWishlisted(!wishlisted); toast.success(wishlisted ? "Removed from wishlist" : "❤️ Added to wishlist!"); }}
              className={`absolute top-3 right-3 w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-md transition-all ${wishlisted ? "bg-red-50 border-red-200" : "bg-white border-gray-200 hover:border-orange-300"
                }`}
            >
              <Heart size={18} className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"} />
            </button>
          </div>

          {/* Thumbnails */}
          {imgs.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {imgs.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImg === i ? "border-orange-500 shadow-md" : "border-gray-200 hover:border-orange-300"
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: PRODUCT INFO ── */}
        <div className="flex flex-col gap-4">

          {/* Name + Wishlist */}
          <div>
            <div className="inline-flex items-center gap-1.5 bg-orange-100 border border-orange-300 text-orange-700 text-xs sm:text-sm font-black uppercase tracking-wider px-3 py-1.5 rounded-full mb-3">
              🏷️ {product.category}
            </div>
            <h1 className="font-baloo text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            {product.ratingCount > 0 && (
              <StarRow rating={product.rating} count={product.ratingCount} />
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 pb-5 border-b-2 border-gray-100 flex-wrap">
            <span className="font-baloo text-4xl sm:text-5xl font-black text-gray-900">₹{product.price}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-lg sm:text-xl text-gray-400 line-through font-semibold">₹{product.mrp}</span>
                <span className="bg-green-100 text-green-700 text-base sm:text-lg font-bold px-3 py-1 rounded-xl">{off}% off</span>
              </>
            )}
          </div>

          {/* Offers */}
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 sm:p-5">
            <p className="font-extrabold text-base sm:text-lg mb-3">🏷️ Available Offers</p>
            <div className="space-y-3 text-sm sm:text-base text-gray-600 font-medium">
              <p>💳 10% off first order — Use <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md">JHUGGEE10</span></p>
              <p>🏦 Extra ₹50 off on HDFC Bank cards</p>
              <p>📱 5% cashback on PhonePe & Google Pay</p>
            </div>
          </div>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div>
              <p className="text-base sm:text-lg font-bold text-gray-700 mb-2.5">
                Color: <span className="text-orange-500 font-extrabold">{selectedColor || "Select"}</span>
              </p>
              <div className="flex gap-2.5 flex-wrap">
                {product.colors.map((c: string) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 border-2 rounded-xl text-base font-bold transition-all ${selectedColor === c
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-200 hover:border-orange-300 text-gray-700"
                      }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-base sm:text-lg font-bold text-gray-700">
                  Size: <span className="text-orange-500 font-extrabold">{selectedSize || "Select"}</span>
                </p>
                <button className="text-sm font-bold text-orange-500 hover:underline">Size Guide ›</button>
              </div>
              <div className="flex gap-2.5 flex-wrap">
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 border-2 rounded-xl text-base font-black transition-all ${selectedSize === s
                      ? "border-indigo-900 bg-indigo-900 text-white"
                      : "border-gray-200 hover:border-orange-300 text-gray-700"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-base sm:text-lg font-bold text-gray-700">Quantity:</p>
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-12 h-12 text-2xl font-black text-indigo-900 hover:bg-orange-50 transition-colors"
              >−</button>
              <span className="w-14 text-center font-black text-base lg:text-lg">{qty}</span>
              <button
                onClick={() => setQty(q => Math.min(product.stock || 10, q + 1))}
                className="w-12 h-12 text-2xl font-black text-indigo-900 hover:bg-orange-50 transition-colors"
              >+</button>
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-sm font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full">
                ⚠️ Only {product.stock} left in stock!
              </span>
            )}
          </div>

          {/* Delivery Info */}
          <div className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-5">
            <p className="font-extrabold text-base sm:text-lg mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-orange-500" /> Delivery & Availability
            </p>
            {/* Pincode checker */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit pincode"
                value={pincode}
                onChange={e => { setPincode(e.target.value.replace(/\D/g, "").slice(0, 6)); setPinChecked(false); }}
                onKeyDown={e => e.key === "Enter" && checkPincode()}
                className="flex-1 border-2 border-orange-200 bg-white rounded-xl px-4 py-3 text-base outline-none focus:border-orange-400 transition-colors"
              />
              <button
                onClick={checkPincode}
                className="bg-indigo-900 text-white px-5 py-3 rounded-xl text-base font-bold hover:bg-indigo-800 transition-colors"
              >
                Check
              </button>
            </div>
            <div className="space-y-3 text-base text-gray-700 font-medium">
              {pinChecked && (
                <div className="flex items-center gap-2 text-green-700 font-bold">
                  <span>✅</span> <span>Delivery is available at {pincode}!</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-orange-500 flex-shrink-0" />
                <span>{product.freeDelivery ? "FREE Delivery by Tomorrow" : "Delivery ₹49 · Arrives in 3-5 days"}</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw size={16} className="text-orange-500 flex-shrink-0" />
                <span>7-day easy returns & exchange</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-orange-500 flex-shrink-0" />
                <span>100% Genuine Product · COD available</span>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { icon: "🧵", t: "Premium Fabric", s: "Soft & lightweight" },
              { icon: "🎨", t: "Multiple Colors", s: "Vibrant options" },
              { icon: "📦", t: "Gift Packaging", s: "Premium box" },
              { icon: "✅", t: "Quality Tested", s: "100% genuine" },
            ].map(h => (
              <div key={h.t} className="bg-white border-2 border-gray-100 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">{h.icon}</span>
                <div>
                  <p className="text-sm font-bold text-gray-800">{h.t}</p>
                  <p className="text-xs text-gray-500 font-medium">{h.s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="mb-10">
        {/* Tab buttons */}
        <div className="flex border-b-2 border-gray-100 mb-8 overflow-x-auto scrollbar-hide gap-0">
          {(["details", "reviews", "shipping"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 sm:px-10 py-4 text-base sm:text-lg font-extrabold whitespace-nowrap border-b-[3px] -mb-[3px] transition-all ${activeTab === tab
                ? "border-orange-500 text-indigo-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
            >
              {tab === "details" ? "Product Details" : tab === "reviews" ? `Reviews (${product.ratingCount > 0 ? (product.ratingCount / 1000).toFixed(1) + "k" : "0"})` : "Shipping & Returns"}
            </button>
          ))}
        </div>

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div>
              <h3 className="font-baloo font-black text-xl text-indigo-900 mb-5">Specifications</h3>
              <table className="w-full text-base">
                <tbody>
                  {[
                    ["Category", product.category],
                    ["Price", `₹${product.price}`],
                    ["MRP", `₹${product.mrp}`],
                    ["Discount", `${off}% off`],
                    ["Stock", `${product.stock || "Available"} units`],
                    ["Free Delivery", product.freeDelivery ? "Yes ✓" : "No"],
                    ...(product.sizes?.length ? [["Available Sizes", product.sizes.join(", ")]] : []),
                    ...(product.colors?.length ? [["Available Colors", product.colors.join(", ")]] : []),
                  ].map(([k, v]) => (
                    <tr key={k} className="border-b border-gray-100">
                      <td className="py-3.5 text-gray-500 font-bold w-40">{k}</td>
                      <td className="py-3.5 font-bold text-gray-900">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {product.description && (
              <div>
                <h3 className="font-baloo font-black text-xl text-indigo-900 mb-5">About this Product</h3>
                <p className="text-base text-gray-700 leading-relaxed font-medium">{product.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div>
            {product.ratingCount > 0 ? (
              <div className="bg-white border-2 border-gray-100 rounded-3xl p-6 sm:p-8 mb-6 flex flex-col sm:flex-row gap-8 items-center">
                <div className="text-center">
                  <div className="font-baloo text-7xl font-black text-gray-900 leading-none">{product.rating}</div>
                  <div className="flex gap-1.5 justify-center my-3">
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} className={`text-2xl ${s <= Math.round(product.rating) ? "text-amber-400" : "text-gray-200"}`}>★</span>
                    ))}
                  </div>
                  <p className="text-base font-bold text-gray-500">{product.ratingCount.toLocaleString()} ratings</p>
                </div>
                <div className="flex-1 w-full">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center gap-3 mb-2">
                      <span className="text-xs w-4 text-right text-gray-500">{star}</span>
                      <span className="text-amber-400 text-xs">★</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${star === 5 ? 54 : star === 4 ? 26 : star === 3 ? 11 : star === 2 ? 5 : 4}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-8">
                        {star === 5 ? "54%" : star === 4 ? "26%" : star === 3 ? "11%" : star === 2 ? "5%" : "4%"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">💬</p>
                <p className="font-semibold">There are no reviews yet</p>
                <p className="text-sm mt-1">Buy first, then write a review!</p>
              </div>
            )}
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === "shipping" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { icon: "🚚", t: "Free Delivery", d: "₹199+ ke orders pe bilkul FREE delivery. Standard delivery 3–5 business days mein pahunche." },
              { icon: "⚡", t: "Express Delivery", d: "Select cities mein same-day ya next-day delivery available. Extra ₹49 lagega." },
              { icon: "↩️", t: "7-Day Returns", d: "Delivery ke 7 din ke andar return request de sakte ho. Unused aur original packaging mein hona chahiye." },
              { icon: "💰", t: "Cash on Delivery", d: "Sabhi orders pe COD available hai. UPI, Debit/Credit Card bhi accept hote hain." },
            ].map(item => (
              <div key={item.t} className="bg-white border-2 border-gray-100 rounded-3xl p-6 flex gap-5 items-start">
                <span className="text-4xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="font-black text-lg text-gray-800 mb-1.5">{item.t}</p>
                  <p className="text-base text-gray-600 font-medium leading-relaxed">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SIMILAR PRODUCTS ── */}
      {similar.length > 0 && (
        <div className="mt-8" ref={similarRef}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-baloo text-2xl sm:text-3xl font-extrabold text-indigo-900 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-orange-500 rounded-full inline-block" />
              Similar Products
            </h2>
            <button
              onClick={() => router.push(`/?category=${product.category}`)}
              className="text-sm font-bold text-orange-500 border-2 border-orange-300 px-5 py-2 rounded-full hover:bg-orange-500 hover:text-white transition-all"
            >
              See All →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {similar.slice(0, 4).map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* ── STICKY BUY BAR ── */}
      <div className={`fixed left-0 right-0 z-50 bg-white border-t-2 border-gray-100 p-3 sm:p-4 flex gap-3 sm:gap-6 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] max-w-[1600px] mx-auto transition-all duration-300 ease-in-out ${showStickyBar ? 'bottom-0 translate-y-0' : '-bottom-32 translate-y-full opacity-0 pointer-events-none'}`}>
        <Button
          onClick={() => addToCart(false)}
          loading={adding}
          variant="outline"
          size="lg"
          className="flex-1 font-baloo font-bold gap-1.5"
        >
          <ShoppingCart size={15} /> Cart
        </Button>
        <Button
          onClick={() => addToCart(true)}
          size="lg"
          className="flex-1 font-baloo font-bold"
        >
          ⚡ Buy Now
        </Button>
      </div>

      {/* Bottom spacing so content isn't hidden behind the sticky bar */}
      <div className="h-24" ref={bottomRef} />
    </div>
  );
}
