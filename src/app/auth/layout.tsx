
import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import * as React from "react";

/* ── Design tokens ── */
const F = "#1A3D2B"; // forest
const CR = "#FFF8E7"; // cream
const AM = "#E8933A"; // amber
const FD = "#0F2419"; // forest dark

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', sans-serif", background: FD }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;0,900;1,700;1,800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .fade-up-d1 { animation: fadeUp 0.6s 0.1s ease both; }
        .fade-up-d2 { animation: fadeUp 0.6s 0.2s ease both; }
        .fade-up-d3 { animation: fadeUp 0.6s 0.3s ease both; }
        input::placeholder { color: rgba(255,248,231,0.25); }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #0F2419 inset !important; -webkit-text-fill-color: #FFF8E7 !important; }
      ` }} />

      {/* ══════════ LEFT PANEL — branding ══════════ */}
      <div style={{
        width: "44%",
        minHeight: "100vh",
        background: F,
        position: "relative",
        overflow: "hidden",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "clamp(36px,5vw,56px)"
      }} className="hidden lg:flex">

        {/* Noise grain */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, pointerEvents: "none" }} />

        {/* Decorative glows */}
        <div style={{ position: "absolute", top: -120, right: -80, width: 360, height: 360, borderRadius: "50%", background: `radial-gradient(circle, rgba(232,147,58,0.1), transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -60, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, rgba(42,92,65,0.6), transparent 70%)`, pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <Logo light size="lg" />
        </div>

        {/* Center content */}
        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Eyebrow */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: AM, marginBottom: 20, fontFamily: "'DM Mono', monospace" }}>
            <span style={{ width: 24, height: 1, background: AM }} /> Patient-first platform
          </div>

          <blockquote style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(22px,2.5vw,30px)", fontWeight: 700, lineHeight: 1.25, color: CR, marginBottom: 32, letterSpacing: "-0.02em" }}>
            &ldquo;Finding the right home care should feel like coming <em style={{ color: AM, fontStyle: "italic" }}>home</em>, not navigating a maze.&rdquo;
          </blockquote>

          {/* Trust badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "HIPAA compliant & secure",
              "Free to browse agencies",
              "Pennsylvania-verified only",
              "English · नेपाली · हिन्दी",
            ].map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 400, color: "rgba(255,248,231,0.6)" }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(232,147,58,0.15)", border: "1px solid rgba(232,147,58,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={AM} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 20, fontSize: 11, color: "rgba(255,248,231,0.3)", flexWrap: "wrap" }}>
          {["Privacy", "Terms", "HIPAA"].map(l => (
            <Link key={l} href={`/${l.toLowerCase()}`} style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }}
              className="hover:text-[rgba(255,248,231,0.6)]">
              {l}
            </Link>
          ))}
          <span style={{ marginLeft: "auto" }}>© 2026 SwitchMyCare</span>
        </div>
      </div>

      {/* ══════════ RIGHT PANEL — form area ══════════ */}
      <div style={{
        flex: 1,
        minHeight: "100vh",
        background: FD,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(32px,5vw,64px) clamp(24px,5vw,72px)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Subtle bg glow */}
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(26,61,43,0.4), transparent 70%)", pointerEvents: "none" }} />

        {/* Mobile Logo */}
        <div style={{ position: "absolute", top: 24, left: 24 }} className="lg:hidden">
          <Logo size="sm" />
        </div>

        <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
