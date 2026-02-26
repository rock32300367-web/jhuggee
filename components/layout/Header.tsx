"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, Package, Menu, X, Search, Store } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = ["Women", "Men", "Kids", "Ethnic Wear", "Footwear", "Electronics", "Beauty", "Home", "Grocery", "Sale 🔥"];

export default function Header() {
  const { user, cartCount, logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/?q=${encodeURIComponent(search.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
    setUserMenu(false);
  };

  return (
    <>
      {/* Main Header */}
      <header className="bg-white border-b-2 border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 relative">
            <img src="/Jhuggee_logo.png" alt="Jhuggee Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            <div className="flex flex-col">
              <div className="font-baloo font-bold text-2xl sm:text-3xl leading-none">
                <span className="text-orange-500">Jhug</span><span className="text-indigo-900">gee</span>
              </div>
            </div>
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 items-center bg-orange-50 border-2 border-gray-200 rounded-full px-4 gap-2 focus-within:border-orange-400 transition-colors">
            <input
              type="text"
              placeholder="Search sarees, kurtis, shoes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none py-2 text-base text-gray-700 placeholder:text-gray-400"
            />
            <button type="submit" className="bg-orange-500 text-white rounded-full p-1.5 hover:bg-orange-600 transition-colors">
              <Search size={14} />
            </button>
          </form>

          {/* Mobile search icon */}
          <button onClick={() => setSearchOpen(!searchOpen)} className="sm:hidden ml-auto p-2 rounded-lg hover:bg-gray-50">
            <Search size={20} className="text-indigo-900" />
          </button>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Link href={process.env.NODE_ENV === "production" ? "https://sellers.jhuggee.com/dashboard" : "http://sellers.localhost:3000/dashboard"} className="hidden md:flex flex-col items-center px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors">
              <Store size={22} className="text-indigo-900" />
              <span className="text-xs text-gray-500 mt-0.5 font-semibold">Sell</span>
            </Link>

            {user && (
              <Link href="/orders" className="hidden sm:flex flex-col items-center px-2 sm:px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                <Package size={22} className="text-indigo-900" />
                <span className="text-xs text-gray-500 mt-0.5 font-semibold">Orders</span>
              </Link>
            )}

            <Link href="/cart" className="flex flex-col items-center px-2 sm:px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors relative">
              <ShoppingCart size={22} className="text-indigo-900" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 right-0.5 bg-orange-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-0.5">
                  {cartCount}
                </span>
              )}
              <span className="text-xs text-gray-500 mt-0.5 font-semibold hidden sm:block">Cart</span>
            </Link>

            <div className="relative">
              <button onClick={() => user ? router.push("/profile") : router.push("/signup")} className="flex flex-col items-center px-2 sm:px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                <User size={22} className="text-indigo-900" />
                <span className="text-xs text-gray-500 mt-0.5 font-semibold hidden sm:block">
                  {user ? (user.name?.split(" ")[0] || "Me") : "Sign Up"}
                </span>
              </button>
            </div>

            {/* Hamburger — mobile only */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden ml-1 p-2 rounded-lg hover:bg-gray-50">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="sm:hidden px-3 pb-3">
            <form onSubmit={handleSearch} className="flex items-center bg-orange-50 border-2 border-orange-300 rounded-full px-4 gap-2">
              <input type="text" placeholder="Search sarees, kurtis..." value={search} onChange={e => setSearch(e.target.value)} autoFocus className="flex-1 bg-transparent outline-none py-2.5 text-base text-gray-700 placeholder:text-gray-400" />
              <button type="submit" className="bg-orange-500 text-white rounded-full p-1.5"><Search size={16} /></button>
            </form>
          </div>
        )}

        {/* Category Nav */}
        <nav className="bg-indigo-950 overflow-x-auto scrollbar-hide">
          <div className="max-w-[1600px] mx-auto px-3 sm:px-4 flex">
            {NAV_LINKS.map(l => (
              <button key={l} onClick={() => router.push(`/category/${l.replace(" 🔥", "")}`)}
                className={`px-3 sm:px-5 py-2.5 sm:py-3 text-sm font-semibold whitespace-nowrap border-b-2 border-transparent hover:border-orange-400 hover:text-orange-400 transition-all ${l.includes("🔥") ? "text-amber-400" : "text-white/75"}`}>
                {l}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMenuOpen(false)}>
          <div className="bg-white w-72 max-w-[85vw] h-full p-6 shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-6">
              <img src="/Jhuggee_logo.png" alt="Jhuggee Logo" className="w-8 h-8 object-contain" />
              <div className="font-baloo font-bold text-2xl leading-none">
                <span className="text-orange-500">Jhug</span><span className="text-indigo-900">gee</span>
              </div>
            </div>
            {user ? (
              <div className="mb-4 p-3 bg-orange-50 rounded-xl">
                <p className="font-bold">{user.name || "User"}</p>
                <p className="text-sm text-gray-500">+91 {user.phone}</p>
              </div>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block w-full bg-orange-500 text-white text-center py-2.5 rounded-xl font-bold mb-4">Login / Sign Up</Link>
            )}
            <div className="space-y-1 mb-4">
              {["Home", "Orders", "Cart", "Profile"].map(l => (
                <Link key={l} href={l === "Home" ? "/" : `/${l.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg hover:bg-orange-50 font-medium text-gray-700">{l}</Link>
              ))}
              <Link href={process.env.NODE_ENV === "production" ? "https://sellers.jhuggee.com/dashboard" : "http://sellers.localhost:3000/dashboard"} onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg hover:bg-orange-50 font-medium text-gray-700">🏪 Sell on Jhuggee</Link>
              {user && <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 rounded-lg text-red-500 font-medium hover:bg-red-50">Logout</button>}
            </div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold px-3 mb-2">Categories</p>
            {NAV_LINKS.map(l => (
              <button key={l} onClick={() => { router.push(`/?category=${l.replace(" 🔥", "")}`); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 text-sm text-gray-600">{l}</button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
