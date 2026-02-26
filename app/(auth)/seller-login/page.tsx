"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

function SellerLoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUser } = useAuth();
    type AuthMode = "phone" | "email";
    const [authMode, setAuthMode] = useState<AuthMode>("phone");
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [gLoading, setGLoading] = useState(false);
    const [phoneErr, setPhoneErr] = useState("");
    const [emailErr, setEmailErr] = useState("");
    const [passErr, setPassErr] = useState("");
    const [otpErr, setOtpErr] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const urlError = searchParams.get("error");

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
            toast.success("Seller logged in successfully! 🎉");
            router.push("/seller/dashboard");
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
            toast.success("Seller logged in successfully! 🎉");
            router.push("/seller/dashboard");
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
                <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">Seller Portal</p>
            </div>

            <h1 className="text-xl font-bold font-baloo text-indigo-900 mb-1">
                {step === "phone" ? "Seller Login" : "Verify OTP"}
            </h1>
            <p className="text-sm text-gray-500 mb-5">
                {step === "phone" ? "Login to access your seller dashboard" : `OTP sent to +91 ${phone}`}
            </p>

            {urlError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600">
                    {urlError === "google_cancelled" ? "Google login was cancelled" : "Issue with Google login, please try again"}
                </div>
            )}

            {step === "phone" ? (
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
                        {gLoading ? "Redirecting..." : "Login with Google (Gmail)"}
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 font-medium">or alternative</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                        <button className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${authMode === 'phone' ? 'bg-white shadow text-indigo-900' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => { setAuthMode('phone'); setPhoneErr(""); setOtpErr(""); }}>Mobile</button>
                        <button className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${authMode === 'email' ? 'bg-white shadow text-indigo-900' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => { setAuthMode('email'); setEmailErr(""); setPassErr(""); }}>Email</button>
                    </div>

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

                    <p className="text-center text-xs text-gray-400">
                        Agree to our <Link href="#" className="text-orange-500">Terms</Link> & <Link href="#" className="text-orange-500">Privacy Policy</Link>
                    </p>
                    <div className="border-t border-gray-100 pt-4 text-center">
                        <p className="text-sm text-gray-500">Not a seller yet? <Link href="/seller-register" className="text-orange-500 font-semibold">Register here</Link></p>
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

export default function SellerLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SellerLoginContent />
        </Suspense>
    );
}
