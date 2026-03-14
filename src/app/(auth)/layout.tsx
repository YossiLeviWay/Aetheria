import Providers from "@/components/layout/providers";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-card">
              Æ
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Aetheria</h1>
            <p className="text-text-secondary mt-1 text-sm">Your command center for everything</p>
          </div>
          {children}
        </div>
      </div>
    </Providers>
  );
}
