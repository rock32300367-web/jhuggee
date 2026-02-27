"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { Pencil, Trash2, Eye, EyeOff, X } from "lucide-react";

const CATEGORIES = ["Sarees", "Kurtis", "Men's Wear", "Kids", "Footwear", "Electronics", "Jewellery", "Beauty", "Home & Kitchen", "Grocery", "Bags", "Sports"];

const EMPTY_FORM = { name: "", description: "", category: "", price: "", mrp: "", stock: "", images: "", sizes: "", colors: "", tags: "", freeDelivery: true, deliveryDays: "5" };

export default function SellerDashboard() {
  const { user, setUser, loading: loadingAuth } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"dashboard" | "products" | "add">("dashboard");
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({ products: 0, sold: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);     // null = add mode
  const [deleteId, setDeleteId] = useState<string | null>(null);     // confirm modal
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Wait until AuthContext finishes checking the session API
    if (loadingAuth) return;

    if (!user) {
      if (typeof window !== "undefined") {
        const baseUrl = process.env.NODE_ENV === "production" ? "https://www.jhuggee.com" : "http://localhost:3000";
        window.location.href = `${baseUrl}/login`;
      }
      return;
    }
    fetchProducts();
  }, [user, loadingAuth]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/seller/products");
      const prods = res.data.data || [];
      setProducts(prods);
      setStats({
        products: prods.length,
        sold: prods.reduce((s: number, p: any) => s + p.sold, 0),
        revenue: prods.reduce((s: number, p: any) => s + (p.price * p.sold), 0),
      });

      // If user is logged in as buyer but has a seller profile, update context
      if (user && user.role !== "seller") {
        setUser({ ...user, role: "seller" });
      }
    } catch (e: any) {
      if (e.response?.status === 404) {
        router.push("/seller-register");
      }
    }
    finally { setLoading(false); }
  };

  const setF = (k: string, v: string | boolean) => setForm((f: any) => ({ ...f, [k]: v }));

  // Open edit form
  const openEdit = (p: any) => {
    setEditId(p._id);
    setForm({
      name: p.name, description: p.description, category: p.category,
      price: String(p.price), mrp: String(p.mrp), stock: String(p.stock),
      images: p.images?.join(", ") || "",
      sizes: p.sizes?.join(", ") || "",
      colors: p.colors?.join(", ") || "",
      tags: p.tags?.join(", ") || "",
      freeDelivery: p.freeDelivery, deliveryDays: String(p.deliveryDays || 5),
    });
    setTab("add");
  };

  const saveProduct = async () => {
    if (!form.name || !form.category || !form.price || !form.mrp || !form.stock) { toast.error("Fill all required fields"); return; }
    setSaving(true);
    const payload = {
      name: form.name, description: form.description, category: form.category,
      price: Number(form.price), mrp: Number(form.mrp), stock: Number(form.stock),
      images: form.images ? form.images.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      sizes: form.sizes ? form.sizes.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      colors: form.colors ? form.colors.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      tags: form.tags ? form.tags.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      freeDelivery: form.freeDelivery, deliveryDays: Number(form.deliveryDays),
    };
    try {
      if (editId) {
        await axios.patch("/api/seller/products", { productId: editId, ...payload });
        toast.success("Product updated successfully! ✅");
      } else {
        await axios.post("/api/seller/products", payload);
        toast.success("Product added successfully! 🎉");
      }
      setForm(EMPTY_FORM); setEditId(null); setTab("products");
      fetchProducts();
    } catch (e: any) { toast.error(e.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };

  const toggleActive = async (p: any) => {
    try {
      await axios.patch("/api/seller/products", { productId: p._id, isActive: !p.isActive });
      toast.success(p.isActive ? "Product deactivated" : "Product activated");
      fetchProducts();
    } catch { toast.error("Error"); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/seller/products?id=${deleteId}`);
      toast.success("Product deleted successfully! 🗑️");
      setDeleteId(null); fetchProducts();
    } catch { toast.error("Error deleting product"); }
    finally { setDeleting(false); }
  };

  const tabs = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "products", label: "📦 Mere Products" },
    { id: "add", label: editId ? "✏️ Edit Product" : "➕ Add Product" },
  ] as const;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-4 sm:py-6 overflow-x-hidden">

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="font-baloo text-2xl font-bold text-indigo-900">🏪 Seller Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your shop</p>
        </div>
        <Link href="/" className="text-sm text-orange-500 font-semibold border border-orange-300 px-4 py-2 rounded-full hover:bg-orange-50 transition-colors">
          ← Go to Shop
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-gray-100 mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map(t => (
          <button key={t.id} onClick={() => { if (t.id !== "add") { setEditId(null); setForm(EMPTY_FORM); } setTab(t.id); }}
            className={`px-4 sm:px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 -mb-0.5 transition-all ${tab === t.id ? "border-orange-500 text-orange-500" : "border-transparent text-gray-400 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD TAB ── */}
      {tab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Products", value: stats.products, icon: "📦", bg: "bg-blue-50 border-blue-200" },
              { label: "Total Items Sold", value: stats.sold, icon: "🛒", bg: "bg-green-50 border-green-200" },
              { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: "💰", bg: "bg-orange-50 border-orange-200" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border-2 rounded-2xl p-5`}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="font-baloo text-2xl font-bold">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
            <h3 className="font-bold text-amber-800 mb-3">⚡ Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => { setEditId(null); setForm(EMPTY_FORM); setTab("add"); }} size="sm">➕ New Product</Button>
              <Button onClick={() => setTab("products")} variant="outline" size="sm">📦 View Products</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRODUCTS TAB ── */}
      {tab === "products" && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="font-baloo text-lg font-bold text-indigo-900">My Products ({products.length})</h2>
            <Button onClick={() => { setEditId(null); setForm(EMPTY_FORM); setTab("add"); }} size="sm">➕ Add New</Button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-3">📦</p>
              <p className="font-bold text-gray-600 text-lg mb-2">No products</p>
              <p className="text-gray-400 text-sm mb-5">Add your first product!</p>
              <Button onClick={() => setTab("add")}>+ Add Product</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p._id} className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-orange-200 transition-colors">
                  {/* Image */}
                  <div className="aspect-video bg-orange-50 overflow-hidden relative">
                    <img
                      src={p.images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80"}
                      alt={p.name} className="w-full h-full object-cover"
                    />
                    <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${p.isActive ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}>
                      {p.isActive ? "● Active" : "● Inactive"}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="font-semibold text-gray-800 truncate mb-1">{p.name}</p>
                    <p className="text-xs text-gray-400 mb-2">{p.category}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-bold text-lg text-gray-900">₹{p.price}</span>
                        <span className="text-xs text-gray-400 line-through ml-1">₹{p.mrp}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Stock: <span className="font-bold">{p.stock}</span></p>
                        <p className="text-xs text-gray-500">Sold: <span className="font-bold">{p.sold}</span></p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border-2 border-indigo-900 text-indigo-900 text-xs font-bold rounded-lg hover:bg-indigo-900 hover:text-white transition-all"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => toggleActive(p)}
                        title={p.isActive ? "Deactivate" : "Activate"}
                        className={`px-3 py-2 border-2 text-xs font-bold rounded-lg transition-all ${p.isActive ? "border-amber-400 text-amber-600 hover:bg-amber-50" : "border-green-400 text-green-600 hover:bg-green-50"}`}
                      >
                        {p.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => setDeleteId(p._id)}
                        className="px-3 py-2 border-2 border-red-300 text-red-500 text-xs font-bold rounded-lg hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ADD / EDIT PRODUCT TAB ── */}
      {tab === "add" && (
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-baloo text-xl font-bold text-indigo-900">
              {editId ? "✏️ Edit Product" : "➕ Add New Product"}
            </h2>
            {editId && (
              <button onClick={() => { setEditId(null); setForm(EMPTY_FORM); setTab("products"); }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                <X size={16} /> Cancel
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 sm:p-6 space-y-4">
            <Input label="Product Name *" value={form.name} onChange={e => setF("name", e.target.value)} placeholder="e.g. Floral Georgette Saree" />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea rows={3} value={form.description} onChange={e => setF("description", e.target.value)}
                placeholder="Write about the product..."
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-400 bg-orange-50/40 resize-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
              <select value={form.category} onChange={e => setF("category", e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-400 bg-orange-50/40">
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input label="Sale Price ₹ *" type="number" value={form.price} onChange={e => setF("price", e.target.value)} placeholder="399" />
              <Input label="MRP ₹ *" type="number" value={form.mrp} onChange={e => setF("mrp", e.target.value)} placeholder="999" />
              <Input label="Stock *" type="number" value={form.stock} onChange={e => setF("stock", e.target.value)} placeholder="50" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Image URLs <span className="text-gray-400 font-normal">(comma separated)</span></label>
              <textarea rows={2} value={form.images} onChange={e => setF("images", e.target.value)}
                placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-400 bg-orange-50/40 resize-none" />
              {form.images && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {form.images.split(",").map((url: string, i: number) => url.trim() && (
                    <img key={i} src={url.trim()} alt="" className="w-14 h-14 object-cover rounded-lg border-2 border-gray-200" onError={e => (e.currentTarget.style.display = "none")} />
                  ))}
                </div>
              )}
            </div>

            <Input label="Sizes (comma sep, optional)" value={form.sizes} onChange={e => setF("sizes", e.target.value)} placeholder="S, M, L, XL, XXL" />
            <Input label="Colors (comma sep, optional)" value={form.colors} onChange={e => setF("colors", e.target.value)} placeholder="Red, Blue, Green" />
            <Input label="Tags (comma sep)" value={form.tags} onChange={e => setF("tags", e.target.value)} placeholder="saree, ethnic, festive" />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-3 border-2 border-gray-200">
                <input type="checkbox" id="fd" checked={form.freeDelivery} onChange={e => setF("freeDelivery", e.target.checked)} className="w-4 h-4 accent-orange-500" />
                <label htmlFor="fd" className="text-sm font-semibold text-gray-700 cursor-pointer">Free Delivery</label>
              </div>
              <Input label="Delivery Days" type="number" value={form.deliveryDays} onChange={e => setF("deliveryDays", e.target.value)} placeholder="5" />
            </div>

            <Button onClick={saveProduct} loading={saving} fullWidth size="lg">
              {editId ? "✅ Save Changes" : "Add Product →"}
            </Button>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-4xl mb-3 text-center">🗑️</div>
            <h3 className="font-baloo text-lg font-bold text-center mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-500 text-center mb-5">This action cannot be undone. The product will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 text-sm disabled:opacity-60">
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
