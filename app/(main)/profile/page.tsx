"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import axios from "axios";

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);

  // Address state
  const [addrForm, setAddrForm] = useState(false);
  const [addrLoading, setAddrLoading] = useState(false);
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");

  useEffect(() => {
    if (user) {
      axios.get("/api/profile/address")
        .then(res => {
          const fetchedAddresses = res.data.data || [];
          setUser({ ...user, address: fetchedAddresses });
        })
        .catch(console.error);
    }
  }, []);

  if (!user) { router.push("/login"); return null; }

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await axios.put("/api/profile", { name, phone, email });
      setUser(data.data.user);
      import("react-hot-toast").then((module) => {
        module.default.success("Profile updated successfully! 🎉");
      });
    } catch (e: any) {
      import("react-hot-toast").then((module) => {
        module.default.error(e.response?.data?.message || "Failed to update profile");
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!addrName || !addrPhone || !line1 || !city || !state || !pincode) {
      import("react-hot-toast").then((module) => module.default.error("Please fill all fields"));
      return;
    }
    setAddrLoading(true);
    try {
      const { data } = await axios.post("/api/profile/address", { name: addrName, phone: addrPhone, line1, city, state, pincode });
      setUser({ ...user, address: data.data.addresses });
      setAddrForm(false);
      setLine1(""); setCity(""); setState(""); setPincode(""); setAddrName(""); setAddrPhone("");
      import("react-hot-toast").then((module) => {
        module.default.success("Address added successfully! 📍");
      });
    } catch (e: any) {
      import("react-hot-toast").then((module) => {
        module.default.error(e.response?.data?.message || "Failed to add address");
      });
    } finally {
      setAddrLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const { data } = await axios.delete(`/api/profile/address?id=${id}`);
      setUser({ ...user, address: data.data.addresses });
      import("react-hot-toast").then((module) => {
        module.default.success("Address deleted!");
      });
    } catch (e: any) {
      import("react-hot-toast").then((module) => {
        module.default.error(e.response?.data?.message || "Failed to delete address");
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-baloo text-2xl font-bold text-indigo-900 mb-6">👤 My Profile</h1>

      {/* User info card */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name || "Jhuggee User"}</h2>
            <p className="text-white/70 text-sm">
              {user.phone ? `+91 ${user.phone}` : user.email}
            </p>
            <span className="inline-block mt-1 bg-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full capitalize">{user.role}</span>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: "📦", label: "My Orders", href: "/orders" },
          { icon: "🛒", label: "My Cart", href: "/cart" },
          { icon: "❤️", label: "Wishlist", href: "/" },
        ].map(l => (
          <Link key={l.label} href={l.href} className="bg-white border-2 border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-orange-300 hover:shadow-lg transition-all">
            <span className="text-2xl">{l.icon}</span>
            <span className="text-xs font-semibold text-gray-600">{l.label}</span>
          </Link>
        ))}
      </div>

      {/* Edit profile */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 mb-4">
        <h3 className="font-baloo text-lg font-bold text-gray-800 mb-4">Edit Profile</h3>
        <div className="space-y-4">
          <Input label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />

          {/* Email rendering (locked if registered via email, open if via phone) */}
          {user.authProvider === "email" ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
                <span className="text-sm text-gray-500">{user.email}</span>
                <span className="ml-auto text-xs bg-green-100 text-green-600 font-bold px-2 py-0.5 rounded-full">Verified ✓</span>
              </div>
            </div>
          ) : (
            <Input label="Email (Optional)" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
          )}

          {/* Phone rendering (locked if registered via phone, open if via email) */}
          {user.authProvider === "phone" ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
                <span className="text-sm text-gray-500">+91 {user.phone}</span>
                <span className="ml-auto text-xs bg-green-100 text-green-600 font-bold px-2 py-0.5 rounded-full">Verified ✓</span>
              </div>
            </div>
          ) : (
            <Input label="Mobile Number (Optional)" type="tel" value={phone} maxLength={10} prefix="+91" onChange={e => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="Enter mobile number" />
          )}

          <Button onClick={handleSave} loading={loading} fullWidth>Save Changes</Button>
        </div>
      </div>

      {/* Delivery Addresses */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-baloo text-lg font-bold text-gray-800">Delivery Addresses ({user.address?.length || 0}/3)</h3>
          {!addrForm && (user.address?.length || 0) < 3 && (
            <button onClick={() => setAddrForm(true)} className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">+ Add New</button>
          )}
        </div>

        {user.address && user.address.length > 0 ? (
          <div className="space-y-3 mb-4">
            {user.address.map((addr: any) => (
              <div key={addr._id} className="border-2 border-gray-100 rounded-xl p-4 flex justify-between items-start hover:border-orange-200 transition-colors bg-gray-50/50">
                <div>
                  <p className="font-bold text-gray-800 mb-1">{addr.name}</p>
                  <p className="text-sm text-gray-600 mb-1">{addr.line1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                  <p className="text-sm text-gray-600"><strong>Mobile:</strong> +91 {addr.phone}</p>
                </div>
                <button onClick={() => handleDeleteAddress(addr._id!)} className="text-xs text-red-500 hover:text-red-700 hover:bg-red-100 font-semibold px-3 py-1.5 bg-red-50 rounded-lg transition-colors">Delete</button>
              </div>
            ))}
          </div>
        ) : (
          !addrForm && <p className="text-sm text-gray-500 mb-4 text-center py-6 bg-gray-50 rounded-xl border border-gray-100 border-dashed">No saved addresses yet. Add one to checkout faster!</p>
        )}

        {addrForm && (
          <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200 border-dashed space-y-4">
            <h4 className="text-sm font-bold text-gray-700 mb-2">Add New Address</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" value={addrName} onChange={e => setAddrName(e.target.value)} placeholder="e.g. Rahul Kumar" />
              <Input label="Mobile Number" type="tel" maxLength={10} value={addrPhone} onChange={e => setAddrPhone(e.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile" />
            </div>
            <Input label="Street Address" value={line1} onChange={e => setLine1(e.target.value)} placeholder="House No, Building, Area" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input label="City" value={city} onChange={e => setCity(e.target.value)} placeholder="New Delhi" />
              <Input label="State" value={state} onChange={e => setState(e.target.value)} placeholder="Delhi" />
              <Input label="Pincode" type="text" maxLength={6} value={pincode} onChange={e => setPincode(e.target.value)} placeholder="110001" />
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <Button onClick={() => setAddrForm(false)} variant="outline" fullWidth>Cancel</Button>
              <Button onClick={handleAddAddress} loading={addrLoading} fullWidth>Save Address</Button>
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full py-3 border-2 border-red-200 text-red-500 font-bold rounded-2xl hover:bg-red-50 transition-colors">
        🚪 Logout
      </button>
    </div>
  );
}
