"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { motion, useInView } from "framer-motion";
import { User, Users, Building2, Globe, Heart, Stethoscope, Search, CircleCheck, Handshake } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { createClient } from "@/lib/supabase/client";

/* ═══════════════════════════════════════════════════════════════════════════
   Animated Counter Component
   ═══════════════════════════════════════════════════════════════════════════ */
function AnimatedCounter({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(eased * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value]);

  return (
    <span ref={ref} className="font-fraunces text-[38px] font-bold text-cream leading-none tracking-tight tabular-nums">
      {prefix}{count}{suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Landing Page — SwitchMyCare
   Design: editorial serif + monospace accents, dark agency cards, scroll reveals
   ═══════════════════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const [navDark, setNavDark] = React.useState(false);
  const [mobileMenu, setMobileMenu] = React.useState(false);
  const [authUser, setAuthUser] = React.useState<{ name: string; email: string } | null>(null);

  // Check auth state on mount
  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name = (user.user_metadata?.full_name as string) ?? user.email?.split('@')[0] ?? 'Account';
        setAuthUser({ name: name.split(' ')[0], email: user.email ?? '' });
      }
    });
  }, []);

  React.useEffect(() => {
    const onScroll = () => setNavDark(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // scroll reveal
  React.useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("reveal-in"); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    const element = document.querySelector(target);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <style jsx global>{`
        /* ── CSS Variables ── */
        :root {
          --forest: #1A3D2B;
          --forest-d: #0F2419;
          --forest-m: #2A5C41;
          --forest-l: #3D7A57;
          --cream: #FFF8E7;
          --cream-d: #F5EDDA;
          --amber: #E8933A;
          --amber-l: #F2AC5C;
          --muted: #6B7B6E;
          --white: #FFFFFF;
        }

        /* noise grain */
        body::after {
          content: '';
          position: fixed; inset: 0; pointer-events: none; z-index: 999;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        @media (prefers-reduced-motion: reduce) {
          body::after { display: none; }
        }

        /* Reveal animations */
        .reveal {
          opacity: 0; transform: translateY(28px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal-in { opacity: 1; transform: none; }
        .d1 { transition-delay: 0.1s; }
        .d2 { transition-delay: 0.2s; }
        .d3 { transition-delay: 0.3s; }
        .d4 { transition-delay: 0.4s; }

        /* bob / pulse animations */
        @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.75)} }

        .bob,
        .pulse-dot,
        .pulse-dot-slow {
          animation: none;
        }

        @media (prefers-reduced-motion: no-preference) {
          .bob { animation: bob 5s ease-in-out infinite; }
          .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
          .pulse-dot-slow { animation: pulse-dot 3s ease-in-out infinite; }
        }

        /* FAQ answer styling */
        .faq-ans {
          padding: 10px 22px 20px;
        }
        .faq-open .faq-icon-plus { background: var(--amber); border-color: var(--amber); color: var(--forest-d); transform: rotate(45deg); }
      `}</style>

      <div className="min-h-screen bg-cream overflow-x-hidden" style={{ fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif" }}>

        {/* ═══════════════════  NAV  ═══════════════════════════════════════════ */}
        <nav
          className={`fixed top-0 left-0 right-0 z-[200] h-[68px] flex items-center justify-between px-6 md:px-12 transition-all duration-400 border-b ${navDark
            ? "bg-[#0F2419]/97 border-transparent"
            : "bg-cream/90 border-[rgba(26,61,43,0.08)]"
            }`}
          style={{ backdropFilter: "blur(20px) saturate(1.4)" }}
        >
          <Link href="/" className="transition-colors">
            <Logo size="md" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {[["#how-it-works", "How it works"], ["#agencies", "Find agencies"], ["#rights", "Your rights"], ["#faq", "FAQ"]].map(([href, label]) => (
              <Link key={href} href={href} onClick={(e) => handleSmoothScroll(e, href)} className={`text-[14px] font-medium no-underline transition-colors cursor-pointer ${navDark ? "text-cream/90 hover:text-cream" : "text-[#3D5A45] hover:text-forest-600"}`}>{label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {authUser ? (
              <Link href="/dashboard" className={`text-[14px] font-semibold no-underline transition-colors hidden sm:inline ${navDark ? "text-cream hover:text-cream" : "text-forest-600 hover:text-forest-800"}`}>{authUser.name}</Link>
            ) : (
              <Link href="/auth/login" className={`text-[14px] font-medium no-underline transition-colors hidden sm:inline px-4 py-2 rounded-full ${navDark ? "text-cream hover:bg-white/10" : "text-forest-600 hover:bg-forest-50"}`}>Sign in</Link>
            )}
            <Link href="/auth/register" className={`text-[13px] font-medium tracking-wide px-5 py-2 rounded-full no-underline transition-all hover:-translate-y-px ${navDark ? "bg-amber-500 text-[#0F2419]" : "bg-forest-600 text-cream"}`} style={{ boxShadow: "0 8px 24px rgba(26,61,43,0.15)" }}>
              Start for free
            </Link>
            {/* Mobile toggle */}
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg" aria-label="Menu">
              <svg className="w-5 h-5" fill="none" stroke={navDark ? "#FFF8E7" : "#1A3D2B"} viewBox="0 0 24 24">
                {mobileMenu ? <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
          {mobileMenu && (
            <div className="absolute top-[68px] left-0 right-0 bg-cream border-b border-forest-100 px-6 py-4 space-y-3 md:hidden">
              {[["#how-it-works", "How it works"], ["#agencies", "Find agencies"], ["#rights", "Your rights"], ["#faq", "FAQ"],
              ...(authUser ? [["/dashboard", authUser.name]] : [["/auth/login", "Sign in"]])].map(([h, l]) => (
                <Link key={h} href={h} onClick={(e) => { if (h.startsWith('#')) { e.preventDefault(); const element = document.querySelector(h); if (element) { element.scrollIntoView({ behavior: 'smooth' }); } } setMobileMenu(false); }} className="block py-2 text-forest-600 font-medium text-sm">{l}</Link>
              ))}
            </div>
          )}
        </nav>

        {/* ═══════════════════  HERO  ═══════════════════════════════════════ */}
        <section className="min-h-screen grid grid-cols-1 lg:grid-cols-[55%_45%] pt-[68px] relative overflow-hidden">
          {/* Left */}
          <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-16 lg:py-20 relative z-[2]">
            <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(232,147,58,0.06), transparent 70%)" }} />

            <div className="inline-flex items-center gap-2.5 mb-8 font-mono text-[13px] font-medium tracking-[0.12em] uppercase text-amber-500">
              <span className="w-7 h-px bg-amber-500" />Serving Pennsylvania residents
            </div>

            <h1 className="font-fraunces text-[clamp(42px,5.5vw,78px)] font-black leading-[1.0] tracking-[-2.5px] text-forest-600 mb-7">
              Find your<br />perfect home<br />care <em className="italic text-amber-500">agency.</em>
            </h1>

            <p className="text-[17px] font-light leading-[1.75] text-[#6B7B6E] max-w-[460px] mb-11">
              SwitchMyCare guides Pennsylvania Medicaid and Medicare patients through finding and switching home health or home care agencies — simply, guided, and free to browse. When you decide to switch, there&apos;s a one-time $97 coordination fee for paperwork and support.
            </p>

            <div className="flex items-center gap-3.5 flex-wrap mb-12">
              <Link href="/agencies" className="bg-forest-600 text-cream text-sm font-medium tracking-wide px-7 py-3.5 rounded-full no-underline inline-flex items-center gap-2 transition-all hover:bg-[#2A5C41] hover:-translate-y-0.5" style={{ boxShadow: "0 12px 36px rgba(26,61,43,0.22)" }}>
                Browse agencies
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
              <Link href="#how-it-works" onClick={(e) => handleSmoothScroll(e, '#how-it-works')} className="text-base text-[#6B7B6E] no-underline inline-flex items-center gap-1.5 hover:text-forest-600 transition-colors font-medium cursor-pointer">See how it works ↓</Link>
            </div>

            <div className="flex items-center gap-7 flex-wrap pt-7 border-t border-[rgba(26,61,43,0.08)]">
              {["HIPAA compliant", "Free for patients to browse", "PA-verified agencies only", "English · नेपाली · हिन्दी"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-[15px] text-[#6B7B6E] font-medium">
                  <div className="w-[5px] h-[5px] rounded-full bg-[#3D7A57] shrink-0" />{t}
                </div>
              ))}
            </div>
          </div>

          {/* Right — hero image */}
          <div className="relative bg-forest-600 overflow-hidden hidden lg:block" style={{ minHeight: '650px' }}>
            <Image src="/images/hero-home-care.png" alt="Home care caregiver with patient" fill className="object-cover object-center" priority />
            <div className="absolute bottom-0 left-0 right-0 h-[200px]" style={{ background: "linear-gradient(to top, rgba(15,36,25,0.4), transparent)" }} />

            {/* Floating review card */}
            <div className="bob absolute top-8 left-8 z-10 bg-white rounded-[16px] p-4 px-5 shadow-modal border border-[rgba(26,61,43,0.06)] max-w-[250px]">
              <div className="flex gap-0.5 mb-1.5">{[1, 2, 3, 4, 5].map(i => <span key={i} className="text-amber-500 text-sm">★</span>)}</div>
              <div className="text-[14px] font-semibold text-forest-800 leading-[1.45]">&ldquo;Found a better agency in 10 minutes. Couldn&apos;t believe how easy it was.&rdquo;</div>
              <div className="text-[12px] font-bold text-forest-600 mt-2">— Sita G., Allegheny County</div>
            </div>

            {/* Floating badge */}
            <div className="absolute bottom-8 left-7 z-10 bg-cream/95 rounded-2xl p-4 px-5 flex items-center gap-3.5 min-w-[210px] shadow-modal" style={{ backdropFilter: "blur(8px)" }}>
              <div className="w-[38px] h-[38px] rounded-[10px] bg-[rgba(26,61,43,0.08)] flex items-center justify-center shrink-0"><Building2 className="w-5 h-5 text-forest-600" /></div>
              <div>
                <div className="text-[12px] font-medium text-[#6B7B6E] tracking-[0.04em] uppercase">Pittsburgh directory</div>
                <div className="text-[17px] font-bold text-forest-600 leading-tight font-fraunces">27+ listed</div>
              </div>
            </div>
          </div>
          {/* Mobile hero image */}
          <div className="relative h-[360px] lg:hidden overflow-hidden">
            <Image src="/images/hero-home-care.png" alt="Home care caregiver" fill className="object-cover object-center" priority />
            <div className="absolute bottom-0 left-0 right-0 h-[120px]" style={{ background: "linear-gradient(to top, rgba(15,36,25,0.4), transparent)" }} />
          </div>
        </section>

        {/* ═══════════════════  STATS BAR  ═══════════════════════════════════ */}
        <div className="bg-forest-600 flex flex-wrap">
          {[
            { value: 27, suffix: "+", label: "Verified agencies" },
            { value: 97, prefix: "$", label: "Flat coordination fee" },
            { value: 7, suffix: " days", label: "Average switch time" },
            { value: 3, suffix: "+", label: "Languages supported" },
          ].map((stat, i) => (
            <div key={i} className="flex-1 min-w-[50%] sm:min-w-0 py-7 px-5 text-center border-r border-b sm:border-b-0 border-cream/[0.07] last:border-r-0 hover:bg-white/[0.03] transition-colors">
              <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              <div className="text-[11px] text-cream/40 mt-1.5 tracking-[0.05em] uppercase font-mono">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ═══════════════════  HOW IT WORKS  ═══════════════════════════════ */}
        <section className="py-20 lg:py-28 px-8 lg:px-20" id="how-it-works">
          <div className="inline-flex items-center gap-2.5 font-mono text-[13px] font-medium tracking-[0.12em] uppercase text-amber-500 mb-5">
            Simple process<span className="w-8 h-px bg-amber-500" />
          </div>
          <h2 className="font-fraunces text-[clamp(40px,4.5vw,62px)] font-bold leading-[1.05] tracking-[-1.5px] text-forest-600 reveal">
            Switching is easier<br />than you think.
          </h2>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-[3px] rounded-[28px] overflow-hidden">
            {[
              { icon: Search, title: "Tell us your situation", body: "Answer a few quick questions about your care needs, insurance, and location. Takes under 5 minutes. No account required to browse.", cta: "Browse agencies", href: "/agencies", num: "01" },
              { icon: CircleCheck, title: "We match you to agencies", body: "Browse verified Pennsylvania agencies that accept your insurance and serve your area — with real pay rates, CMS star ratings, and Google scores.", cta: "Start your switch", href: "/auth/register", num: "02" },
              { icon: Handshake, title: "We manage the switch", body: "SwitchMyCare coordinates directly with both agencies, handles all CMS-compliant paperwork, and keeps you updated every step. Usually 5–7 business days.", cta: "30-day support included", href: "", num: "03" },
            ].map((s) => (
              <div key={s.num} className={`reveal d${s.num === "01" ? "1" : s.num === "02" ? "2" : "3"} bg-[#0F2419] p-10 lg:p-[52px_40px_44px] relative overflow-hidden group hover:bg-[#2A5C41] transition-colors`}>
                <div className="w-[50px] h-[50px] rounded-[14px] bg-amber-500/[0.12] flex items-center justify-center text-[22px] mb-7"><s.icon className="w-6 h-6 text-amber-500" /></div>
                <div className="font-fraunces text-2xl font-bold text-cream mb-3.5 leading-tight">{s.title}</div>
                <div className="text-sm font-light leading-[1.8] text-cream/70">{s.body}</div>
                {s.href ? (
                  <Link href={s.href} className="inline-flex items-center gap-1.5 text-[13px] text-amber-400 no-underline mt-7 hover:gap-2.5 transition-all">{s.cta} →</Link>
                ) : (
                  <div className="text-[13px] text-cream/50 mt-7">{s.cta}</div>
                )}
                <div className="absolute bottom-3 right-5 font-fraunces text-[100px] font-black text-cream/[0.08] leading-none tracking-[-5px] pointer-events-none group-hover:text-amber-500/[0.1] transition-colors">{s.num}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════  AGENCIES  ═══════════════════════════════════ */}
        <section className="bg-[#0F2419] py-20 lg:py-28 px-8 lg:px-20" id="agencies">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-end mb-14 reveal">
            <div>
              <div className="inline-flex items-center gap-2.5 font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-amber-300 mb-5">Pittsburgh directory<span className="w-8 h-px bg-amber-300" /></div>
              <h2 className="font-fraunces text-[clamp(40px,4.5vw,62px)] font-bold leading-[1.05] tracking-[-1.5px] text-cream">Agencies in<br />one place.</h2>
            </div>
            <p className="text-[15px] font-light leading-[1.75] text-cream/45">Pay rates from public job postings, Google ratings, and Medicare CMS scores. In the app, we keep listings for Allegheny County agencies up to date from public data sources.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[
              { name: "UPMC Home Healthcare", score: "4.5", type: "Home Health · Pittsburgh", payers: "Medicare · Medicaid · Private Pay", lang: "English", rate: "$16–$21/hr", cms: "★★★★☆", accepting: true },
              { name: "BAYADA Home Health Care", score: "4.0", type: "Home Health · Pittsburgh", payers: "Medicare · Medicaid", lang: "English · Spanish", rate: "$15–$19/hr", cms: "★★★★☆", accepting: true },
              { name: "Allegheny Health Network", score: "4.5", type: "Home Health · Pittsburgh", payers: "Medicare · Medicaid · CHC", lang: "English", rate: "$17–$22/hr", cms: "★★★★★", accepting: true },
              { name: "Interim Healthcare Pittsburgh", score: "4.0", type: "Home Health & Care · Pittsburgh", payers: "Medicare · Medicaid · Private", lang: "English", rate: "$14–$18/hr", cms: "★★★☆☆", accepting: true },
              { name: "Presbyterian SeniorCare", score: "4.5", type: "Home Care · Pittsburgh", payers: "Medicaid · CHC · Private Pay", lang: "English", rate: "$15–$19/hr", cms: "★★★★☆", accepting: false },
            ].map((a, i) => (
              <div key={a.name} className={`reveal d${(i % 3) + 1} bg-white/[0.04] border border-cream/[0.07] rounded-[20px] p-6 relative overflow-hidden group hover:bg-white/[0.07] hover:-translate-y-1 hover:border-cream/[0.12] transition-all cursor-pointer`}>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-3.5">
                  <div className="font-fraunces text-[16px] font-semibold text-cream leading-tight max-w-[190px]">{a.name}</div>
                  <div className="bg-amber-500/[0.1] border border-amber-500/[0.18] rounded-lg px-2.5 py-1 font-mono text-xs text-amber-300 shrink-0">★ {a.score}</div>
                </div>
                <div className="flex flex-col gap-1.5 mb-4.5 text-xs text-cream/35">
                  {[a.type, a.payers, a.lang].map((t, j) => (
                    <div key={j} className="flex items-center gap-1.5">
                      <div className="w-[3px] h-[3px] rounded-full bg-cream/20 shrink-0" />{t}
                    </div>
                  ))}
                </div>
                <div className="flex gap-1.5 items-center flex-wrap mt-4">
                  <div className="bg-forest-600/50 border border-[#3D7A57]/25 rounded-lg px-2.5 py-1 text-[11px] font-mono text-cream/60">
                    HHA pay <b className="text-[#7DD4A0] font-medium">{a.rate}</b>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${a.accepting ? "text-[#7DD4A0]" : "text-[rgba(255,210,100,0.75)]"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${a.accepting ? "bg-[#7DD4A0] pulse-dot" : "bg-[rgba(255,210,100,0.75)] pulse-dot-slow"}`} aria-hidden="true" />
                    {a.accepting ? "Accepting" : "Waitlist"}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-cream/[0.06]">
                  <div className="text-[10px] text-cream/20 font-mono">CMS {a.cms}</div>
                  <Link
                    href="/agencies"
                    aria-label={a.accepting ? `Start a switch with ${a.name}` : `View profile for ${a.name}`}
                    className="text-xs font-medium text-amber-300 bg-transparent border-none cursor-pointer flex items-center gap-1 hover:gap-2 transition-all no-underline"
                    style={{ fontFamily: "inherit" }}
                  >
                    {a.accepting ? "Start switch" : "View profile"} →
                  </Link>
                </div>
              </div>
            ))}
            {/* More card */}
            <div className="reveal d3 border border-dashed border-cream/[0.08] rounded-[20px] p-6 flex flex-col justify-center items-center text-center gap-2.5 cursor-pointer hover:border-cream/[0.15] transition-colors">
              <div className="text-[28px] text-cream/15">＋</div>
              <div className="font-fraunces text-lg text-cream/40">22 more agencies</div>
              <div className="text-xs text-cream/20 font-light">Filter by insurance, language,<br />services &amp; location</div>
              <Link href="/agencies" className="text-xs text-amber-300 no-underline flex items-center gap-1 hover:gap-2 transition-all mt-1">View all agencies →</Link>
            </div>
          </div>

          <div className="text-center mt-11 reveal">
            <Link href="/agencies" className="bg-amber-500 text-[#0F2419] text-sm font-medium px-8 py-3.5 rounded-full no-underline inline-flex items-center gap-2 transition-all hover:bg-amber-300 hover:-translate-y-0.5" style={{ boxShadow: "0 12px 36px rgba(232,147,58,0.3)" }}>
              See all 27+ agencies →
            </Link>
          </div>
        </section>

        {/* ═══════════════════  YOUR RIGHTS  ═══════════════════════════════ */}
        <section className="bg-[#F5EDDA] grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center py-20 lg:py-28 px-8 lg:px-20" id="rights">
          <div className="reveal">
            <div className="inline-flex items-center gap-2.5 font-mono text-[13px] font-medium tracking-[0.12em] uppercase text-amber-500 mb-5">Federal law<span className="w-8 h-px bg-amber-500" /></div>
            <h2 className="font-fraunces text-[52px] font-bold tracking-[-1.5px] leading-[1.05] text-forest-600 mb-5">Switching is<br />your <em className="italic text-amber-500">right.</em></h2>
            <p className="text-[16px] font-light leading-[1.75] text-[#6B7B6E] mb-9">Under Medicare&apos;s Conditions of Participation, you can change your home health agency at any time, for any reason — or no reason at all.</p>
            <div className="flex flex-col gap-3">
              {[
                ["01", "You choose your agency", "— not your hospital, doctor, or discharge planner."],
                ["02", "Your agency cannot refuse to discharge you.", "They must cooperate with your transfer by law."],
                ["03", "10 days written notice required", "before any involuntary discharge — you must receive this in writing."],
                ["04", "Switching cannot interrupt your Medicare benefits.", "Coverage continues through your transfer."],
              ].map(([n, b, r]) => (
                <div key={n} className="flex gap-4 items-start bg-white border border-[rgba(26,61,43,0.07)] rounded-[14px] px-5 py-4 hover:border-[rgba(26,61,43,0.14)] hover:translate-x-1 hover:shadow-card transition-all">
                  <span className="font-mono text-[11px] text-amber-500 shrink-0 pt-0.5">{n}</span>
                  <span className="text-sm leading-relaxed text-forest-600"><strong className="font-medium">{b}</strong> {r}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal d2">
            <div className="relative h-[500px] lg:h-[650px] rounded-3xl overflow-hidden shadow-modal">
              <Image src="/images/hero-caregiver.png" alt="Care coordinator with patient" fill className="object-cover" />
              <div className="absolute bottom-6 left-6 bg-forest-600 text-cream p-5 px-6 rounded-[16px] shadow-modal max-w-[260px]">
                <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-amber-300 mb-2">Federal law</div>
                <div className="text-sm font-light leading-[1.55] text-cream/80">Medicare Conditions of Participation §484.50 — Patient Rights</div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════  WHO WE SERVE  ═══════════════════════════════ */}
        <section className="py-20 lg:py-28 px-8 lg:px-20">
          <div className="inline-flex items-center gap-2.5 font-mono text-[13px] font-medium tracking-[0.12em] uppercase text-amber-500 mb-5">Who we serve<span className="w-8 h-px bg-amber-500" /></div>
          <h2 className="font-fraunces text-[clamp(40px,4.5vw,62px)] font-bold leading-[1.05] tracking-[-1.5px] text-forest-600 reveal">Built for<br />Pennsylvania families.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
            {[
              { icon: Heart, title: "Current patients", body: "Not happy with your current home care? Nurse misses visits, care feels rushed. You have the right to switch to a better agency at any time." },
              { icon: Users, title: "Family members", body: "Helping a parent or loved one get better care? We guide you through every step of the process — no guesswork, no bureaucracy." },
              { icon: Building2, title: "Hospital discharge", body: "Going home after a hospital stay? You don't have to accept who your discharge planner suggests. Choose any certified agency in your area." },
              { icon: Globe, title: "Non-English speakers", body: "Pittsburgh's Nepali, Bhutanese, Hindi, and other communities deserve agencies with staff who speak their language. Filter by language spoken." },
            ].map((c, i) => (
              <div key={c.title} className={`reveal d${i + 1} bg-white border border-[rgba(26,61,43,0.09)] rounded-[20px] p-8 relative overflow-hidden group hover:shadow-modal hover:-translate-y-1.5 transition-all`}>
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-forest-600 to-amber-500 scale-x-0 origin-left group-hover:scale-x-100 transition-transform" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forest-600 to-forest-700 flex items-center justify-center mb-5">
                  <c.icon className="w-7 h-7 text-cream" />
                </div>
                <div className="font-fraunces text-[19px] font-semibold text-forest-600 mb-2.5 leading-tight">{c.title}</div>
                <div className="text-[13px] font-light text-[#6B7B6E] leading-[1.75]">{c.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════  TESTIMONIALS  ═══════════════════════════════ */}
        <section className="bg-forest-600 py-20 lg:py-28 px-8 lg:px-20">
          <div className="inline-flex items-center gap-2.5 font-mono text-[13px] font-medium tracking-[0.12em] uppercase text-amber-300 mb-5">Real stories<span className="w-8 h-px bg-amber-300" /></div>
          <h2 className="font-fraunces text-[clamp(40px,4.5vw,62px)] font-bold leading-[1.05] tracking-[-1.5px] text-cream mb-14 reveal">Families trust<br />SwitchMyCare.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { q: "SwitchMyCare made switching so easy. I was nervous about losing care, but they handled everything. My new agency is wonderful — they even speak Nepali!", name: "Sita Gurung", loc: "Allegheny County", img: "/images/sita.png", bg: "bg-[#2A5C41]" },
              { q: "After my stroke, my old agency wasn't meeting my needs. SwitchMyCare found me a better match in 4 days. The whole process was completely stress-free.", name: "James Mitchell", loc: "Westmoreland County", img: "/images/james.png", bg: "bg-amber-500" },
              { q: "The bilingual support was incredible. They explained every step in Spanish and English. My father's new caregiver is amazing. Worth every penny.", name: "Maria Rodriguez", loc: "Butler County", img: "/images/maria.png", bg: "bg-[#3D7A57]" },
            ].map((t, i) => (
              <div key={t.name} className={`reveal d${i + 1} bg-white/[0.05] border border-cream/[0.07] rounded-[20px] p-8 flex flex-col gap-5 hover:bg-white/[0.08] transition-colors`}>
                <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(s => <span key={s} className="text-amber-500 text-sm">★</span>)}</div>
                <p className="text-sm font-light leading-[1.8] text-cream/65 italic flex-1">&ldquo;{t.q}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-cream/[0.07]">
                  <div className={`w-[38px] h-[38px] rounded-full overflow-hidden shrink-0 ${t.bg}`}>
                    <Image src={t.img} alt={t.name} width={38} height={38} className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-cream">{t.name}</div>
                    <div className="text-[11px] text-cream/35">{t.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════  FAQ  ═══════════════════════════════════════ */}
        <section className="bg-[#F5EDDA] grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-16 lg:gap-24 py-20 lg:py-28 px-8 lg:px-20" id="faq">
          <div className="reveal">
            <div className="inline-flex items-center gap-2.5 font-mono text-[13px] font-medium tracking-[0.12em] uppercase text-amber-500 mb-5">Common questions<span className="w-8 h-px bg-amber-500" /></div>
            <h2 className="font-fraunces text-[clamp(36px,4vw,52px)] font-bold leading-[1.05] tracking-[-1.5px] text-forest-600 mb-4">We're here<br />to help.</h2>
            <p className="text-[15px] font-light text-[#6B7B6E] leading-[1.75] mt-4">Need assistance? Our team is here for you. Call <a href="tel:+14125551234" className="text-forest-600 font-medium no-underline">(412) 555-1234</a></p>
          </div>
          <div className="reveal d2 flex flex-col gap-3">
            {[
              [
                "Is switching really free?",
                "Browsing and comparing agencies is always 100% free — no account needed. When you're ready to formally switch, there’s a one-time $97 coordination fee that covers paperwork, both-agency coordination, and 30 days of human support."
              ],
              [
                "Will I lose my current care during the switch?",
                "No. Your current care continues until your new agency is fully set up. We coordinate an exact start date with both agencies so there is zero gap in service — your new agency starts the day your old one ends."
              ],
              [
                "Do I need my doctor's permission to switch?",
                "You do not need anyone’s “permission” to change agencies. Under Medicare’s Conditions of Participation, you have the right to choose your home health agency. Your doctor certifies that you need care, but the agency you pick is up to you."
              ],
              [
                "How long does the switch take?",
                "Most switches complete in 5–7 business days. You’ll see every step in your dashboard and get notifications when forms are sent, signed, and approved. If there’s a safety issue or care gap, we flag your case as urgent."
              ],
              [
                "What insurances do you work with?",
                "We work with all major Pennsylvania payers: Medicare, Medicaid, UPMC Health Plan, Highmark, Aetna Better Health, Community HealthChoices (CHC), and private pay. Each agency profile clearly shows which plans they accept."
              ],
            ].map(([q, a], i) => (
              <FAQItem key={i} question={q} answer={a} defaultOpen={i === 0} />
            ))}
          </div>
        </section>

        {/* ═══════════════════  AGENCY JOIN BAR  ═══════════════════════════ */}
        <div className="bg-cream px-8 lg:px-20 py-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 border-y border-[rgba(26,61,43,0.08)] reveal">
          <div className="flex items-center gap-5">
            <div className="w-[60px] h-[60px] bg-forest-600 rounded-2xl flex items-center justify-center text-[26px] shrink-0">🏢</div>
            <div>
              <div className="font-fraunces text-[26px] font-semibold text-forest-600 leading-tight">Are you a home health agency?</div>
              <div className="text-sm font-light text-[#6B7B6E] mt-1 leading-relaxed">Join SwitchMyCare&apos;s Pennsylvania network. Receive structured referrals from patients ready to switch. No per-referral fees.</div>
            </div>
          </div>
          <Link href="/auth/register?type=agency" className="border-[1.5px] border-forest-600 text-forest-600 text-sm font-medium px-7 py-3 rounded-full no-underline shrink-0 hover:bg-forest-600 hover:text-cream transition-all">
            Join as an agency
          </Link>
        </div>

        {/* ═══════════════════  FINAL CTA  ═══════════════════════════════ */}
        <section className="bg-[#0F2419] py-28 lg:py-40 px-8 text-center relative overflow-hidden">
          <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[800px] h-[700px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(232,147,58,0.07), transparent 65%)" }} />
          <h2 className="font-fraunces text-[clamp(52px,7vw,92px)] font-black italic tracking-[-2.5px] text-cream leading-[1.0] mb-5 reveal relative z-10">
            Ready for<br /><span className="text-amber-500">better care?</span>
          </h2>
          <p className="text-[16px] font-light text-cream/70 max-w-[460px] mx-auto mb-12 leading-[1.75] reveal d1 relative z-10">
            27+ Pittsburgh agencies. Real pay rates. Real ratings. Switching takes 5–7 days and $97. Browse completely free — no account needed.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap reveal d2 relative z-10">
            <Link href="/auth/register" className="bg-amber-500 text-[#0F2419] text-sm font-medium px-8 py-3.5 rounded-full no-underline inline-flex items-center gap-2 transition-all hover:bg-amber-300 hover:-translate-y-0.5" style={{ boxShadow: "0 12px 36px rgba(232,147,58,0.3)" }}>
              Get started free →
            </Link>
            <Link href="/auth/login" className="text-sm text-cream/60 no-underline hover:text-cream transition-colors">Already have an account →</Link>
          </div>
          <p className="text-xs text-cream/50 mt-5 relative z-10">Or call us: <a href="tel:+14125551234" className="text-cream/50 no-underline">(412) 555-1234</a></p>
        </section>

        {/* ═══════════════════  FOOTER  ═══════════════════════════════════ */}
        <footer className="bg-[#0A1A10] px-8 lg:px-20 pt-14 pb-9 border-t border-cream/[0.04]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2.2fr_1fr_1fr_1fr] gap-10 lg:gap-14 mb-12">
            <div>
              <Link href="/" className="block mb-3">
                <Logo size="md" light />
              </Link>
              <p className="text-[13px] font-light text-cream/50 leading-[1.7] max-w-[300px] mb-4">Helping Pennsylvania families find and switch to the right home care agency — guided, simple, and affordable.</p>
              <div className="flex gap-2">{["English", "नेपाली", "हिन्दी"].map(l => <span key={l} className="bg-white/[0.05] border border-white/[0.06] rounded-full px-3 py-0.5 text-[11px] text-cream/50">{l}</span>)}</div>
            </div>
            {[
              { title: "For Patients", links: [["/auth/register", "Get Started"], ["#how-it-works", "How it Works"], ["/agencies", "Find Agencies"], ["#faq", "FAQ"]] },
              { title: "For Agencies", links: [["/auth/login", "Agency Portal"], ["/auth/register", "Partner With Us"]] },
              { title: "Contact", links: [["tel:+14125551234", "(412) 555-1234"], ["mailto:help@switchmycare.com", "help@switchmycare.com"], ["#", "Pittsburgh, PA 15213"]] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-mono text-[10px] tracking-[0.1em] uppercase text-cream/40 font-medium mb-4">{col.title}</h4>
                {col.links.map(([href, label]) => (
                  <Link key={label} href={href} onClick={(e) => href.startsWith('#') ? handleSmoothScroll(e, href) : undefined} className="block text-[13px] font-light text-cream/55 no-underline mb-2.5 hover:text-cream transition-colors">{label}</Link>
                ))}
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.04] pt-6 flex flex-wrap justify-between items-center text-[11px] text-cream/40 font-light gap-2">
            <span>© 2026 SwitchMyCare. Not affiliated with DHHS or CMS.</span>
            <span>
              <Link href="/privacy" className="text-inherit no-underline">Privacy</Link> · <Link href="/terms" className="text-inherit no-underline">Terms</Link> · <Link href="/hipaa" className="text-inherit no-underline">HIPAA</Link>
            </span>
          </div>
        </footer>

      </div>
    </>
  );
}

/* ═══════════════════  FAQ Item Component  ═══════════════════════════════ */
function FAQItem({ question, answer, defaultOpen = false }: { question: string; answer: string; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const answerId = React.useId();
  return (
    <div className={`rounded-[14px] overflow-hidden bg-white border border-[rgba(26,61,43,0.08)] ${open ? "faq-open border-[rgba(26,61,43,0.14)]" : ""}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left bg-transparent border-none p-5 px-[22px] cursor-pointer flex justify-between items-center gap-3 text-[15px] text-forest-600 hover:text-[#2A5C41] transition-colors"
        aria-expanded={open}
        aria-controls={answerId}
        style={{ fontFamily: "inherit" }}
      >
        {question}
        <span className="faq-icon-plus w-6 h-6 rounded-md border border-[rgba(26,61,43,0.15)] flex items-center justify-center text-[16px] text-[rgba(26,61,43,0.4)] shrink-0 transition-all">+</span>
      </button>
      {open && (
        <div id={answerId} className="faq-ans text-sm font-light leading-[1.8] text-[#6B7B6E] px-5 pb-5">
          {answer}
        </div>
      )}
    </div>
  );
}
