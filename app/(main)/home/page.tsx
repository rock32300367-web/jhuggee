"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import ProductCard from "@/components/product/ProductCard";

const BANNERS = [
  { id: 1, eyebrow: "Mega Festival Sale", title: "80% Off on\nEthnic Wear", cta: "Shop Now", bg: "#1a0533", accent: "#f97316", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80", link: "/category/Sarees" },
  { id: 2, eyebrow: "New Arrivals", title: "Summer\nCollection '25", cta: "Explore Now", bg: "#0c1a2e", accent: "#06b6d4", img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80", link: "/category/Kurtis" },
  { id: 3, eyebrow: "Super Saver", title: "Under ₹199\nOnly Today", cta: "Grab Deal", bg: "#1a1a0a", accent: "#eab308", img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80", link: "/category/Beauty" },
];

const CATEGORIES = [
  { label: "Sarees", emoji: "🥻" }, { label: "Kurtis", emoji: "👗" }, { label: "Men's Wear", emoji: "👔" },
  { label: "Kids", emoji: "🧸" }, { label: "Footwear", emoji: "👟" }, { label: "Electronics", emoji: "📱" },
  { label: "Jewellery", emoji: "💍" }, { label: "Beauty", emoji: "💄" }, { label: "Home & Kitchen", emoji: "🏠" },
  { label: "Grocery", emoji: "🥦" }, { label: "Bags", emoji: "👜" }, { label: "Sports", emoji: "🏋️" },
];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bannerIdx, setBannerIdx] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (category) p.set("category", category);
    if (activeTab === "u499") p.set("maxPrice", "499");
    if (activeTab === "best") p.set("sort", "rating");
    if (activeTab === "new") p.set("sort", "createdAt");
    p.set("limit", "16");
    axios.get(`/api/products?${p}`)
      .then(res => setProducts(res.data.data?.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q, category, activeTab]);

  useEffect(() => {
    timerRef.current = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const b = BANNERS[bannerIdx];

  // Category pe click → category page pe jao
  const goCategory = (cat: string) => router.push(`/category/${encodeURIComponent(cat)}`);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 py-4 overflow-x-hidden">

      {!q && !category && (
        <>
          {/* ── HERO ── */}
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_280px] gap-3 mb-5">
            <div className="rounded-2xl overflow-hidden relative min-h-[220px] sm:min-h-[300px] flex items-end cursor-pointer group"
              style={{ background: b.bg }} onClick={() => router.push(b.link)}>
              <img src={b.img} alt={b.title}
                className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-[52%] object-cover object-top opacity-90"
                style={{ maskImage: "linear-gradient(to left,rgba(0,0,0,0.95) 55%,transparent)", WebkitMaskImage: "linear-gradient(to left,rgba(0,0,0,0.95) 55%,transparent)" }} />
              <div className="relative z-10 p-5 sm:p-8 pb-8 sm:pb-10">
                <span className="inline-block bg-white/20 border border-white/30 text-white text-xs sm:text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2 sm:mb-3">✦ {b.eyebrow}</span>
                <h2 className="font-baloo text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight whitespace-pre-line mb-4 sm:mb-5">{b.title}</h2>
                <button onClick={(e) => { e.stopPropagation(); router.push(b.link); }} style={{ background: b.accent, color: b.bg }} className="font-bold px-5 sm:px-7 py-2.5 sm:py-3 rounded-full shadow-lg text-base group-hover:scale-105 transition-transform">{b.cta} →</button>
              </div>
              <div className="absolute bottom-3 right-3 flex gap-1.5">
                {BANNERS.map((_, i) => (
                  <button key={i} onClick={e => { e.stopPropagation(); setBannerIdx(i); }}
                    className={`rounded-full border-none transition-all ${bannerIdx === i ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`} />
                ))}
              </div>
            </div>

            <div className="flex flex-row lg:flex-col gap-3">
              {[
                { label: "BEAUTY", title: "Under ₹199", img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80", cat: "Beauty" },
                { label: "JEWELLERY", title: "From ₹99", img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80", cat: "Jewellery" },
              ].map(m => (
                <div key={m.label} onClick={() => goCategory(m.cat)}
                  className="flex-1 min-h-[130px] rounded-2xl overflow-hidden relative flex items-end cursor-pointer p-3 sm:p-4 hover:scale-[1.02] transition-transform">
                  <img src={m.img} alt={m.label} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/5" />
                  <div className="relative z-10 text-white">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80">{m.label}</p>
                    <p className="font-baloo text-xl sm:text-2xl font-extrabold leading-tight">{m.title}</p>
                    <span className="inline-block mt-1 bg-orange-500 text-white text-sm font-bold px-3 py-0.5 rounded-full">Shop →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CATEGORIES ── */}
          <section className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-baloo text-xl sm:text-2xl font-bold text-indigo-900 flex items-center gap-2">
                <span className="w-1.5 h-7 bg-orange-500 rounded-full inline-block" />
                Shop by Category
              </h2>
            </div>
            <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-1">
              {CATEGORIES.map(c => (
                <button key={c.label} onClick={() => goCategory(c.label)}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 bg-white border-2 border-gray-100 rounded-2xl py-3 sm:py-4 px-3 sm:px-5 min-w-[72px] sm:min-w-[90px] hover:border-orange-400 hover:shadow-lg hover:shadow-orange-100 hover:-translate-y-1 transition-all group flex-shrink-0">
                  <span className="text-2xl sm:text-3xl">{c.emoji}</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-600 group-hover:text-orange-500 text-center leading-tight">{c.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── PROMO BANNERS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
            {[
              { sub: "Women's Fashion", title: "Sarees from ₹199", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80", cat: "Sarees" },
              { sub: "Men's Style", title: "Shirts & Jeans 70% Off", img: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=500&q=80", cat: "Men's Wear" },
              { sub: "Home & Kitchen", title: "Upto 65% Off Today", img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80", cat: "Home & Kitchen" },
            ].map(p => (
              <div key={p.title} onClick={() => goCategory(p.cat)}
                className="rounded-2xl overflow-hidden relative min-h-[130px] sm:min-h-[150px] flex items-end p-4 sm:p-5 cursor-pointer hover:scale-[1.025] transition-transform">
                <img src={p.img} alt={p.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="relative z-10 text-white">
                  <p className="text-xs sm:text-sm uppercase tracking-widest font-bold opacity-80">{p.sub}</p>
                  <p className="font-baloo text-xl sm:text-2xl font-extrabold leading-tight shadow-sm">{p.title}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── PRODUCTS ── */}
      <section>
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2 flex-wrap">
          <h2 className="font-baloo text-xl sm:text-2xl font-bold text-indigo-900 flex items-center gap-2">
            <span className="w-1.5 h-7 bg-orange-500 rounded-full inline-block" />
            {q ? `Results for "${q}"` : category ? category : "🔥 Trending Now"}
          </h2>
          {!q && !category && (
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              {[{ id: "all", l: "All" }, { id: "new", l: "✨ New" }, { id: "best", l: "⭐ Best" }, { id: "u499", l: "<₹499" }].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 transition-all ${activeTab === t.id ? "bg-indigo-900 text-white border-indigo-900" : "border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500"}`}>
                  {t.l}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {Array(8).fill(0).map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-semibold">
              {q || category ? "No products found" : "There are no products yet"}
            </p>
            <p className="text-sm mt-1">
              {q || category ? "Try searching for something else" : "Sellers will add products soon!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* ── TRUST STRIP ── */}
      <div className="bg-indigo-950 rounded-2xl mt-8 p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[
          { icon: "🚚", t: "Free Delivery", s: "Orders above ₹199" },
          { icon: "↩️", t: "Easy Returns", s: "7-day hassle-free" },
          { icon: "🔒", t: "Secure Payments", s: "UPI · Card · COD" },
          { icon: "🏆", t: "1 Cr+ Buyers", s: "Trusted by India" },
        ].map(item => (
          <div key={item.t} className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center text-lg sm:text-xl flex-shrink-0">{item.icon}</div>
            <div>
              <p className="text-sm sm:text-base font-bold text-white">{item.t}</p>
              <p className="text-xs sm:text-sm text-white/70">{item.s}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
