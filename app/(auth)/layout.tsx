export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold font-baloo">
            <span className="text-orange-400">Jhug</span><span className="text-white">gee</span>
          </div>
          <p className="text-white/60 text-sm mt-1">India ka apna bazaar</p>
        </div>
        {children}
      </div>
    </div>
  );
}
