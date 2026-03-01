import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Star,
  ChevronRight,
  Heart,
  FileText,
  MessageSquare,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-cream/90 backdrop-blur-md border-b border-forest-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Logo size="sm" />
          <div className="hidden sm:flex items-center gap-6 text-sm text-forest-600">
            <Link href="#how-it-works" className="hover:text-forest-800 transition-colors">How it works</Link>
            <Link href="#agencies" className="hover:text-forest-800 transition-colors">Find agencies</Link>
            <Link href="#about" className="hover:text-forest-800 transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/register">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative">
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-forest-100 opacity-30 -translate-y-1/4 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-amber-200 opacity-20 translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8 animate-slide-up">
          <Badge variant="default" className="mx-auto gap-2 py-1.5 px-4">
            <span className="size-2 rounded-full bg-amber-500 inline-block animate-pulse-soft" />
            Serving Pennsylvania residents
          </Badge>

          <h1 className="font-fraunces text-5xl sm:text-6xl lg:text-7xl font-semibold text-forest-800 leading-[1.05] text-balance">
            Find your perfect{" "}
            <span className="relative">
              <span className="text-forest-600">home care</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 8C60 3 130 1 298 8" stroke="#E8933A" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>{" "}
            agency
          </h1>

          <p className="text-lg sm:text-xl text-forest-500 max-w-2xl mx-auto leading-relaxed text-balance">
            Chautari guides Pennsylvania Medicaid and Medicare patients through finding and switching home health or home care agencies — simply, guided, and completely free.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="xl" asChild>
              <Link href="/auth/register">
                Start for free
                <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="#how-it-works">
                See how it works
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-forest-400 pt-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-forest-500" />
              HIPAA compliant
            </div>
            <div className="hidden sm:block h-4 w-px bg-forest-200" />
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 text-forest-500" />
              Free for patients
            </div>
            <div className="hidden sm:block h-4 w-px bg-forest-200" />
            <div className="flex items-center gap-1.5">
              <Star className="size-4 text-amber-500" />
              PA-verified agencies
            </div>
          </div>

          {/* Multilingual tagline */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-sm text-forest-400">
            <span className="font-medium text-forest-600">Available in:</span>
            <span className="rounded-full bg-forest-50 border border-forest-100 px-3 py-1">English</span>
            <span className="rounded-full bg-forest-50 border border-forest-100 px-3 py-1">नेपाली</span>
            <span className="rounded-full bg-forest-50 border border-forest-100 px-3 py-1">हिन्दी</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <Badge variant="outline">Simple process</Badge>
            <h2 className="font-fraunces text-4xl font-semibold text-forest-800">
              Switching is easier than you think
            </h2>
            <p className="text-forest-500 max-w-xl mx-auto">
              We handle the complexity so you can focus on your care. Most switches complete within 5–7 business days.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <FileText className="size-6 text-forest-600" />,
                title: "Tell us your situation",
                description: "Answer a few quick questions about your care needs, insurance, and location. Takes under 5 minutes.",
              },
              {
                step: "02",
                icon: <Heart className="size-6 text-forest-600" />,
                title: "We match you to agencies",
                description: "Browse verified Pennsylvania agencies that accept your insurance and serve your area.",
              },
              {
                step: "03",
                icon: <MessageSquare className="size-6 text-forest-600" />,
                title: "We manage the switch",
                description: "Chautari coordinates directly with agencies, handles paperwork, and keeps you updated every step.",
              },
            ].map((item) => (
              <div key={item.step} className="relative space-y-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 font-fraunces text-5xl font-bold text-forest-100 leading-none">
                    {item.step}
                  </div>
                  <div className="mt-2 h-10 w-10 rounded-xl bg-forest-100 flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>
                <h3 className="font-fraunces text-xl font-semibold text-forest-800">
                  {item.title}
                </h3>
                <p className="text-forest-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-16 px-4 sm:px-6 bg-forest-600">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { label: "PA counties served", value: "67" },
              { label: "Verified agencies", value: "200+" },
              { label: "Payers accepted", value: "All major" },
              { label: "Average switch time", value: "5 days" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="font-fraunces text-3xl font-bold text-cream">{stat.value}</p>
                <p className="text-forest-200 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="font-fraunces text-4xl font-semibold text-forest-800 text-balance">
            Ready to find better home care?
          </h2>
          <p className="text-forest-500 text-lg">
            Create a free account and start your switch in minutes.
          </p>
          <Button size="xl" asChild>
            <Link href="/auth/register">
              Get started free
              <ChevronRight className="size-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-forest-100 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo size="sm" />
          <div className="flex items-center gap-6 text-sm text-forest-400">
            <Link href="/privacy" className="hover:text-forest-700 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-forest-700 transition-colors">Terms</Link>
            <Link href="/hipaa" className="hover:text-forest-700 transition-colors">HIPAA</Link>
            <Link href="/contact" className="hover:text-forest-700 transition-colors">Contact</Link>
          </div>
          <p className="text-forest-300 text-xs">
            © 2026 Chautari. Not affiliated with DHHS or CMS.
          </p>
        </div>
      </footer>
    </div>
  );
}
