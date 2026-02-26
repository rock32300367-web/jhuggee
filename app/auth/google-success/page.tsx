"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function GoogleSuccessContent() {
  const router = useRouter();
  const { setUser } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    const u = searchParams.get("user");
    if (u) {
      try { setUser(JSON.parse(decodeURIComponent(u))); } catch { }
    }
    router.replace("/");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-cream">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 font-medium">Logging in with Google...</p>
    </div>
  );
}

export default function GoogleSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center gap-4 bg-cream">Loading...</div>}>
      <GoogleSuccessContent />
    </Suspense>
  );
}
