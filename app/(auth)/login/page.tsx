"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  type AuthMode = "phone" | "email";
  const [authMode, setAuthMode] = useState<AuthMode>("phone");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneErr, setPhoneErr] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [passErr, setPassErr] = useState("");
  const [otpErr, setOtpErr] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const startTimer = () => {
    setResendTimer(30);
    const iv = setInterval(() => setResendTimer(t => { if (t <= 1) { clearInterval(iv); return 0; } return t - 1; }), 1000);
  };

  const sendOTP = async () => {
    setPhoneErr("");
    if (!/^[6-9]\d{9}$/.test(phone)) { setPhoneErr("Enter a valid 10-digit number"); return; }
    setLoading(true);
    try {
      await axios.post("/api/auth/send-otp", { phone });
      toast.success(`OTP sent to +91 ${phone}`);
      setStep("otp"); startTimer();
    } catch (e: any) { toast.error(e.response?.data?.message || "OTP error"); }
    finally { setLoading(false); }
  };

  const loginWithEmail = async () => {
    setEmailErr("");
    setPassErr("");

    let hasErr = false;
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) { setEmailErr("Enter a valid email"); hasErr = true; }
    if (!password) { setPassErr("Please enter your password"); hasErr = true; }
    if (hasErr) return;

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/email/login", { email, password });
      setUser(res.data.data.user);
      toast.success("Logged in successfully! 🎉");
      router.push("/");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setOtpErr("");
    if (otp.length !== 6) { setOtpErr("Enter 6-digit OTP"); return; }
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/verify-otp", { phone, otp });
      setUser(res.data.data.user);
      toast.success("Logged in successfully! 🎉");
      router.push("/");
    } catch (e: any) { setOtpErr(e.response?.data?.message || "Incorrect OTP"); }
    finally { setLoading(false); }
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

      <h1 className="text-xl font-bold font-baloo text-indigo-900 mb-1">
        {step === "phone" ? "Login" : "Verify OTP"}
      </h1>
      <p className="text-sm text-gray-500 mb-5">
        {step === "phone" ? "Login with Mobile or Email" : `OTP sent to +91 ${phone}`}
      </p>

      {step === "phone" ? (
        <div className="space-y-4">

          <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
            <button className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${authMode === 'phone' ? 'bg-white shadow text-indigo-900' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => { setAuthMode('phone'); setPhoneErr(""); setOtpErr(""); }}>Mobile</button>
            <button className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${authMode === 'email' ? 'bg-white shadow text-indigo-900' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => { setAuthMode('email'); setEmailErr(""); setPassErr(""); }}>Email</button>
          </div>

          {authMode === "phone" && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm p-3 rounded-lg mb-4 text-center">
              ⚠️ <b>Notice:</b> Mobile OTP is pending approval. Please use <b>Google (Gmail)</b> or <b>Email</b>.
            </div>
          )}

          {authMode === "phone" ? (
            <>
              <Input label="Mobile Number" prefix="+91" type="tel" maxLength={10}
                value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="9876543210" error={phoneErr}
                onKeyDown={e => e.key === "Enter" && sendOTP()} />
              <Button onClick={sendOTP} loading={loading} fullWidth size="lg">Send OTP →</Button>
            </>
          ) : (
            <>
              <Input label="Email Address" type="email" value={email} onChange={e => { setEmail(e.target.value); setEmailErr("") }} placeholder="rahul@example.com" error={emailErr} onKeyDown={e => e.key === "Enter" && loginWithEmail()} />
              <Input label="Password" type="password" value={password} onChange={e => { setPassword(e.target.value); setPassErr("") }} placeholder="Enter your password" error={passErr} onKeyDown={e => e.key === "Enter" && loginWithEmail()} />
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">Forgot Password?</Link>
              </div>
              <Button onClick={loginWithEmail} loading={loading} fullWidth size="lg">Login →</Button>
            </>
          )}

          <div className="border-t border-gray-100 pt-4 text-center mt-4">
            <p className="text-gray-500">Don't have an account? <Link href="/signup" className="text-orange-500 font-semibold">Sign Up</Link></p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP</label>
            <input type="tel" maxLength={6} value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="• • • • • •"
              className="w-full text-center text-2xl font-bold tracking-[0.5em] border-2 border-gray-200 rounded-xl py-4 outline-none focus:border-orange-400 bg-orange-50/40 transition-all"
              onKeyDown={e => e.key === "Enter" && verifyOTP()} />
            {otpErr && <p className="mt-1 text-xs text-red-500">{otpErr}</p>}
          </div>
          <Button onClick={verifyOTP} loading={loading} fullWidth size="lg">Verify & Login ✓</Button>
          <div className="flex items-center justify-between text-sm">
            <button onClick={() => { setStep("phone"); setOtp(""); }} className="text-gray-400 hover:text-gray-600">← Change number</button>
            {resendTimer > 0 ? <span className="text-gray-400">Resend in {resendTimer}s</span> : <button onClick={sendOTP} className="text-orange-500 font-semibold">Resend OTP</button>}
          </div>
        </div>
      )}
    </div>
  );
}
