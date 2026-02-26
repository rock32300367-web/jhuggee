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
          <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
            <button className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${authMode === 'phone' ? 'bg-white shadow text-indigo-900' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => { setAuthMode('phone'); setErrors({}); }}>Mobile</button>
            <button className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${authMode === 'email' ? 'bg-white shadow text-indigo-900' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => { setAuthMode('email'); setErrors({}); }}>Email</button>
          </div>

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
