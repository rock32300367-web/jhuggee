"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ProductCard from "@/components/product/ProductCard";

const CATEGORY_META: Record<string,{emoji:string;desc:string;color:string}> = {
  "Sarees":        { emoji:"🥻", desc:"Traditional Indian sarees — georgette, silk, cotton aur zyada", color:"from-pink-600 to-rose-700" },
  "Kurtis":        { emoji:"👗", desc:"Stylish kurtis for every occasion", color:"from-purple-600 to-indigo-700" },
  "Men's Wear":    { emoji:"👔", desc:"Shirts, jeans, kurtas and more for men", color:"from-blue-600 to-indigo-700" },
  "Kids":          { emoji:"🧸", desc:"Cute and comfortable clothes for kids", color:"from-yellow-500 to-orange-600" },
  "Footwear":      { emoji:"👟", desc:"Sandals, heels, sneakers and more", color:"from-teal-600 to-cyan-700" },
  "Electronics":   { emoji:"📱", desc:"Phones, accessories and gadgets", color:"from-gray-700 to-gray-900" },
  "Jewellery":     { emoji:"💍", desc:"Gold plated, silver and fashion jewellery", color:"from-yellow-600 to-amber-700" },
  "Beauty":        { emoji:"💄", desc:"Makeup, skincare and beauty products", color:"from-red-500 to-pink-600" },
  "Home & Kitchen":{ emoji:"🏠", desc:"Cookware, decor and home essentials", color:"from-green-600 to-teal-700" },
  "Grocery":       { emoji:"🥦", desc:"Fresh groceries and daily essentials", color:"from-green-500 to-emerald-600" },
  "Bags":          { emoji:"👜", desc:"Handbags, backpacks and travel bags", color:"from-brown-500 to-amber-800" },
  "Sports":        { emoji:"🏋️", desc:"Fitness equipment and sportswear", color:"from-blue-500 to-cyan-600" },
};

const SORT_OPTIONS = [
  { value:"createdAt",  label:"Newest First" },
  { value:"price_asc",  label:"Price: Low to High" },
  { value:"price_desc", label:"Price: High to Low" },
  { value:"rating",     label:"Top Rated" },
  { value:"popular",    label:"Most Popular" },
];

export default function CategoryPage({ params }: { params: { name: string } }) {
  const router   = useRouter();
  const catName  = decodeURIComponent(params.name);
  const meta     = CATEGORY_META[catName] || { emoji:"🛍️", desc:"Products in this category", color:"from-indigo-600 to-purple-700" };

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [sort, setSort]         = useState("createdAt");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const LIMIT = 16;

  useEffect(() => { setPage(1); }, [sort, minPrice, maxPrice]);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ category: catName, sort, limit: String(LIMIT), page: String(page) });
    if (minPrice) p.set("minPrice", minPrice);
    if (maxPrice) p.set("maxPrice", maxPrice);
    axios.get(`/api/products?${p}`)
      .then(res => { setProducts(res.data.data?.products||[]); setTotal(res.data.data?.total||0); })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [catName, sort, minPrice, maxPrice, page]);

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-4 overflow-x-hidden">

      {/* Hero Banner */}
      <div className={`bg-gradient-to-r ${meta.color} rounded-2xl p-6 sm:p-10 mb-6 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 text-[180px] flex items-center justify-end pr-8 leading-none select-none">{meta.emoji}</div>
        <nav className="flex items-center gap-2 text-white/60 text-xs mb-3">
          <button onClick={() => router.push("/")} className="hover:text-white transition-colors">Home</button>
          <span>›</span>
          <span className="text-white font-semibold">{catName}</span>
        </nav>
        <div className="text-4xl mb-2">{meta.emoji}</div>
        <h1 className="font-baloo text-3xl sm:text-4xl font-extrabold mb-2">{catName}</h1>
        <p className="text-white/80 text-sm sm:text-base">{meta.desc}</p>
        {total > 0 && <p className="mt-3 text-white/60 text-sm">{total} products available</p>}
      </div>

      {/* Filters + Sort */}
      <div className="flex flex-wrap gap-3 items-center mb-5 bg-white border-2 border-gray-100 rounded-2xl p-3 sm:p-4">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="text-sm font-bold text-gray-700 whitespace-nowrap">Price Range:</span>
          <input type="number" placeholder="Min ₹" value={minPrice} onChange={e=>setMinPrice(e.target.value)}
            className="w-20 border-2 border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-orange-400"/>
          <span className="text-gray-400">—</span>
          <input type="number" placeholder="Max ₹" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)}
            className="w-20 border-2 border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-orange-400"/>
          {(minPrice||maxPrice) && (
            <button onClick={()=>{setMinPrice("");setMaxPrice("");}} className="text-xs text-red-400 font-bold hover:text-red-600">✕ Clear</button>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm font-bold text-gray-700">Sort:</span>
          <select value={sort} onChange={e=>setSort(e.target.value)}
            className="border-2 border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-orange-400 bg-white">
            {SORT_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array(8).fill(0).map((_,i)=>(
            <div key={i} className="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse"/>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">{meta.emoji}</p>
          <p className="font-baloo text-xl font-bold text-gray-600 mb-2">Is category mein koi product nahi</p>
          <p className="text-gray-400 text-sm mb-6">Seller abhi products add kar raha hoga, thodi der mein wapas aao!</p>
          <button onClick={()=>router.push("/")} className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-bold hover:bg-orange-600 transition-colors">
            ← Home pe jao
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map(p=><ProductCard key={p._id} product={p}/>)}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-bold disabled:opacity-40 hover:border-orange-400 transition-colors">
                ← Prev
              </button>
              {Array.from({length:pages},(_,i)=>i+1).filter(p=>p===1||p===pages||Math.abs(p-page)<=1).map((p,i,arr)=>(
                <>
                  {i>0 && arr[i-1]!==p-1 && <span key={`d${p}`} className="text-gray-400">...</span>}
                  <button key={p} onClick={()=>setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold border-2 transition-all ${page===p ? "bg-indigo-900 border-indigo-900 text-white" : "border-gray-200 hover:border-orange-400"}`}>
                    {p}
                  </button>
                </>
              ))}
              <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-bold disabled:opacity-40 hover:border-orange-400 transition-colors">
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
