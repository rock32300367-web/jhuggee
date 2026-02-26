"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";

function VerifyPaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const order_id = searchParams.get("order_id");

    const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
    const [message, setMessage] = useState("Verifying your payment with the bank...");

    useEffect(() => {
        if (!order_id) {
            setStatus("failed");
            setMessage("Invalid Request: No Order ID provided.");
            return;
        }

        const verifyOrder = async () => {
            try {
                const response = await axios.post("/api/orders/verify", { order_id });
                setStatus("success");
                setMessage("Payment Verified Successfully! Handing you back to your orders.");
                setTimeout(() => {
                    router.push("/orders");
                }, 2000);
            } catch (err: any) {
                console.error("Verification failed:", err);
                setStatus("failed");
                setMessage(err.response?.data?.message || "Payment Verification failed. Please contact support if amount was deducted.");
            }
        };

        verifyOrder();
    }, [order_id, router]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full text-center">
                {status === "loading" && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 font-baloo">Processing Payment</h2>
                        <p className="text-gray-500 mt-2">{message}</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 font-baloo">Order Confirmed!</h2>
                        <p className="text-gray-500 mt-2">{message}</p>
                    </div>
                )}

                {status === "failed" && (
                    <div className="flex flex-col items-center">
                        <XCircle className="w-16 h-16 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 font-baloo">Payment Failed</h2>
                        <p className="text-gray-500 mt-2">{message}</p>
                        <Button className="mt-6" onClick={() => router.push("/checkout")} fullWidth>Return to Checkout</Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyPaymentPage() {
    return (
        <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>}>
            <VerifyPaymentContent />
        </Suspense>
    );
}
