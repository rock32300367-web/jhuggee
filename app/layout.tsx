import type { Metadata } from "next";
import { Baloo_2, Hind } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
  weight: ["400", "500", "600", "700", "800"],
});

const hind = Hind({
  subsets: ["latin"],
  variable: "--font-hind",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Jhuggee — India ka Bazaar",
  description: "India ka apna online shopping platform. Shop fashion, electronics, home & more at the lowest prices.",
  keywords: "online shopping india, jhuggee, sarees, kurtis, fashion, electronics",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${baloo.variable} ${hind.variable} font-hind bg-[#fffbf5] text-gray-900 antialiased`}>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 2500,
              style: {
                borderRadius: "12px",
                fontFamily: "var(--font-hind)",
                fontSize: "14px",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
