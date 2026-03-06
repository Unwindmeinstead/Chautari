"use client";
import { useState, useEffect, useRef } from "react";

/* ── Fonts ── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #FFF8E7; overflow-x: hidden; }

    :root {
      --forest: #1A3D2B; --forest-d: #0F2419; --forest-m: #2A5C41; --forest-l: #3D7A57;
      --cream: #FFF8E7; --cream-d: #F5EDDA; --amber: #E8933A; --muted: #6B7B6E;
    }
    .ff { font-family: 'Fraunces', Georgia, serif; }
    .fm { font-family: 'DM Mono', monospace; }
    .fb { font-family: 'DM Sans', sans-serif; }

    /* Noise grain */
    body::after {
      content:''; position:fixed; inset:0; pointer-events:none; z-index:9999;
      opacity:0.022;
      background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }

    /* Reveal */
    .reveal { opacity:0; transform:translateY(24px); transition:opacity 0.65s ease, transform 0.65s ease; }
    .reveal-in { opacity:1; transform:none; }
    .d1{transition-delay:0.08s} .d2{transition-delay:0.16s} .d3{transition-delay:0.24s} .d4{transition-delay:0.30s}

    /* Animations */
    @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    @keyframes pdot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
    @media(prefers-reduced-motion:no-preference){
      .bob{animation:bob 5s ease-in-out infinite}
      .pdot{animation:pdot 2s ease-in-out infinite}
      .pdot-slow{animation:pdot 3.2s ease-in-out infinite}
    }

    /* FAQ smooth open */
    .faq-body { overflow:hidden; max-height:0; transition:max-height 0.3s ease, opacity 0.25s ease; opacity:0; }
    .faq-body.open { max-height:200px; opacity:1; }

    /* Nav link hover underline */
    .nav-link { position:relative; }
    .nav-link::after { content:''; position:absolute; left:0; bottom:-2px; width:0; height:1.5px; background:currentColor; transition:width 0.2s ease; }
    .nav-link:hover::after { width:100%; }

    /* Mobile menu slide */
    .mobile-menu { transform:translateY(-8px); opacity:0; transition:transform 0.2s ease, opacity 0.2s ease; }
    .mobile-menu.open { transform:translateY(0); opacity:1; }

    /* Scrollbar */
    ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#1A3D2B40;border-radius:3px}
  `}</style>
);

/* ── Icons ── */
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.5 }: { d: string | string[]; size?: number; stroke?: string; fill?: string; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
  </svg>
);
const ArrowRight = ({ size = 16 }) => <Icon size={size} d="M5 12h14M12 5l7 7-7 7" />;
const Search = ({ size = 20, stroke = "currentColor" }) => <Icon size={size} stroke={stroke} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />;
const CheckCircle = ({ size = 20, stroke = "currentColor" }) => <Icon size={size} stroke={stroke} d={["M22 11.08V12a10 10 0 1 1-5.93-9.14", "M22 4L12 14.01l-3-3"]} />;
const Handshake = ({ size = 20, stroke = "currentColor" }) => <Icon size={size} stroke={stroke} d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />;
const Building = ({ size = 22, stroke = "currentColor" }) => <Icon size={size} stroke={stroke} d={["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"]} />;
const Heart = ({ size = 24, stroke = "currentColor" }) => <Icon size={size} stroke={stroke} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />;
const Users = ({ size = 24, stroke = "currentColor" }) => <Icon size={size} stroke={stroke} d={["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75", "M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0"]} />;
const Globe = ({ size = 24, stroke = "currentColor" }) => <Icon size={size} stroke={stroke} d={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M2 12h20", "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"]} />;
const MapPin = ({ size = 14 }) => <Icon size={size} d={["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", "M12 7m-3 0a3 3 0 1 0 6 0 a3 3 0 1 0-6 0"]} />;
const Phone = ({ size = 14 }) => <Icon size={size} d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l1.06-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />;
const Menu = () => <Icon size={20} d={["M3 12h18", "M3 6h18", "M3 18h18"]} />;
const X = () => <Icon size={20} d={["M18 6L6 18", "M6 6l12 12"]} />;
const Star = ({ filled, size = 14 }: { filled?: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#F59E0B" : "#E5E7EB"} stroke="none">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);
const ChevronDown = ({ size = 16, open }: { size?: number; open: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease" }}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/* ── Logo ── */
const Logo = ({ light = false }) => {
  const c = light ? "#FFF8E7" : "#1A3D2B";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width={32} height={32} viewBox="0 0 48 48" fill="none">
        <rect x="4" y="4" width="40" height="40" rx="12" fill={c} opacity="0.09" />
        <path d="M14 20L24 14L34 20" stroke="#E8933A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 14V28" stroke="#E8933A" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M24 38C24 38 14 32 14 27C14 24.5 16 23 18 23C20 23 22 24.5 24 27C26 24.5 28 23 30 23C32 23 34 24.5 34 27C34 32 24 38 24 38Z" fill={c} opacity="0.9" />
      </svg>
      <span className="ff" style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", lineHeight: 1, color: light ? "#FFF8E7" : "#1A3D2B" }}>
        Switch<span style={{ color: "#E8933A" }}>My</span>Care
      </span>
    </div>
  );
};

/* ── Animated Counter ── */
function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    const dur = 1800, t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 4)) * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, value]);
  return <span ref={ref} className="ff" style={{ fontSize: 36, fontWeight: 800, color: "#FFF8E7", lineHeight: 1, letterSpacing: "-0.03em" }}>{prefix}{count}{suffix}</span>;
}

/* ── FAQ Item ── */
function FAQItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderRadius: 14, overflow: "hidden", background: "#fff", border: open ? "1px solid rgba(26,61,43,0.16)" : "1px solid rgba(26,61,43,0.08)" }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "18px 22px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#1A3D2B", fontWeight: 500 }}>
        {q}
        <span style={{ width: 26, height: 26, borderRadius: 8, border: open ? "1px solid #E8933A" : "1px solid rgba(26,61,43,0.15)", background: open ? "#E8933A" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: open ? "#0F2419" : "rgba(26,61,43,0.4)", fontSize: 18, flexShrink: 0, transition: "all 0.2s ease", transform: open ? "rotate(45deg)" : "none" }}>+</span>
      </button>
      <div className={`faq-body ${open ? "open" : ""}`}>
        <div style={{ padding: "0 22px 20px", fontSize: 14, lineHeight: 1.8, color: "#6B7B6E", fontWeight: 300 }}>{a}</div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function LandingPage() {
  const [navDark, setNavDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavDark(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("reveal-in"); }),
      { threshold: 0.06 }
    );
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (e: any, id: string) => {
    e.preventDefault();
    setMenuOpen(false);
    const el = document.querySelector(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: "smooth" });
  };

  const F = "#1A3D2B", FD = "#0F2419", FM = "#2A5C41", CR = "#FFF8E7", AM = "#E8933A", MU = "#6B7B6E";

  return (
    <div className="fb" style={{ background: CR, minHeight: "100vh", overflowX: "hidden" }}>
      <FontLoader />

      {/* ══════════ NAV ══════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, height: 68,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(20px, 4vw, 48px)",
        backdropFilter: "blur(20px) saturate(1.4)",
        background: navDark ? "rgba(15,36,25,0.97)" : "rgba(255,248,231,0.92)",
        borderBottom: navDark ? "1px solid transparent" : "1px solid rgba(26,61,43,0.08)",
        transition: "background 0.35s ease, border-color 0.35s ease",
      }}>
        <a href="#" style={{ textDecoration: "none" }}><Logo light={navDark} /></a>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 32, position: "absolute", left: "50%", transform: "translateX(-50%)" }} className="desktop-nav">
          {[["#how-it-works", "How it works"], ["#agencies", "Find agencies"], ["#rights", "Your rights"], ["#faq", "FAQ"]].map(([h, l]) => (
            <a key={h} href={h} onClick={e => scrollTo(e, h)} className="nav-link"
              style={{ fontSize: 13, textDecoration: "none", color: navDark ? "rgba(255,248,231,0.6)" : (MU as any), fontWeight: 500, transition: "color 0.2s" }}>
              {l}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Sign in — desktop only */}
          <a href="/auth/login" className="desktop-nav" style={{ fontSize: 13, textDecoration: "none", color: navDark ? "rgba(255,248,231,0.55)" : (MU as any), fontWeight: 400, transition: "color 0.2s" }}>Sign in</a>
          {/* CTA */}
          <a href="/auth/register" style={{
            fontSize: 13, fontWeight: 600, letterSpacing: "0.01em", padding: "8px 20px",
            borderRadius: 100, textDecoration: "none", whiteSpace: "nowrap",
            background: navDark ? AM : F, color: navDark ? FD : CR,
            transition: "all 0.2s ease", boxShadow: "0 6px 20px rgba(26,61,43,0.18)",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            Start free
          </a>
          {/* Hamburger */}
          <button onClick={() => setMenuOpen(v => !v)}
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 6, color: navDark ? CR : F }}
            className="hamburger">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className={`mobile-menu ${menuOpen ? "open" : ""}`} style={{
          position: "absolute", top: 68, left: 0, right: 0,
          background: CR, borderBottom: `1px solid rgba(26,61,43,0.1)`,
          padding: "16px 24px 20px",
          boxShadow: "0 12px 40px rgba(26,61,43,0.12)",
          display: menuOpen ? "flex" : "none", flexDirection: "column", gap: 4,
        }}>
          {[["#how-it-works", "How it works"], ["#agencies", "Find agencies"], ["#rights", "Your rights"], ["#faq", "FAQ"], ["/auth/login", "Sign in"]].map(([h, l]) => (
            <a key={h} href={h} onClick={e => h.startsWith('#') ? scrollTo(e, h) : setMenuOpen(false)}
              style={{ display: "block", padding: "10px 4px", fontSize: 15, fontWeight: 500, color: F, textDecoration: "none", borderBottom: "1px solid rgba(26,61,43,0.06)" }}>
              {l}
            </a>
          ))}
          <a href="/auth/register" style={{
            display: "block", marginTop: 12, textAlign: "center", padding: "12px", borderRadius: 12,
            background: F, color: CR, fontSize: 15, fontWeight: 600, textDecoration: "none",
          }}>Start free — it's always free to browse</a>
        </div>
      </nav>

      <style>{`
        @media(max-width:768px){
          .desktop-nav{display:none!important}
          .hamburger{display:flex!important}
        }
      `}</style>

      {/* ══════════ HERO ══════════ */}
      <section id="home" style={{ display: "grid", gridTemplateColumns: "1fr", minHeight: 720, paddingTop: 68 }}>
        <style>{`@media(min-width:1024px){#hero-grid{grid-template-columns:55% 45%!important}}`}</style>
        <div id="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr", minHeight: 720 }}>
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(48px,6vw,80px) clamp(24px,5vw,80px)", position: "relative", zIndex: 2 }}>
            <div style={{ position: "absolute", top: -150, right: -80, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,147,58,0.07), transparent 70%)", pointerEvents: "none" }} />

            {/* Label */}
            <div className="fm" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 28, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: AM }}>
              <span style={{ width: 28, height: 1, background: AM }} />
              Serving Pennsylvania residents
            </div>

            {/* H1 */}
            <h1 className="ff" style={{ fontSize: "clamp(44px,5.5vw,76px)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.03em", color: F, marginBottom: 24 }}>
              Find your<br />perfect home<br />care <em style={{ fontStyle: "italic", color: AM }}>agency.</em>
            </h1>

            {/* Sub — shortened, punchy */}
            <p style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.7, color: (MU as any), maxWidth: 440, marginBottom: 36 }}>
              Pennsylvania&apos;s free tool for Medicaid &amp; Medicare patients to find, compare, and switch home care agencies — guided every step of the way.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 44 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <a href="/agencies" style={{
                  background: F, color: CR, fontSize: 14, fontWeight: 600, letterSpacing: "0.01em",
                  padding: "13px 28px", borderRadius: 100, textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: 8,
                  boxShadow: "0 12px 32px rgba(26,61,43,0.22)", transition: "all 0.2s ease",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = FM; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = F; e.currentTarget.style.transform = "translateY(0)"; }}>
                  Browse agencies <ArrowRight size={15} />
                </a>
                <a href="#how-it-works" onClick={e => scrollTo(e, "#how-it-works")}
                  style={{ fontSize: 15, color: (MU as any), textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 500, transition: "color 0.2s", alignSelf: "center" }}
                  onMouseEnter={e => e.currentTarget.style.color = F}
                  onMouseLeave={e => e.currentTarget.style.color = (MU as any)}>
                  See how it works
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                </a>
              </div>
            </div>

            {/* Trust badges — 2-col grid on mobile */}
            <div style={{ borderTop: "1px solid rgba(26,61,43,0.08)", paddingTop: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                {["HIPAA compliant", "Free to browse", "PA-verified agencies", "3 languages supported"].map(t => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: (MU as any), fontWeight: 500 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#3D7A57", flexShrink: 0 }} />{t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right image placeholder */}
          <div style={{ background: F, position: "relative", overflow: "hidden", minHeight: 420 }}>
            <img src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1200" alt="Caregiver with senior"
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, background: "linear-gradient(to top, rgba(15,36,25,0.6), transparent)" }} />

            {/* Floating card */}
            <div className="reveal bob" style={{ position: "absolute", top: 40, left: 40, background: "#fff", padding: "16px 20px", borderRadius: 16, maxWidth: 240, boxShadow: "0 12px 40px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>{[1, 2, 3, 4, 5].map(i => <Star key={i} filled />)}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0F2419", lineHeight: 1.4 }}>"Found a better agency in 10 minutes. Couldn't believe how easy it was."</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: (MU as any), marginTop: 8 }}>— Sita G., Allegheny County</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <div style={{ background: F, display: "flex", flexWrap: "wrap" }}>
        {[
          { v: 27, s: "+", l: "Verified agencies" },
          { v: 97, p: "$", l: "Flat coordination fee" },
          { v: 7, s: " days", l: "Average switch time" },
          { v: 3, s: "+", l: "Languages supported" },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, minWidth: "50%", padding: "28px 20px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,248,231,0.06)" : "none", borderBottom: i < 2 && window.innerWidth < 768 ? "1px solid rgba(255,248,231,0.06)" : "none" }}>
            <AnimatedCounter value={s.v} prefix={s.p} suffix={s.s} />
            <div className="fm" style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,248,231,0.4)", marginTop: 8 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section id="how-it-works" style={{ padding: "clamp(64px,10vw,120px) clamp(24px,5vw,80px)" }}>
        <div className="fm reveal" style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: AM, marginBottom: 16 }}>
          Simple process <span style={{ display: "inline-block", width: 32, height: 1, background: AM, verticalAlign: "middle", marginLeft: 4 }} />
        </div>
        <h2 className="ff reveal d1" style={{ fontSize: "clamp(36px,4.5vw,60px)", fontWeight: 800, lineHeight: 1.1, color: F, letterSpacing: "-0.02em", marginBottom: 64 }}>
          Switching is easier<br />than you think.
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 4, borderRadius: 28, overflow: "hidden" }} className="reveal d2">
          {[
            { n: "01", i: <Search stroke={AM} />, t: "Tell us your situation", b: "Answer a few quick questions about your care needs, insurance, and location. Takes under 5 mins." },
            { n: "02", i: <CheckCircle stroke={AM} />, t: "Compare verified matches", b: "Browse agencies that accept your insurance and serve your area — with real pay rates and CMS ratings." },
            { n: "03", i: <Handshake stroke={AM} />, t: "We manage the switch", b: "We coordinate with both agencies, handle all paperwork, and keep you updated. Usually 5–7 business days." },
          ].map((s, idx) => (
            <div key={idx} style={{ background: FD, padding: "52px 40px 48px", position: "relative" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(232,147,58,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>{s.i}</div>
              <h3 className="ff" style={{ fontSize: 22, fontWeight: 700, color: CR, marginBottom: 16 }}>{s.t}</h3>
              <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: "rgba(255,248,231,0.6)", position: "relative", zIndex: 2 }}>{s.b}</p>
              <div className="ff" style={{ position: "absolute", bottom: 4, right: 16, fontSize: 100, fontWeight: 900, color: "rgba(255,248,231,0.07)", letterSpacing: "-0.05em" }}>{s.n}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ DIRECTORY PREVIEW ══════════ */}
      <section id="agencies" style={{ background: FD, padding: "clamp(64px,10vw,120px) clamp(24px,5vw,80px)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 32, marginBottom: 64 }}>
          <div className="reveal">
            <div className="fm" style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: AM, marginBottom: 16 }}>
              Pittsburgh Directory
            </div>
            <h2 className="ff" style={{ fontSize: "clamp(36px,4.5vw,60px)", fontWeight: 800, lineHeight: 1.1, color: CR, letterSpacing: "-0.02em" }}>
              Agencies in<br />one place.
            </h2>
          </div>
          <p className="reveal d1" style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.7, color: "rgba(255,248,231,0.5)", maxWidth: 360 }}>
            Pay rates from job postings, Google ratings, and Medicare CMS scores. We keep data up to date from public sources.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          {[
            { n: "UPMC Home Healthcare", s: "4.5", r: "$16–$21/hr", c: "★★★★☆", l: "English", acc: true },
            { n: "BAYADA Home Health", s: "4.0", r: "$15–$19/hr", c: "★★★★☆", l: "English · Spanish", acc: true },
            { n: "Allegheny Health Network", s: "4.5", r: "$17–$22/hr", c: "★★★★★", l: "English", acc: true },
            { n: "Interim Healthcare", s: "4.0", r: "$14–$18/hr", c: "★★★☆☆", l: "English", acc: true },
            { n: "Presbyterian SeniorCare", s: "4.5", r: "$15–$19/hr", c: "★★★★☆", l: "English", acc: false },
          ].map((a, i) => (
            <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.05}s`, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,248,231,0.08)", padding: 24, borderRadius: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <h4 className="ff" style={{ fontSize: 16, fontWeight: 700, color: CR, maxWidth: "70%", lineHeight: 1.3 }}>{a.n}</h4>
                <div style={{ background: "rgba(232,147,58,0.1)", border: "1px solid rgba(232,147,58,0.2)", padding: "4px 8px", borderRadius: 8, fontSize: 11, color: AM, fontWeight: 700 }}>★ {a.s}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: "rgba(255,248,231,0.4)" }}>{a.l}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="fm" style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, background: "rgba(255,248,231,0.05)", color: "#7DD4A0" }}>Pay: <b>{a.r}</b></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: a.acc ? "#7DD4A0" : AM }}>
                    <div className={a.acc ? "pdot" : "pdot-slow"} style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
                    {a.acc ? "Accepting" : "Waitlist"}
                  </div>
                </div>
              </div>
              <div style={{ borderTop: "1px solid rgba(255,248,231,0.06)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="fm" style={{ fontSize: 10, color: "rgba(255,248,231,0.2)" }}>CMS {a.c}</div>
                <a href="/agencies" style={{ fontSize: 12, fontWeight: 600, color: AM, textDecoration: "none" }}>View profile →</a>
              </div>
            </div>
          ))}
          <div className="reveal" style={{ transitionDelay: "0.25s", background: "none", border: "1px dashed rgba(255,248,231,0.15)", padding: 24, borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <div style={{ fontSize: 24, color: "rgba(255,248,231,0.2)", marginBottom: 8 }}>+</div>
            <div className="ff" style={{ fontSize: 18, color: "rgba(255,248,231,0.4)", marginBottom: 12 }}>22 more agencies</div>
            <p style={{ fontSize: 12, color: "rgba(255,248,231,0.2)", marginBottom: 16 }}>Ready to compare?</p>
            <a href="/agencies" style={{ fontSize: 13, fontWeight: 700, color: AM, textDecoration: "none" }}>See all agencies →</a>
          </div>
        </div>
      </section>

      {/* ══════════ RIGHTS ══════════ */}
      <section id="rights" style={{ padding: "clamp(64px,10vw,120px) clamp(24px,5vw,80px)", background: "#F5EDDA", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 64, alignItems: "center" }}>
        <div className="reveal">
          <div className="fm" style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: AM, marginBottom: 16 }}>
            Federal Law
          </div>
          <h2 className="ff" style={{ fontSize: "clamp(36px,4.5vw,56px)", fontWeight: 800, lineHeight: 1.1, color: F, letterSpacing: "-0.02em", marginBottom: 24 }}>
            Switching is<br />your <em style={{ color: AM }}>right.</em>
          </h2>
          <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.7, color: (MU as any), marginBottom: 40 }}>
            Under Medicare&apos;s Conditions of Participation, you can change your home health agency at any time, for any reason — or no reason at all.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "You choose your agency — not your hospital or doctor.",
              "Agencies cannot refuse to discharge you by law.",
              "Switching cannot interrupt your Medicare benefits.",
              "10 days written notice required before any discharge."
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 16, padding: "16px 20px", background: "#fff", borderRadius: 14, border: "1px solid rgba(26,61,43,0.06)" }}>
                <div style={{ color: AM, fontSize: 11, fontWeight: 700, marginTop: 2 }}>0{i + 1}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: F, lineHeight: 1.5 }}>{t}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="reveal d2" style={{ position: "relative", borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.12)" }}>
          <img src="https://images.unsplash.com/photo-1573497620053-ea5310f94f17?auto=format&fit=crop&q=80&w=1200" alt="Consultation" style={{ width: "100%", display: "block" }} />
          <div style={{ position: "absolute", bottom: 24, left: 24, right: 24, background: F, padding: "20px 24px", borderRadius: 16, color: CR }}>
            <div className="fm" style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: AM, marginBottom: 8 }}>Patient Rights</div>
            <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.5, opacity: 0.8 }}>Medicare Conditions of Participation §484.50</p>
          </div>
        </div>
      </section>

      {/* ══════════ WHO WE SERVE ══════════ */}
      <section style={{ padding: "clamp(64px,10vw,120px) clamp(24px,5vw,80px)" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="fm" style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: AM, marginBottom: 16 }}>Who we serve</div>
          <h2 className="ff" style={{ fontSize: "clamp(36px,4.5vw,60px)", fontWeight: 800, lineHeight: 1.1, color: F, letterSpacing: "-0.02em" }}>Built for<br />Pennsylvania families.</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          {[
            { i: <Heart size={28} />, t: "Current patients", b: "Not happy with your current care? You have the right to switch agencies at any time." },
            { i: <Users size={28} />, t: "Family members", b: "Helping a loved one get better care? We guide you through every step — no guesswork." },
            { i: <Building size={28} />, t: "Hospital discharge", b: "Going home after a stay? You don't have to accept who your discharge planner suggests." },
            { i: <Globe size={28} />, t: "Language needs", b: "Filter agencies by languages spoken: Nepali, Spanish, Hindi, and more." },
          ].map((s, i) => (
            <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.1}s`, padding: 32, borderRadius: 24, border: "1px solid rgba(26,61,43,0.08)", background: "#fff" }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #1A3D2B, #2A5C41)", display: "flex", alignItems: "center", justifyContent: "center", color: CR, marginBottom: 24 }}>{s.i}</div>
              <h4 className="ff" style={{ fontSize: 20, fontWeight: 700, color: F, marginBottom: 12 }}>{s.t}</h4>
              <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: (MU as any) }}>{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section style={{ background: F, padding: "clamp(64px,10vw,120px) 24px", textAlign: "center" }}>
        <div className="reveal">
          <div className="fm" style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: AM, marginBottom: 16 }}>Real Stories</div>
          <h2 className="ff" style={{ fontSize: "clamp(36px,4.5vw,60px)", fontWeight: 800, color: CR, letterSpacing: "-0.02em", marginBottom: 64 }}>Families trust<br />SwitchMyCare.</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, maxWidth: 1200, margin: "0 auto" }}>
          {[
            { q: "SwitchMyCare made switching so easy. I was nervous about losing care, but they handled everything. My new agency even speaks Nepali!", n: "Sita G.", l: "Allegheny County" },
            { q: "After my stroke, my old agency wasn't meeting my needs. SwitchMyCare found me a better match in 4 days. Stress-free process.", n: "James M.", l: "Westmoreland County" },
            { q: "The bilingual support was incredible. They explained every step in Spanish and English. My father's new caregiver is amazing.", n: "Maria R.", l: "Butler County" },
          ].map((t, i) => (
            <div key={i} className="reveal d1" style={{ padding: 40, borderRadius: 24, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,248,231,0.08)", textAlign: "left" }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 24 }}>{[1, 2, 3, 4, 5].map(j => <Star key={j} filled size={12} />)}</div>
              <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.8, color: "rgba(255,248,231,0.65)", fontStyle: "italic", marginBottom: 32 }}>"{t.q}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: AM, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: FD }}>{t.n[0]}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: CR }}>{t.n}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,248,231,0.3)" }}>{t.l}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section id="faq" style={{ padding: "clamp(64px,10vw,120px) clamp(24px,5vw,80px)", background: "#F5EDDA", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 64 }}>
        <div className="reveal">
          <div className="fm" style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: AM, marginBottom: 16 }}>Common Questions</div>
          <h2 className="ff" style={{ fontSize: "clamp(36px,4.5vw,52px)", fontWeight: 800, lineHeight: 1.1, color: F, letterSpacing: "-0.02em", marginBottom: 24 }}>We&apos;re here<br />to help.</h2>
          <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: (MU as any) }}>
            Need assistance? Our team is here for you.<br />
            Call <a href="tel:4125551234" style={{ color: F, fontWeight: 600, textDecoration: "none" }}>(412) 555-1234</a>
          </p>
        </div>

        <div className="reveal d1" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { q: "Is switching really free?", a: "Browsing and comparing agencies is always 100% free. When you're ready to formally switch, there's a one-time $97 coordination fee that covers all paperwork and support." },
            { q: "Will I lose my care during the switch?", a: "No. Your current care continues until your new agency is fully set up. We coordinate an exact start date so there is zero gap in service." },
            { q: "Do I need my doctor's permission?", a: "Under federal law, the choice of agency is yours. Your doctor certifies that you need care, but which agency provides it is your decision." },
            { q: "How long does it take?", a: "Most switches complete in 5–7 business days. You'll see every step in your dashboard and get notified at each milestone." },
            { q: "What insurances do you work with?", a: "We work with all major PA payers: Medicare, Medicaid, UPMC, Highmark, Aetna Better Health, CHC, and private pay." }
          ].map((f, i) => <FAQItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />)}
        </div>
      </section>

      {/* ══════════ AGENCY CTA BAR ══════════ */}
      <div style={{ padding: "64px clamp(24px, 5vw, 80px)", background: CR, borderTop: "1px solid rgba(26,61,43,0.08)", borderBottom: "1px solid rgba(26,61,43,0.08)" }}>
        <div className="reveal" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center", maxWidth: 640 }}>
            <div style={{ fontSize: 40 }}>🏢</div>
            <div>
              <h4 className="ff" style={{ fontSize: 24, fontWeight: 700, color: F, marginBottom: 8 }}>Are you a home health agency?</h4>
              <p style={{ fontSize: 14, color: (MU as any), fontWeight: 300, lineHeight: 1.5 }}>Join our Pennsylvania network. Receive structured referrals from patients ready to switch. No per-referral fees.</p>
            </div>
          </div>
          <a href="/auth/register" style={{ padding: "14px 32px", borderRadius: 100, border: `1.5px solid ${F}`, color: F, fontSize: 14, fontWeight: 700, textDecoration: "none", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = F; e.currentTarget.style.color = CR; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = F; }}>
            Join as an agency
          </a>
        </div>
      </div>

      {/* ══════════ FINAL CTA ══════════ */}
      <section style={{ background: FD, padding: "clamp(80px,15vw,160px) 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -300, left: "50%", transform: "translateX(-50%)", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,147,58,0.07), transparent 65%)", pointerEvents: "none" }} />

        <div className="reveal">
          <h2 className="ff" style={{ fontSize: "clamp(48px,8vw,Mapping)", fontWeight: 900, color: CR, letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 24 }}>
            Ready for<br /><span style={{ color: AM }}>better care?</span>
          </h2>
          <p style={{ fontSize: 17, fontWeight: 300, color: "rgba(255,248,231,0.6)", maxWidth: 480, margin: "0 auto 48px", lineHeight: 1.7 }}>
            27+ Pittsburgh agencies. Real pay rates. Real ratings. Browse completely free — no account needed.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
            <a href="/auth/register" style={{ background: AM, color: FD, padding: "16px 40px", borderRadius: 100, fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 12px 32px rgba(232,147,58,0.3)" }}>Get started free</a>
            <a href="/auth/login" style={{ color: "rgba(255,248,231,0.6)", fontSize: 15, fontWeight: 500, textDecoration: "none", alignSelf: "center" }}>Already have an account →</a>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ background: "#0A1A10", padding: "80px clamp(24px, 5vw, 80px) 40px", color: "rgba(255,248,231,0.5)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 64, marginBottom: 80 }}>
          <div style={{ gridColumn: "span 2" }}>
            <div style={{ marginBottom: 24 }}><Logo light /></div>
            <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.7, maxWidth: 300 }}>Helping Pennsylvania families find and switch to the right home care agency — guided, simple, and free.</p>
          </div>
          {[
            { t: "For Patients", l: [["Get Started", "/auth/register"], ["How it works", "#how-it-works"], ["Find agencies", "/agencies"], ["FAQ", "#faq"]] },
            { t: "For Agencies", l: [["Agency Portal", "/auth/login"], ["Partner With Us", "/auth/register"]] },
            { t: "Contact", l: [["(412) 555-1234", "tel:4125551234"], ["help@switchmycare.com", "mailto:help@switchmycare.com"]] },
          ].map((c, i) => (
            <div key={i}>
              <h5 className="fm" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,248,231,0.3)", marginBottom: 24 }}>{c.t}</h5>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {c.l.map((l, j) => <a key={j} href={l[1]} style={{ fontSize: 14, color: "inherit", textDecoration: "none" }}>{l[0]}</a>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,248,231,0.05)", paddingTop: 40, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 24, fontSize: 12 }}>
          <div>© 2026 SwitchMyCare. Not affiliated with DHHS or CMS.</div>
          <div style={{ display: "flex", gap: 24 }}>
            <a href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Privacy</a>
            <a href="/terms" style={{ color: "inherit", textDecoration: "none" }}>Terms</a>
            <a href="/hipaa" style={{ color: "inherit", textDecoration: "none" }}>HIPAA</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
