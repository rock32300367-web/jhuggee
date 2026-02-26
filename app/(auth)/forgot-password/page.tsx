"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<"email" | "reset">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [emailErr, setEmailErr] = useState("");
    const [otpErr, setOtpErr] = useState("");
    const [passErr, setPassErr] = useState("");
    const [resendTimer, setResendTimer] = useState(0);

    const startTimer = () => {
        setResendTimer(30);
        const iv = setInterval(() => setResendTimer(t => { if (t <= 1) { clearInterval(iv); return 0; } return t - 1; }), 1000);
    };

    const sendOTP = async () => {
        setEmailErr("");
        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) { setEmailErr("Enter a valid email"); return; }

        setLoading(true);
        try {
            await axios.post("/api/auth/email/send-otp", { email });
            toast.success(`OTP sent to ${email}`);
            setStep("reset");
            startTimer();
        } catch (e: any) {
            toast.error(e.response?.data?.message || "OTP Error");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async () => {
        setOtpErr("");
        setPassErr("");

        let hasErr = false;
        if (otp.length !== 6) { setOtpErr("Enter 6-digit OTP"); hasErr = true; }
        if (newPassword.length < 6) { setPassErr("Password must be at least 6 characters"); hasErr = true; }
        if (hasErr) return;

        setLoading(true);
        try {
            await axios.post("/api/auth/email/reset-password", { email, otp, newPassword });
            toast.success("Password reset successfully! 🎉");
            router.push("/login");
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Error resetting password");
            setOtpErr("Invalid OTP or error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md mx-auto my-12">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold font-baloo text-indigo-900 mb-1">
                    {step === "email" ? "Reset Your Password" : "Set New Password"}
                </h1>
                <p className="text-sm text-gray-500">
                    {step === "email" ? "Enter your email to receive a recovery OTP" : `OTP sent to ${email}`}
                </p>
            </div>

            {step === "email" ? (
                <div className="space-y-4">
                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setEmailErr("") }}
                        placeholder="rahul@example.com"
                        error={emailErr}
                        onKeyDown={e => e.key === "Enter" && sendOTP()}
                    />
                    <Button onClick={sendOTP} loading={loading} fullWidth size="lg">Send OTP →</Button>

                    <div className="text-center pt-4">
                        <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-indigo-900">← Back to Log In</Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP</label>
                        <input type="tel" maxLength={6} value={otp}
                            onChange={e => { setOtp(e.target.value.replace(/\D/g, "")); setOtpErr("") }}
                            placeholder="• • • • • •"
                            className="w-full text-center text-2xl font-bold tracking-[0.5em] border-2 border-gray-200 rounded-xl py-4 outline-none focus:border-orange-400 bg-orange-50/40 transition-all"
                        />
                        {otpErr && <p className="mt-1 text-xs text-red-500">{otpErr}</p>}
                    </div>

                    <Input
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={e => { setNewPassword(e.target.value); setPassErr("") }}
                        placeholder="At least 6 characters"
                        error={passErr}
                        onKeyDown={e => e.key === "Enter" && resetPassword()}
                    />

                    <Button onClick={resetPassword} loading={loading} fullWidth size="lg">Reset Password ✓</Button>

                    <div className="flex items-center justify-between text-sm mt-2">
                        <button onClick={() => { setStep("email"); setOtp(""); }} className="text-gray-400 hover:text-gray-600">← Change email</button>
                        {resendTimer > 0 ? <span className="text-gray-400">Resend in {resendTimer}s</span> : <button onClick={sendOTP} className="text-orange-500 font-semibold">Resend OTP</button>}
                    </div>
                </div>
            )}
        </div>
    );
}
