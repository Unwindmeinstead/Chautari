"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { motion, useInView } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "@/lib/i18n-context";
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Star,
  ChevronRight,
  ChevronDown,
  Heart,
  FileText,
  MessageSquare,
  Search,
  Users,
  UserCheck,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Quote,
  CheckCircle2,
  Building2,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   Animation helpers
   ═══════════════════════════════════════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Animated counter
   ═══════════════════════════════════════════════════════════════════════════ */
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1500;
    const steps = 40;
    const increment = value / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref} className="font-fraunces text-4xl sm:text-5xl font-bold text-cream">
      {count}{suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FAQ Accordion
   ═══════════════════════════════════════════════════════════════════════════ */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="border-b border-forest-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 sm:py-6 text-left group"
      >
        <span className="font-fraunces text-base sm:text-lg font-semibold text-forest-800 group-hover:text-forest-600 transition-colors">
          {question}
        </span>
        <ChevronDown
          className={`size-5 text-forest-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""
            }`}
        />
      </button>
      <motion.div
        initial={false}
        animate={open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="pb-5 sm:pb-6 text-forest-500 leading-relaxed text-sm sm:text-base pr-8">
          {answer}
        </p>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Top Agencies List
   ═══════════════════════════════════════════════════════════════════════════ */
function TopAgenciesList() {
  const [agencies, setAgencies] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAgencies() {
      try {
        const { searchAgencies } = await import("@/lib/agency-actions");
        const res = await searchAgencies({}, 1, 6);
        if (res.agencies?.length > 0) {
          setAgencies(res.agencies);
        }
      } catch (err) {
        console.error("Failed to fetch agencies:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAgencies();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 rounded-full border-4 border-forest-200 border-t-forest-600 animate-spin" />
      </div>
    );
  }

  // Display mock if empty (user hasn't seeded yet)
  const displayAgencies = agencies.length > 0 ? agencies : [
    { name: "UPMC Home Healthcare", service_counties: ["Allegheny"], google_rating: 4.7, payers_accepted: ["medicare", "medicaid"], services_offered: ["Skilled Nursing", "Rehab Therapies"], pay_rates: { "RN": "$39 - $55/hr", "HHA": "$17.50 - $24/hr" } },
    { name: "Bayada Home Health Care", service_counties: ["Allegheny"], google_rating: 4.6, payers_accepted: ["medicare", "private"], services_offered: ["Skilled Nursing", "Physical Therapy"], pay_rates: { "RN": "$35 - $45/hr", "HHA": "$16 - $20/hr" } },
    { name: "Concordia Visiting Nurses", service_counties: ["Butler"], google_rating: 4.9, payers_accepted: ["medicare", "medicaid"], services_offered: ["Skilled Nursing", "Occupational Therapy"] },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {displayAgencies.map((agency, i) => (
        <motion.div
          key={agency.name + i}
          variants={fadeUp}
          className="rounded-2xl bg-white border border-forest-100 shadow-card p-5 sm:p-6 space-y-3 hover:shadow-card-hover hover:border-forest-200 transition-all duration-300 group flex flex-col"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-forest-100 flex items-center justify-center shrink-0">
                <Building2 className="size-5 text-forest-600" />
              </div>
              <div className="min-w-0 pr-2">
                <h3 className="font-semibold text-forest-800 text-sm group-hover:text-forest-600 transition-colors line-clamp-1">
                  {agency.name}
                </h3>
                <p className="text-xs text-forest-400 truncate">
                  <MapPin className="size-3 inline-block -mt-0.5 mr-0.5" />
                  {(agency.service_counties?.[0] || "Allegheny")} County
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-1 rounded-md border border-amber-100/50">
              <Star className="size-3.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-amber-700">{agency.google_rating || (4.0 + Math.random()).toFixed(1)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {(agency.payers_accepted || []).slice(0, 3).map((p: string) => (
              <Badge key={p} variant="outline" className="text-[10px] px-2 py-0 font-medium bg-forest-50/50 text-forest-600 border-forest-100 border transition-colors hover:bg-forest-100">
                {p.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            ))}
          </div>

          {(agency.pay_rates && Object.keys(agency.pay_rates).length > 0) && (
            <div className="flex flex-wrap gap-3 text-xs font-medium text-forest-700 bg-green-50/30 px-3 py-2 rounded-lg border border-green-100/50">
              {Object.entries(agency.pay_rates).slice(0, 2).map(([role, rate]) => (
                <span key={role} className="flex items-center gap-1">
                  <span className="text-forest-400 uppercase text-[10px] bg-white px-1.5 py-0.5 rounded shadow-sm border border-forest-100/50">{role}</span>
                  {String(rate)}
                </span>
              ))}
            </div>
          )}

          <div className="text-xs text-forest-500 line-clamp-2 leading-relaxed flex-1 mt-1">
            <span className="font-medium text-forest-400">Services:</span> {(agency.services_offered || []).join(", ")}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Page Component
   ═══════════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-cream overflow-hidden">

      {/* ═══════════════════  NAV  ═══════════════════════════════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-cream/90 backdrop-blur-md border-b border-forest-100/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Logo size="sm" />

          <div className="hidden md:flex items-center gap-6 text-sm text-forest-600">
            <Link href="#how-it-works" className="hover:text-forest-800 transition-colors">
              {t("landing_cta_how")}
            </Link>
            <Link href="#agencies" className="hover:text-forest-800 transition-colors">
              {t("search_title")}
            </Link>
            <Link href="#faq" className="hover:text-forest-800 transition-colors">
              FAQ
            </Link>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher compact />
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/auth/login">{t("nav_sign_out").replace("out", "in")}</Link>
            </Button>
            <Button size="sm" asChild className="text-xs sm:text-sm px-3 sm:px-5">
              <Link href="/auth/register">{t("landing_cta_start")}</Link>
            </Button>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden ml-1 p-2 rounded-lg hover:bg-forest-50 text-forest-600"
              aria-label="Menu"
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-forest-100 bg-cream px-4 py-4 space-y-3"
          >
            <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-forest-600 font-medium">
              {t("landing_cta_how")}
            </Link>
            <Link href="#faq" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-forest-600 font-medium">
              FAQ
            </Link>
            <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-forest-600 font-medium">
              Sign in
            </Link>
          </motion.div>
        )}
      </nav>

      {/* ═══════════════════  1. HERO  ═══════════════════════════════════════ */}
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 relative">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-forest-100 opacity-25 -translate-y-1/4 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-amber-200 opacity-20 translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — text + search */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="space-y-6 sm:space-y-8"
            >
              <motion.div variants={fadeUp}>
                <Badge variant="default" className="gap-2 py-1.5 px-4">
                  <span className="size-2 rounded-full bg-amber-500 inline-block animate-pulse-soft" />
                  {t("landing_badge")}
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-fraunces text-4xl sm:text-5xl lg:text-6xl font-semibold text-forest-800 leading-[1.08] text-balance"
              >
                {t("landing_hero_title_1")}{" "}
                <span className="relative inline-block">
                  <span className="text-forest-600">{t("landing_hero_title_2")}</span>
                  <svg className="absolute -bottom-1.5 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 8C60 3 130 1 298 8" stroke="#E8933A" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>{" "}
                {t("landing_hero_title_3")}
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-base sm:text-lg text-forest-500 leading-relaxed max-w-xl"
              >
                {t("landing_hero_desc")}
              </motion.p>

              {/* Search bar */}
              <motion.div variants={fadeUp} className="max-w-md">
                <div className="flex items-center rounded-2xl bg-white border-2 border-forest-100 shadow-card hover:shadow-card-hover hover:border-forest-200 transition-all duration-300 overflow-hidden">
                  <div className="pl-4 pr-2">
                    <Search className="size-5 text-forest-400" />
                  </div>
                  <input
                    type="text"
                    placeholder={t("landing_search_placeholder")}
                    className="flex-1 py-3.5 sm:py-4 pr-2 bg-transparent text-sm sm:text-base text-forest-800 placeholder:text-forest-300 outline-none"
                  />
                  <Link
                    href="/auth/register"
                    className="m-1.5 sm:m-2 shrink-0 bg-forest-600 text-cream-50 hover:bg-forest-700 transition-colors rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold flex items-center gap-1.5"
                  >
                    {t("btn_search")}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                variants={fadeUp}
                className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-forest-400"
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-forest-500" />
                  {t("landing_hipaa")}
                </div>
                <div className="hidden sm:block h-4 w-px bg-forest-200" />
                <div className="flex items-center gap-1.5">
                  <Clock className="size-4 text-forest-500" />
                  {t("landing_free")}
                </div>
                <div className="hidden sm:block h-4 w-px bg-forest-200" />
                <div className="flex items-center gap-1.5">
                  <Star className="size-4 text-amber-500" />
                  {t("landing_verified")}
                </div>
              </motion.div>
            </motion.div>

            {/* Right — hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="rounded-3xl overflow-hidden shadow-modal border-4 border-white/80">
                <Image
                  src="/images/hero-caregiver.png"
                  alt="Home care caregiver with patient"
                  width={600}
                  height={600}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
              {/* Floating stat card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-card-hover border border-forest-100 p-4 flex items-center gap-3"
              >
                <div className="h-11 w-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-forest-800">200+ Verified</p>
                  <p className="text-xs text-forest-400">PA agencies ready</p>
                </div>
              </motion.div>

              {/* Floating rating card */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-card-hover border border-forest-100 px-4 py-3 flex items-center gap-2"
              >
                <div className="flex -space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="size-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-forest-800">4.9/5</span>
              </motion.div>
            </motion.div>
          </div>

          {/* Language availability */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-8 sm:pt-12 text-sm text-forest-400"
          >
            <span className="font-medium text-forest-600">{t("landing_available_in")}</span>
            <span className="rounded-full bg-forest-50 border border-forest-100 px-3 py-1">English</span>
            <span className="rounded-full bg-forest-50 border border-forest-100 px-3 py-1">नेपाली</span>
            <span className="rounded-full bg-forest-50 border border-forest-100 px-3 py-1">हिन्दी</span>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════  2. WHO IS THIS FOR  ════════════════════════════ */}
      <Section className="py-16 sm:py-24 px-4 sm:px-6 bg-white" id="who">
        <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
          <div className="text-center space-y-4">
            <motion.div variants={fadeUp}>
              <Badge variant="outline">{t("landing_who_badge")}</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-fraunces text-3xl sm:text-4xl font-semibold text-forest-800">
              {t("landing_who_title")}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-forest-500 max-w-2xl mx-auto text-sm sm:text-base">
              {t("landing_who_desc")}
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: <UserCheck className="size-6 text-forest-600" />,
                title: t("landing_persona_patient_title"),
                desc: t("landing_persona_patient_desc"),
                gradient: "from-forest-50 to-forest-100/50",
              },
              {
                icon: <Users className="size-6 text-forest-600" />,
                title: t("landing_persona_family_title"),
                desc: t("landing_persona_family_desc"),
                gradient: "from-amber-50 to-amber-100/50",
              },
              {
                icon: <Stethoscope className="size-6 text-forest-600" />,
                title: t("landing_persona_caregiver_title"),
                desc: t("landing_persona_caregiver_desc"),
                gradient: "from-cream to-cream-200/50",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className={`relative rounded-2xl bg-gradient-to-br ${item.gradient} border border-forest-100/60 p-6 sm:p-8 space-y-4 hover:shadow-card-hover hover:border-forest-200 transition-all duration-300 group`}
              >
                <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-fraunces text-lg sm:text-xl font-semibold text-forest-800">
                  {item.title}
                </h3>
                <p className="text-forest-500 leading-relaxed text-sm sm:text-base">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════  3. HOW IT WORKS  ═══════════════════════════════ */}
      <Section className="py-16 sm:py-24 px-4 sm:px-6" id="how-it-works">
        <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
          <div className="text-center space-y-4">
            <motion.div variants={fadeUp}>
              <Badge variant="outline">{t("landing_how_badge")}</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-fraunces text-3xl sm:text-4xl font-semibold text-forest-800">
              {t("landing_how_title")}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-forest-500 max-w-xl mx-auto text-sm sm:text-base">
              {t("landing_how_desc")}
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 sm:gap-10">
            {[
              {
                step: "01",
                icon: <FileText className="size-6 text-forest-600" />,
                title: t("landing_step1_title"),
                desc: t("landing_step1_desc"),
              },
              {
                step: "02",
                icon: <Heart className="size-6 text-forest-600" />,
                title: t("landing_step2_title"),
                desc: t("landing_step2_desc"),
              },
              {
                step: "03",
                icon: <MessageSquare className="size-6 text-forest-600" />,
                title: t("landing_step3_title"),
                desc: t("landing_step3_desc"),
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                className="relative space-y-4 sm:space-y-5"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 font-fraunces text-5xl sm:text-6xl font-bold text-forest-100 leading-none select-none">
                    {item.step}
                  </div>
                  <div className="mt-2 h-11 w-11 rounded-xl bg-forest-100 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                </div>
                <h3 className="font-fraunces text-lg sm:text-xl font-semibold text-forest-800">
                  {item.title}
                </h3>
                <p className="text-forest-500 leading-relaxed text-sm sm:text-base">{item.desc}</p>

                {/* Connector line */}
                {item.step !== "03" && (
                  <div className="hidden md:block absolute top-10 right-0 translate-x-1/2 w-12 border-t-2 border-dashed border-forest-200" />
                )}
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} className="text-center pt-4">
            <Button size="xl" asChild>
              <Link href="/auth/register">
                {t("landing_cta_start")}
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════  4. STATS BAR (animated)  ═══════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-forest-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-amber-400/30 blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6 text-center">
            {[
              { value: 67, suffix: "", label: t("landing_stat_counties") },
              { value: 200, suffix: "+", label: t("landing_stat_agencies") },
              { value: 5, suffix: "+", label: t("landing_stat_payers") },
              { value: 5, suffix: " days", label: t("landing_stat_time") },
            ].map((stat) => (
              <div key={stat.label} className="space-y-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                <p className="text-forest-200 text-xs sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════  5. TESTIMONIALS  ═══════════════════════════════ */}
      <Section className="py-16 sm:py-24 px-4 sm:px-6 bg-white" id="testimonials">
        <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
          <div className="text-center space-y-4">
            <motion.div variants={fadeUp}>
              <Badge variant="outline">{t("landing_testimonials_badge")}</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-fraunces text-3xl sm:text-4xl font-semibold text-forest-800">
              {t("landing_testimonials_title")}
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sita Gurung",
                location: "Allegheny County",
                quote:
                  "Chautari made switching so easy. I was nervous about losing care, but they handled everything. My new agency is wonderful — they even speak Nepali!",
                image: "/images/testimonial-1.png",
                stars: 5,
              },
              {
                name: "James Mitchell",
                location: "Westmoreland County",
                quote:
                  "After my stroke, my old agency wasn't meeting my needs. Chautari found me a better match in 4 days. The whole process was stress-free.",
                image: "/images/testimonial-2.png",
                stars: 5,
              },
              {
                name: "Priya Sharma",
                location: "Allegheny County",
                quote:
                  "I helped my mother switch agencies through Chautari. The team was so patient and guided us through the entire paperwork. Highly recommend!",
                image: "/images/testimonial-3.png",
                stars: 5,
              },
            ].map((testimonial) => (
              <motion.div
                key={testimonial.name}
                variants={fadeUp}
                className="rounded-2xl bg-cream border border-forest-100/60 p-6 sm:p-8 space-y-5 hover:shadow-card-hover transition-all duration-300"
              >
                <Quote className="size-8 text-amber-400/60" />
                <p className="text-forest-600 leading-relaxed text-sm sm:text-base italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-forest-100 shrink-0">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-forest-800 text-sm">{testimonial.name}</p>
                    <p className="text-xs text-forest-400">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: testimonial.stars }).map((_, i) => (
                    <Star key={i} className="size-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════  6. AGENCY PREVIEW  ═════════════════════════════ */}
      <Section className="py-16 sm:py-24 px-4 sm:px-6 bg-forest-50/50" id="agencies">
        <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
          <div className="text-center space-y-4">
            <motion.div variants={fadeUp}>
              <Badge variant="outline" className="bg-white">Pittsburgh agencies</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-fraunces text-3xl sm:text-4xl font-semibold text-forest-800">
              Verified agencies near you
            </motion.h2>
            <motion.p variants={fadeUp} className="text-forest-500 max-w-xl mx-auto text-sm sm:text-base">
              Here are some of the top-rated home care agencies serving the Pittsburgh area. Sign up to see the full directory.
            </motion.p>
          </div>

          <TopAgenciesList />

          <motion.div variants={fadeUp} className="text-center">
            <Button variant="outline" size="lg" asChild className="bg-white hover:bg-forest-50">
              <Link href="/auth/register">
                See all 200+ agencies
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════  7. FAQ  ════════════════════════════════════════ */}
      <Section className="py-16 sm:py-24 px-4 sm:px-6 bg-white" id="faq">
        <div className="max-w-3xl mx-auto space-y-10 sm:space-y-12">
          <div className="text-center space-y-4">
            <motion.div variants={fadeUp}>
              <Badge variant="outline">{t("landing_faq_badge")}</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-fraunces text-3xl sm:text-4xl font-semibold text-forest-800">
              {t("landing_faq_title")}
            </motion.h2>
          </div>

          <motion.div variants={fadeUp} className="rounded-2xl bg-cream border border-forest-100/60 px-6 sm:px-8">
            <FAQItem question={t("landing_faq1_q")} answer={t("landing_faq1_a")} />
            <FAQItem question={t("landing_faq2_q")} answer={t("landing_faq2_a")} />
            <FAQItem question={t("landing_faq3_q")} answer={t("landing_faq3_a")} />
            <FAQItem question={t("landing_faq4_q")} answer={t("landing_faq4_a")} />
            <FAQItem question={t("landing_faq5_q")} answer={t("landing_faq5_a")} />
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════  8. FINAL CTA  ═════════════════════════════════ */}
      <Section className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cream via-cream to-amber-50 opacity-60" />
        <div className="max-w-3xl mx-auto text-center relative z-10 space-y-6 sm:space-y-8">
          <motion.h2
            variants={fadeUp}
            className="font-fraunces text-3xl sm:text-4xl lg:text-5xl font-semibold text-forest-800 text-balance"
          >
            {t("landing_final_title")}
          </motion.h2>
          <motion.p variants={fadeUp} className="text-forest-500 text-base sm:text-lg max-w-xl mx-auto">
            {t("landing_final_desc")}
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="xl" asChild>
              <Link href="/auth/register">
                {t("landing_cta_get_started")}
                <ChevronRight className="size-5" />
              </Link>
            </Button>
          </motion.div>
          <motion.p variants={fadeUp} className="text-sm text-forest-400 flex items-center justify-center gap-2">
            <Phone className="size-4" />
            {t("landing_cta_call")}{" "}
            <a href="tel:+14125551234" className="font-semibold text-forest-600 hover:underline">
              (412) 555-1234
            </a>
          </motion.p>
        </div>
      </Section>

      {/* ═══════════════════  9. FOOTER  ════════════════════════════════════ */}
      <footer className="border-t border-forest-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top footer */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 py-12 sm:py-16">
            <div className="space-y-4 sm:col-span-2 lg:col-span-1">
              <Logo size="sm" />
              <p className="text-sm text-forest-400 leading-relaxed max-w-xs">
                Helping Pennsylvania families find and switch to the right home care agency — guided, simple, and affordable.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-fraunces text-sm font-semibold text-forest-800">For Patients</h4>
              <div className="space-y-2">
                <Link href="/auth/register" className="block text-sm text-forest-400 hover:text-forest-600 transition-colors">
                  Get Started
                </Link>
                <Link href="#how-it-works" className="block text-sm text-forest-400 hover:text-forest-600 transition-colors">
                  How it Works
                </Link>
                <Link href="#agencies" className="block text-sm text-forest-400 hover:text-forest-600 transition-colors">
                  Find Agencies
                </Link>
                <Link href="#faq" className="block text-sm text-forest-400 hover:text-forest-600 transition-colors">
                  FAQ
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-fraunces text-sm font-semibold text-forest-800">{t("landing_footer_agencies")}</h4>
              <div className="space-y-2">
                <Link href="/auth/login" className="block text-sm text-forest-400 hover:text-forest-600 transition-colors">
                  Agency Portal
                </Link>
                <Link href="/auth/register" className="block text-sm text-forest-400 hover:text-forest-600 transition-colors">
                  Partner with Us
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-fraunces text-sm font-semibold text-forest-800">{t("landing_footer_contact")}</h4>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-forest-400">
                  <Phone className="size-4 shrink-0" />
                  <a href="tel:+14125551234" className="hover:text-forest-600 transition-colors">(412) 555-1234</a>
                </div>
                <div className="flex items-center gap-2 text-sm text-forest-400">
                  <Mail className="size-4 shrink-0" />
                  <a href="mailto:help@chautari.health" className="hover:text-forest-600 transition-colors">help@chautari.health</a>
                </div>
                <div className="flex items-start gap-2 text-sm text-forest-400">
                  <MapPin className="size-4 shrink-0 mt-0.5" />
                  <span>Pittsburgh, PA 15213</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom footer */}
          <div className="border-t border-forest-100 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6 text-xs text-forest-400">
              <Link href="/privacy" className="hover:text-forest-700 transition-colors">{t("landing_footer_privacy")}</Link>
              <Link href="/terms" className="hover:text-forest-700 transition-colors">{t("landing_footer_terms")}</Link>
              <Link href="/hipaa" className="hover:text-forest-700 transition-colors">{t("landing_footer_hipaa")}</Link>
            </div>
            <p className="text-forest-300 text-xs">
              © 2026 Chautari. {t("landing_footer_disclaimer")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
