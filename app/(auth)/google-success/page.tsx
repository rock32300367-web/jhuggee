"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function GoogleSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const userParam = searchParams.get("user");
    if (userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        setUser(user);
      } catch { }
    }
    router.replace("/");
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 font-medium">Logging in with Google...</p>
    </div>
  );
}

export default function GoogleSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <GoogleSuccessContent />
    </Suspense>
  );
}
