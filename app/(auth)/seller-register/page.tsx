"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const INDIAN_STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh", "Chandigarh"];

type Step = "auth" | "shop" | "bank" | "address" | "done";

export default function SellerRegisterPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [step, setStep] = useState<Step>(user ? "shop" : "auth");

  useEffect(() => {
    if (user?.role === "seller") {
      router.replace("/seller/dashboard");
    }
  }, [user, router]);

  // Auth state
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Form data
  const [form, setForm] = useState({
    shopName: "", shopDescription: "", gstin: "",
    accountNumber: "", ifsc: "", accountHolder: "",
    line1: "", city: "", state: "", pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const sendOTP = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) { setErrors({ phone: "Enter a valid number" }); return; }
    setLoading(true);
    try {
      await axios.post("/api/auth/send-otp", { phone });
      toast.success("OTP sent!");
      setOtpSent(true);
    } catch (e: any) { toast.error(e.response?.data?.message || "Error"); }
    finally { setLoading(false); }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) { setErrors({ otp: "Enter 6-digit OTP" }); return; }
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/verify-otp", { phone, otp, name });
      setUser(res.data.data.user);
      setStep("shop");
    } catch (e: any) { setErrors({ otp: e.response?.data?.message || "Incorrect OTP" }); }
    finally { setLoading(false); }
  };

  const submitSeller = async () => {
    setLoading(true);
    try {
      const res = await axios.put("/api/seller/products", {
        shopName: form.shopName,
        shopDescription: form.shopDescription,
        gstin: form.gstin,
        bankAccount: { accountNumber: form.accountNumber, ifsc: form.ifsc, accountHolder: form.accountHolder },
        address: { line1: form.line1, city: form.city, state: form.state, pincode: form.pincode },
      });
      // Update local auth context with new role
      const updatedUser = res.data.data.user;
      setUser({
        id: updatedUser._id,
        phone: updatedUser.phone,
        name: updatedUser.name,
        role: "seller",
      });
      setStep("done");
    } catch (e: any) { toast.error(e.response?.data?.message || "Error"); }
    finally { setLoading(false); }
  };

  const steps = ["Login", "Shop Info", "Bank Details", "Address"];

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8">
      <h1 className="text-2xl font-bold font-baloo text-indigo-900 mb-1">Seller Registration</h1>
      <p className="text-sm text-gray-500 mb-5">Open your shop on Jhuggee — absolutely free!</p>

      {/* Progress */}
      {step !== "done" && (
        <div className="flex gap-2 mb-7">
          {steps.map((s, i) => {
            const active = ["auth", "shop", "bank", "address"].indexOf(step);
            return (
              <div key={s} className="flex-1">
                <div className={`h-1.5 rounded-full transition-all ${i <= active ? "bg-orange-500" : "bg-gray-200"}`} />
                <p className={`text-[10px] mt-1 text-center ${i === active ? "text-orange-500 font-bold" : "text-gray-400"}`}>{s}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Step: Auth */}
      {step === "auth" && (
        <div className="space-y-4">
          <Input label="Your Name" value={name} onChange={e => setName(e.target.value)} placeholder="Rahul Sharma" />
          <Input label="Mobile Number" prefix="+91" type="tel" maxLength={10} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="9876543210" error={errors.phone} />
          {!otpSent ? (
            <Button onClick={sendOTP} loading={loading} fullWidth size="lg">Send OTP →</Button>
          ) : (
            <>
              <Input label="6-Digit OTP" type="tel" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="• • • • • •" error={errors.otp} />
              <Button onClick={verifyOTP} loading={loading} fullWidth size="lg">Verify & Continue ✓</Button>
            </>
          )}
          <p className="text-center text-xs text-gray-400">Already a seller? <Link href="/seller-login" className="text-orange-500 font-semibold">Log in</Link></p>
        </div>
      )}

      {/* Step: Shop */}
      {step === "shop" && (
        <div className="space-y-4">
          <Input label="Shop Name *" value={form.shopName} onChange={e => set("shopName", e.target.value)} placeholder="Sharma Textiles" />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Shop Description</label>
            <textarea
              rows={3} value={form.shopDescription} onChange={e => set("shopDescription", e.target.value)}
              placeholder="Write about your shop..."
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-400 bg-orange-50/40 resize-none"
            />
          </div>
          <Input label="GSTIN (Optional)" value={form.gstin} onChange={e => set("gstin", e.target.value)} placeholder="22AAAAA0000A1Z5" />
          <Button onClick={() => setStep("bank")} fullWidth size="lg" disabled={!form.shopName}>Next: Bank Details →</Button>
        </div>
      )}

      {/* Step: Bank */}
      {step === "bank" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            🔒 Bank details are encrypted and secure. Used for payment settlements.
          </div>
          <Input label="Account Holder Name *" value={form.accountHolder} onChange={e => set("accountHolder", e.target.value)} placeholder="Rahul Sharma" />
          <Input label="Bank Account Number *" type="tel" value={form.accountNumber} onChange={e => set("accountNumber", e.target.value)} placeholder="1234567890123" />
          <Input label="IFSC Code *" value={form.ifsc} onChange={e => set("ifsc", e.target.value.toUpperCase())} placeholder="SBIN0001234" />
          <div className="flex gap-3">
            <Button onClick={() => setStep("shop")} variant="outline" size="lg">← Back</Button>
            <Button onClick={() => setStep("address")} fullWidth size="lg" disabled={!form.accountNumber || !form.ifsc || !form.accountHolder}>Next: Address →</Button>
          </div>
        </div>
      )}

      {/* Step: Address */}
      {step === "address" && (
        <div className="space-y-4">
          <Input label="Shop Address *" value={form.line1} onChange={e => set("line1", e.target.value)} placeholder="123, Main Market, Lajpat Nagar" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City *" value={form.city} onChange={e => set("city", e.target.value)} placeholder="New Delhi" />
            <Input label="Pincode *" type="tel" maxLength={6} value={form.pincode} onChange={e => set("pincode", e.target.value.replace(/\D/g, ""))} placeholder="110024" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">State *</label>
            <select value={form.state} onChange={e => set("state", e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-400 bg-orange-50/40">
              <option value="">Select State</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setStep("bank")} variant="outline" size="lg">← Back</Button>
            <Button onClick={submitSeller} loading={loading} fullWidth size="lg" disabled={!form.line1 || !form.city || !form.state || !form.pincode}>
              Submit Registration →
            </Button>
          </div>
        </div>
      )}

      {/* Done */}
      {step === "done" && (
        <div className="text-center py-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold font-baloo text-indigo-900 mb-2">Registration Complete!</h2>
          <p className="text-gray-500 text-sm mb-6">Your seller account has been sent for review. It will be approved in 24-48 hours.</p>
          <div className="space-y-3">
            <Button onClick={() => router.push("/seller/dashboard")} fullWidth size="lg">Seller Dashboard →</Button>
            <Button onClick={() => router.push("/")} variant="outline" fullWidth>Go to Home</Button>
          </div>
        </div>
      )}
    </div>
  );
}
