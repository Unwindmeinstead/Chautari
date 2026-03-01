import { Logo } from "@/components/ui/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - branding panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden bg-forest-600">
        {/* Grain texture */}
        <div
          className="absolute inset-0 opacity-[0.04] bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px",
          }}
        />

        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-forest-500 opacity-30" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-forest-700 opacity-40" />
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-64 h-64 rounded-full bg-amber-500 opacity-10" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo light size="lg" />

          <div className="space-y-6">
            <blockquote className="text-cream-100">
              <p className="font-fraunces text-2xl xl:text-3xl font-medium leading-snug text-balance">
                &ldquo;Finding the right home care should feel like coming home, not navigating a maze.&rdquo;
              </p>
            </blockquote>

            <div className="flex items-center gap-4 pt-4">
              <div className="h-px flex-1 bg-forest-400 opacity-50" />
              <p className="text-forest-200 text-sm">Serving Pennsylvania since 2025</p>
              <div className="h-px flex-1 bg-forest-400 opacity-50" />
            </div>
          </div>

          <div className="flex items-center gap-6 text-forest-300 text-xs">
            <Link href="/privacy" className="hover:text-cream transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-cream transition-colors">Terms</Link>
            <Link href="/hipaa" className="hover:text-cream transition-colors">HIPAA</Link>
            <span className="ml-auto">© 2025 Chautari</span>
          </div>
        </div>
      </div>

      {/* Right side - form area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-forest-100">
          <Logo size="sm" />
        </div>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md animate-slide-up">
            {children}
          </div>
        </main>

        <footer className="lg:hidden p-4 text-center text-xs text-forest-300">
          © 2025 Chautari · {" "}
          <Link href="/privacy" className="hover:text-forest-600">Privacy</Link>
        </footer>
      </div>
    </div>
  );
}
