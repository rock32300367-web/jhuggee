import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-indigo-950 text-white mt-10 sm:mt-12">
      <div className="max-w-[1600px] mx-auto px-4 py-8 sm:py-10 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <img src="/Jhuggee_logo.png" alt="Jhuggee Logo" className="w-10 h-10 object-contain" />
            <div className="font-baloo text-3xl font-bold">
              <span className="text-orange-400">Jhug</span><span className="text-white">gee</span>
            </div>
          </div>
          <p className="text-base text-white/60 leading-relaxed max-w-xs mb-5">
            India's own online marketplace — jhuggee.com. Genuine products at the lowest prices.
          </p>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-sm uppercase tracking-widest text-white/40 font-bold mb-4">Company</h4>
          {["About Us", "Press", "Careers", "Blog", "Stories"].map(l => (
            <Link key={l} href="#" className="block text-base text-white/65 hover:text-orange-400 mb-2.5 transition-colors">{l}</Link>
          ))}
        </div>

        {/* Help */}
        <div>
          <h4 className="text-sm uppercase tracking-widest text-white/40 font-bold mb-4">Help</h4>
          {["Track Order", "Returns & Refunds", "Help Center", "Contact Us", "FAQs"].map(l => (
            <Link key={l} href="#" className="block text-base text-white/65 hover:text-orange-400 mb-2.5 transition-colors">{l}</Link>
          ))}
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-sm uppercase tracking-widest text-white/40 font-bold mb-4">Legal</h4>
          {["Privacy Policy", "Terms of Service", "Return Policy", "Shipping Info", "Seller Policy"].map(l => (
            <Link key={l} href="#" className="block text-base text-white/65 hover:text-orange-400 mb-2.5 transition-colors">{l}</Link>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-white/50">
          <span>© 2025 <span className="text-orange-400 font-semibold">jhuggee.com</span> — All Rights Reserved.</span>
          <span>🔒 Safe & Secure Shopping</span>
        </div>
      </div>
    </footer>
  );
}
