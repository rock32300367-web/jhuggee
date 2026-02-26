"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface User {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  authProvider?: "phone" | "google" | "email";
  role: "buyer" | "seller" | "admin";
  address?: { _id?: string; line1: string; city: string; state: string; pincode: string }[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  cartCount: number;
  setCartCount: (n: number) => void;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  cartCount: 0,
  setCartCount: () => { },
  setUser: () => { },
  logout: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Load user from localStorage (saved after login)
    const saved = localStorage.getItem("jh_user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("jh_user", JSON.stringify(user));
      // Fetch cart count
      axios.get("/api/cart").then((res) => {
        setCartCount(res.data.data?.items?.length || 0);
      }).catch(() => { });
    } else {
      localStorage.removeItem("jh_user");
      setCartCount(0);
    }
  }, [user]);
  const router = useRouter();

  const logout = async () => {
    await axios.post("/api/auth/logout");
    setUser(null);
    setCartCount(0);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, cartCount, setCartCount, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
