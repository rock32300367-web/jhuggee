"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type Step = "details" | "otp";

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  type AuthMode = "phone" | "email";
  const [authMode, setAuthMode] = useState<AuthMode>("phone");
  const [step, setStep] = useState<Step>("details");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resendTimer, setResendTimer] = useState(0);

  const startTimer = () => {
    setResendTimer(30);
    const iv = setInterval(() => {
      setResendTimer(t => { if (t <= 1) { clearInterval(iv); return 0; } return t - 1; });
    }, 1000);
  };

  const sendOTP = async () => {
    const errs: Record<string, string> = {};
    if (authMode === "phone") {
      if (!/^[6-9]\d{9}$/.test(phone)) errs.phone = "Enter a valid 10-digit number";
    } else {
      if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) errs.email = "Enter a valid email";
      if (password.length < 6) errs.password = "Password must be at least 6 characters";
    }

    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      if (authMode === "phone") {
        await axios.post("/api/auth/send-otp", { phone, type: "signup" });
        toast.success(`OTP sent to +91 ${phone}`);
      } else {
        await axios.post("/api/auth/email/send-otp", { email, type: "signup" });
        toast.success(`OTP sent to ${email}`);
      }
      setStep("otp");
      startTimer();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) { setErrors({ otp: "Enter 6-digit OTP" }); return; }
    setLoading(true);
    try {
      let res;
      if (authMode === "phone") {
        res = await axios.post("/api/auth/verify-otp", { phone, otp });
      } else {
        res = await axios.post("/api/auth/email/signup", { email, password, otp });
      }
      setUser(res.data.data.user);
      toast.success("Account created! Welcome to Jhuggee 🎉");
      router.push("/");
    } catch (err: any) {
      setErrors({ otp: err.response?.data?.message || "Incorrect OTP" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <img src="/Jhuggee_logo.png" alt="Jhuggee Logo" className="w-10 h-10 object-contain" />
          <div className="font-baloo text-3xl font-black">
            <span className="text-orange-500">Jhug</span><span className="text-indigo-900">gee</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">India ka apna bazaar</p>
      </div>

      <h1 className="text-xl font-bold font-baloo text-indigo-900 mb-1">Create Account</h1>
      <p className="text-sm text-gray-500 mb-6">Create a free account to get started.</p>

      {step === "details" ? (
        <div className="space-y-4">
          {/* Google Button */}
          <button
            onClick={() => { setGLoading(true); window.location.assign("/api/auth/google"); }}
            disabled={gLoading}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 px-4 hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold text-gray-700 text-sm disabled:opacity-60"
          >
            {gLoading ? <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : (
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            )}
            {gLoading ? "Redirecting..." : "Sign up with Google (Gmail)"}
          </button>

          <div className="flex items-center gap-3 mb-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or alternative</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
            <button className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${authMode === 'phone' ? 'bg-white shadow text-indigo-900' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => { setAuthMode('phone'); setErrors({}); }}>Mobile</button>
            <button className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${authMode === 'email' ? 'bg-white shadow text-indigo-900' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => { setAuthMode('email'); setErrors({}); }}>Email</button>
          </div>

          {authMode === "phone" && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm p-3 rounded-lg mb-4 text-center">
              ⚠️ <b>Notice:</b> Mobile OTP is pending approval. Please use <b>Google (Gmail)</b> or <b>Email</b>.
            </div>
          )}

          {authMode === "phone" ? (
            <Input label="Mobile Number" prefix="+91" type="tel" maxLength={10} value={phone} onChange={e => { setPhone(e.target.value.replace(/\D/g, "")); setErrors(prev => ({ ...prev, phone: "" })) }} placeholder="9876543210" error={errors.phone} />
          ) : (
            <>
              <Input label="Email Address" type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: "" })) }} placeholder="rahul@example.com" error={errors.email} />
              <Input label="Password" type="password" value={password} onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: "" })) }} placeholder="At least 6 characters" error={errors.password} />
            </>
          )}

          <Button onClick={sendOTP} loading={loading} fullWidth size="lg">Send OTP →</Button>
          <div className="border-t border-gray-100 pt-4 text-center mt-4">
            <p className="text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-orange-500 font-semibold">Log in</Link>
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-indigo-50 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">OTP sent to</p>
              <p className="font-bold text-indigo-900">{authMode === 'phone' ? `+91 ${phone}` : email}</p>
            </div>
            <button onClick={() => setStep("details")} className="text-orange-500 text-xs font-semibold">Change</button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">6-Digit OTP</label>
            <input
              type="tel" maxLength={6} value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="• • • • • •"
              className="w-full text-center text-2xl font-bold tracking-[0.5em] border-2 border-gray-200 rounded-xl py-4 outline-none focus:border-orange-400 bg-orange-50/40 transition-all"
            />
            {errors.otp && <p className="mt-1 text-xs text-red-500">{errors.otp}</p>}
          </div>

          <Button onClick={verifyOTP} loading={loading} fullWidth size="lg">Create Account ✓</Button>

          <div className="flex justify-between text-sm">
            <button onClick={() => setStep("details")} className="text-gray-400">← Go back</button>
            {resendTimer > 0 ? <span className="text-gray-400">Resend in {resendTimer}s</span>
              : <button onClick={sendOTP} className="text-orange-500 font-semibold">Resend OTP</button>}
          </div>
        </div>
      )}
    </div>
  );
}
