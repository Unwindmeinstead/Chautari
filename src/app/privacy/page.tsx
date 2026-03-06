"use client";

import * as React from "react";
import Link from "next/link";

/* ── Design tokens ── */
const F = "#1A3D2B";
const FD = "#0F2419";
const CR = "#FFF8E7";
const AM = "#E8933A";

/* ── Logo ── */
const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <svg width={28} height={28} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="40" rx="12" fill={CR} opacity="0.09" />
      <path d="M14 20L24 14L34 20" stroke={AM} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 14V28" stroke={AM} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 38C24 38 14 32 14 27C14 24.5 16 23 18 23C20 23 22 24.5 24 27C26 24.5 28 23 30 23C32 23 34 24.5 34 27C34 32 24 38 24 38Z" fill={CR} opacity="0.9" />
    </svg>
    <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: CR }}>
      Switch<span style={{ color: AM }}>My</span>Care
    </span>
  </div>
);

/* ── Prose helpers ── */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 40 }}>
    <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: CR, marginBottom: 12, letterSpacing: "-0.01em" }}>{title}</h2>
    <div style={{ fontSize: 15, fontWeight: 300, color: "rgba(255,248,231,0.65)", lineHeight: 1.8 }}>{children}</div>
  </div>
);

const P = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => <p style={{ marginBottom: 12, ...style }}>{children}</p>;

const Ul = ({ items }: { items: string[] }) => (
  <ul style={{ listStyle: "none", paddingLeft: 0, display: "flex", flexDirection: "column", gap: 8 }}>
    {items.map((item, i) => (
      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: AM, flexShrink: 0, marginTop: 8 }} />
        <span style={{ fontSize: 15, fontWeight: 300, color: "rgba(255,248,231,0.65)", lineHeight: 1.75 }}>{item}</span>
      </li>
    ))}
  </ul>
);

const Divider = () => <div style={{ height: 1, background: "rgba(255,248,231,0.06)", margin: "36px 0" }} />;

/* ── Shared Layout ── */
function LegalLayout({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div style={{ minHeight: "100vh", background: FD, fontFamily: "'DM Sans', sans-serif", color: CR }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;0,900;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fu  { animation: fadeUp 0.5s ease forwards; }
        .fu1 { animation: fadeUp 0.5s 0.1s ease both; }
        .fu2 { animation: fadeUp 0.5s 0.18s ease both; }
      ` }} />

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(20px,5vw,64px)", background: "rgba(15,36,25,0.95)", borderBottom: "1px solid rgba(255,248,231,0.06)", backdropFilter: "blur(16px)" }}>
        <Link href="/" style={{ textDecoration: "none" }}><Logo /></Link>
        <Link
          href="/"
          style={{ fontSize: 12, color: hovered ? AM : "rgba(255,248,231,0.4)", textDecoration: "none", display: "flex", alignItems: "center", gap: 5, transition: "color 0.2s", fontFamily: "'DM Mono', monospace" }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          ← Back home
        </Link>
      </nav>

      {/* Hero strip */}
      <div style={{ background: F, borderBottom: "1px solid rgba(255,248,231,0.07)", padding: "clamp(40px,6vw,72px) clamp(20px,5vw,64px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div className="fu" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: AM, marginBottom: 14, fontFamily: "'DM Mono', monospace" }}>
            <span style={{ width: 20, height: 1, background: AM }} /> {eyebrow}
          </div>
          <h1 className="fu1" style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(32px,4.5vw,52px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, color: CR }}>
            {title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(40px,6vw,72px) clamp(20px,5vw,64px) clamp(60px,8vw,100px)" }}>
        <div className="fu2">{children}</div>
      </div>

      {/* Footer */}
      <footer style={{ background: "#0A1A10", borderTop: "1px solid rgba(255,248,231,0.04)", padding: "24px clamp(20px,5vw,64px)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, fontSize: 12, color: "rgba(255,248,231,0.35)" }}>
        <span>© 2026 SwitchMyCare. Not affiliated with DHHS or CMS.</span>
        <div style={{ display: "flex", gap: 16 }}>
          {[["Privacy", "/privacy"], ["Terms", "/terms"], ["HIPAA", "/hipaa"]].map(([l, h]) => (
            <Link key={l} href={h} style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }}
              className="hover:text-[rgba(255,248,231,0.7)]">{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" eyebrow="Your data">
      <P style={{ fontSize: 16, color: "rgba(255,248,231,0.5)", marginBottom: 40, lineHeight: 1.75 }}>
        We only collect information needed to operate SwitchMyCare and support your care-switch workflow. Last updated January 2026.
      </P>

      <Section title="What we collect">
        <Ul items={[
          "Account information: your name, email address, and optional phone number.",
          "Onboarding preferences: county, insurance type, languages spoken, and care needs — used solely for agency matching.",
          "Request-related documents and messages you submit during a switch request.",
          "Usage data: pages visited and features used, collected anonymously to improve the product.",
        ]} />
      </Section>
      <Divider />
      <Section title="How we use it">
        <Ul items={[
          "To match you with Pennsylvania agencies that accept your insurance and serve your area.",
          "To process and coordinate your switch request with both agencies.",
          "To send you updates about your request status via email or SMS (if you opt in).",
          "To improve the platform based on aggregated, anonymized usage patterns.",
        ]} />
      </Section>
      <Divider />
      <Section title="What we never do">
        <Ul items={[
          "We never sell your personal information to third parties.",
          "We never share your data with agencies until you initiate a switch request.",
          "We never use your health information for advertising or profiling.",
        ]} />
      </Section>
      <Divider />
      <Section title="Your rights">
        <P>You can request access to, correction of, or deletion of your personal data at any time by emailing <a href="mailto:privacy@switchmycare.com" style={{ color: AM, textDecoration: "none" }}>privacy@switchmycare.com</a>. We respond within 30 days.</P>
      </Section>
    </LegalLayout>
  );
}
