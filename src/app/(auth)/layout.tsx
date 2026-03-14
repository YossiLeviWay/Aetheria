import Providers from "@/components/layout/providers";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen flex">
        {/* Left panel — hidden on mobile, visible on md+ */}
        <div className="hidden md:flex md:w-1/2 lg:w-[55%] flex-col justify-between p-12 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}
        >
          {/* Decorative blurred circles */}
          <div className="absolute top-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
          />
          <div className="absolute bottom-[-100px] right-[-60px] w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
          />

          {/* Logo / brand */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg"
                style={{ background: "rgba(255,255,255,0.18)", color: "#fff", backdropFilter: "blur(6px)" }}
              >
                Æ
              </div>
              <span className="text-white text-2xl font-bold tracking-tight">Aetheria</span>
            </div>
          </div>

          {/* Central copy */}
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white leading-snug mb-4">
              Your command center for projects, missions, and tasks
            </h2>
            <p className="text-indigo-200 text-base mb-10 max-w-sm">
              Everything your team needs to stay aligned and ship faster — in one beautiful workspace.
            </p>
            <ul className="space-y-4">
              {[
                { icon: "✦", text: "Organize projects & missions" },
                { icon: "✦", text: "Track tasks across your team" },
                { icon: "✦", text: "Calendar integration built-in" },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-white text-sm font-medium">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    {icon}
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer note */}
          <div className="relative z-10">
            <p className="text-indigo-300 text-xs">
              Trusted by teams who move fast.
            </p>
          </div>
        </div>

        {/* Right panel — auth form */}
        <div className="flex-1 flex items-center justify-center bg-white p-6 sm:p-10">
          <div className="w-full max-w-md">
            {/* Mobile-only brand header */}
            <div className="flex flex-col items-center mb-8 md:hidden">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg mb-3 shadow-md"
                style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)", color: "#fff" }}
              >
                Æ
              </div>
              <span className="text-xl font-bold text-gray-900">Aetheria</span>
              <span className="text-sm text-gray-500 mt-1">Your command center</span>
            </div>
            {children}
          </div>
        </div>
      </div>
    </Providers>
  );
}
