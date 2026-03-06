import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAgencyById } from "@/lib/agency-actions";
import { careTypeLabel, payerLabel } from "@/lib/utils";

/* ── Design tokens ── */
const FD = "#0F2419";
const CR = "#FFF8E7";
const AM = "#E8933A";

/* ── Icons ── */
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.5 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const ArrowL = ({ size = 16, stroke = CR }: any) => <Icon size={size} stroke={stroke} d="M19 12H5M12 19l-7-7 7-7" />;
const ArrowR = ({ size = 14, stroke = CR }: any) => <Icon size={size} stroke={stroke} d="M5 12h14M12 5l7 7-7 7" />;
const MapPin = ({ size = 14, stroke = CR }: any) => <Icon size={size} stroke={stroke} d={["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", "M12 7m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"]} />;
const Phone = ({ size = 14, stroke = CR }: any) => <Icon size={size} stroke={stroke} d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l1.06-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />;
const Mail = ({ size = 14, stroke = CR }: any) => <Icon size={size} stroke={stroke} d={["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"]} />;
const Globe = ({ size = 14, stroke = CR }: any) => <Icon size={size} stroke={stroke} d={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M2 12h20", "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"]} />;
const Check = ({ size = 12, stroke = CR }: any) => <Icon size={size} stroke={stroke} strokeWidth={2.5} d="M20 6L9 17l-5-5" />;
const Shield = ({ size = 14, stroke = CR }: any) => <Icon size={size} stroke={stroke} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const Clock = ({ size = 14, stroke = CR }: any) => <Icon size={size} stroke={stroke} d={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 6v6l4 2"]} />;
const Building = ({ size = 14, stroke = CR }: any) => <Icon size={size} stroke={stroke} d={["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"]} />;
const Heart = ({ size = 15, stroke = FD }: any) => <Icon size={size} stroke={stroke} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />;
const ExtLink = ({ size = 11, stroke = CR }: any) => <Icon size={size} stroke={stroke} d={["M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", "M15 3h6v6", "M10 14L21 3"]} />;

const StarIcon = ({ filled }: any) => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill={filled ? AM : "rgba(255,248,231,0.12)"} stroke="none">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const Logo = () => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width={32} height={32} viewBox="0 0 48 48" fill="none">
        <rect x="4" y="4" width="40" height="40" rx="12" fill={CR} opacity="0.09" />
        <path d="M14 20L24 14L34 20" stroke={AM} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 14V28" stroke={AM} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M24 38C24 38 14 32 14 27C14 24.5 16 23 18 23C20 23 22 24.5 24 27C26 24.5 28 23 30 23C32 23 34 24.5 34 27C34 32 24 38 24 38Z" fill={CR} opacity="0.9" />
      </svg>
      <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", color: CR }}>
        Switch<span style={{ color: AM }}>My</span>Care
      </span>
    </div>
  );
};

/* ── Reusable components ── */
const GlassCard = ({ children, style = {}, className = "" }: any) => (
  <div className={className} style={{
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,248,231,0.07)",
    borderRadius: 20,
    overflow: "hidden",
    ...style
  }}>
    {children}
  </div>
);

const GlassCardHead = ({ title }: any) => (
  <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,248,231,0.07)" }}>
    <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: CR, letterSpacing: "-0.01em" }}>
      {title}
    </h2>
  </div>
);

interface AgencyDetailPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: AgencyDetailPageProps) {
  const agency = await getAgencyById(params.id);
  return {
    title: agency ? `${agency.name} | SwitchMyCare` : "Agency Not Found",
  };
}

const SERVICE_LABELS: Record<string, string> = {
  skilled_nursing: "Skilled Nursing",
  physical_therapy: "Physical Therapy",
  occupational_therapy: "Occupational Therapy",
  speech_therapy: "Speech Therapy",
  medical_social_work: "Medical Social Work",
  home_health_aide: "Home Health Aide (HHA)",
  personal_care: "Personal Care",
  companion_care: "Companion Care",
  homemaker: "Homemaker Services",
  respite_care: "Respite Care",
  medication_reminders: "Medication Reminders",
  transportation: "Transportation",
  meal_preparation: "Meal Preparation",
};

export default async function AgencyDetailPage({ params }: AgencyDetailPageProps) {
  const [agency, supabase] = await Promise.all([
    getAgencyById(params.id),
    createClient(),
  ]);

  if (!agency) return notFound();

  const { data: { user } } = await supabase.auth.getUser();

  // Check if patient already has an active switch request for this agency
  let existingSwitchRequest = null;
  if (user) {
    const { data } = await supabase
      .from("switch_requests")
      .select("id, status")
      .eq("patient_id", user.id)
      .eq("new_agency_id", agency.id)
      .not("status", "in", '("cancelled","denied")')
      .single();
    existingSwitchRequest = data;
  }

  const score = agency.medicare_quality_score;

  return (
    <div style={{ minHeight: "100vh", background: FD, fontFamily: "'DM Sans', sans-serif", color: CR }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;0,900;1,700;1,800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        @keyframes fu { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
        .fu { animation: fu .45s ease both }
        .fu1 { animation: fu .45s .07s ease both }
        .fu2 { animation: fu .45s .14s ease both }
        .fu3 { animation: fu .45s .20s ease both }
        .fu4 { animation: fu .45s .26s ease both }
        .fu5 { animation: fu .45s .32s ease both }
        input::placeholder { color: rgba(255,248,231,0.25); }
        @keyframes pulse-dot { 0%,100% { opacity: 1 } 50% { opacity: .4 } }
        
        .main-grid { display: grid; grid-template-columns: 1fr 288px; gap: 16px; align-items: start; }
        @media (max-width: 1023px) { 
          .main-grid { grid-template-columns: 1fr !important; } 
          .sidebar { position: static !important; }
        }
        @media (max-width: 639px) { 
          .svc-grid { grid-template-columns: 1fr !important; } 
          .hero-row { flex-direction: column !important; }
          .hero-cta { width: 100% !important; flex-direction: column !important; align-items: stretch !important; gap: 8px !important; }
          .hero-cta-btn { width: 100% !important; justify-content: center !important; }
          .hero-cta-text { text-align: center !important; width: 100% !important; }
          .nav-back-text { display: none; }
        }
      `}} />

      {/* ── NAV ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, height: 64, background: "rgba(15,36,25,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,248,231,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(16px, 4vw, 48px)" }}>
        <Link href="/"><Logo /></Link>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {user ? (
            <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 600, color: AM, transition: "opacity .2s" }} className="hover:opacity-80">
              Dashboard
            </Link>
          ) : (
            <Link href="/auth/login" style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,248,231,0.5)", transition: "color .2s" }} className="hover:text-[#FFF8E7]">
              Sign in
            </Link>
          )}
          <Link href="/agencies" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 500, color: "rgba(255,248,231,0.5)", transition: "color .2s" }} className="hover:text-[#FFF8E7]">
            <ArrowL size={15} stroke="currentColor" /> <span className="nav-back-text">Back to search</span>
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(24px, 4vw, 44px) clamp(16px, 4vw, 48px) 80px" }}>

        {/* ── HERO SECTION ── */}
        <div className="fu" style={{ marginBottom: 20 }}>
          <GlassCard>
            <div style={{ padding: "clamp(22px, 4vw, 36px)" }}>

              {/* Top: badges + CTA */}
              <div className="hero-row" style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 20 }}>

                {/* Left info */}
                <div style={{ flex: "1 1 300px" }}>
                  {/* Badges */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
                    {agency.is_verified_partner && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#4ADE80", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 100, padding: "3px 10px", fontFamily: "'DM Mono', monospace", letterSpacing: ".04em" }}>
                        <Check size={10} stroke="#4ADE80" /> Verified Partner
                      </span>
                    )}
                    {agency.care_types.map(t => (
                      <span key={t} style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,248,231,0.55)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,248,231,0.1)", borderRadius: 100, padding: "3px 10px" }}>{careTypeLabel(t)}</span>
                    ))}
                  </div>

                  {/* Agency name */}
                  <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 800, color: CR, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 4 }}>
                    {agency.name}
                  </h1>
                  {agency.dba_name && (
                    <p style={{ fontSize: 13, color: "rgba(255,248,231,0.35)", marginBottom: 14 }}>
                      dba {agency.dba_name}
                    </p>
                  )}

                  {/* Stars */}
                  {score && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ display: "flex", gap: 2 }}>
                        {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={i <= Math.round(score)} />)}
                      </div>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700, color: AM }}>{score.toFixed(1)}</span>
                      <span style={{ fontSize: 12, color: "rgba(255,248,231,0.4)" }}>
                        Medicare quality score
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA — top right */}
                <div className="hero-cta" style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  {existingSwitchRequest ? (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ADE80", fontSize: 13, fontWeight: 600, padding: "12px 24px", borderRadius: 100, fontFamily: "'DM Mono', monospace" }}>
                      <Check size={13} stroke="#4ADE80" /> Request submitted
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                      <Link href={`/switch/new?agency=${agency.id}`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: AM, color: FD, fontSize: 14, fontWeight: 800, padding: "14px 28px", borderRadius: 100, border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all .2s", boxShadow: "0 4px 20px rgba(232,147,58,0.3)", width: "100%", whiteSpace: "nowrap" }} className="hero-cta-btn hover:bg-[#D4822E] hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(232,147,58,0.4)]">
                        <Heart size={16} stroke={FD} fill={FD} /> Select this agency
                      </Link>
                      <span className="hero-cta-text" style={{ fontSize: 11, color: "rgba(255,248,231,0.35)", fontWeight: 600, letterSpacing: "0.02em" }}>
                        Free · $97 one-time fee to switch
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact strip */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20, paddingTop: 18, borderTop: "1px solid rgba(255,248,231,0.07)" }}>
                {[
                  { I: MapPin, text: `${agency.address_city}, PA ${agency.address_zip}`, href: null },
                  { I: Phone, text: agency.phone, href: agency.phone ? `tel:${agency.phone}` : null },
                  { I: Mail, text: agency.email, href: agency.email ? `mailto:${agency.email}` : null },
                  { I: Globe, text: "Website", href: agency.website, ext: true },
                ].map((item, i) => {
                  const inner = (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: item.href ? "rgba(255,248,231,0.65)" : "rgba(255,248,231,0.4)", whiteSpace: "nowrap" }}>
                      <item.I size={13} stroke={item.href ? "rgba(255,248,231,0.5)" : "rgba(255,248,231,0.3)"} />
                      {item.text}
                      {item.ext && <ExtLink size={10} stroke="rgba(255,248,231,0.4)" />}
                    </span>
                  );
                  return item.href
                    ? <a key={i} href={item.href} target={item.ext ? "_blank" : undefined} rel={item.ext ? "noopener noreferrer" : undefined} style={{ transition: "opacity .15s" }} className="hover:opacity-70">
                      {inner}
                    </a>
                    : <span key={i}>{inner}</span>;
                })}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="main-grid">

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Services */}
            <GlassCard className="fu1">
              <GlassCardHead title="Services offered" />
              <div className="svc-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: 14 }}>
                {agency.services_offered.map((s: string) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", borderRadius: 12, border: "1px solid rgba(255,248,231,0.06)", background: "rgba(255,255,255,0.03)", transition: "all .15s" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 7, background: "rgba(232,147,58,0.12)", border: "1px solid rgba(232,147,58,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Check size={11} stroke={AM} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,248,231,0.75)", lineHeight: 1.35 }}>{SERVICE_LABELS[s] ?? s.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Insurance */}
            <GlassCard className="fu2">
              <GlassCardHead title="Insurance accepted" />
              <div style={{ padding: "16px 22px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                {agency.payers_accepted.map((p: string) => (
                  <span key={p} style={{ display: "inline-flex", alignItems: "center", fontSize: 12, fontWeight: 600, color: "rgba(255,248,231,0.75)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,248,231,0.1)", borderRadius: 100, padding: "6px 15px", transition: "all .15s", cursor: "default" }}>
                    {payerLabel(p)}
                  </span>
                ))}
              </div>
            </GlassCard>

            {/* Service area */}
            <GlassCard className="fu3">
              <GlassCardHead title="Service area" />
              <div style={{ padding: "16px 22px" }}>
                <p style={{ fontSize: 13, color: "rgba(255,248,231,0.45)", marginBottom: 14, lineHeight: 1.65 }}>
                  Serves patients in{" "}
                  <span style={{ color: CR, fontWeight: 600 }}>
                    {agency.service_counties.length} Pennsylvania {agency.service_counties.length === 1 ? "county" : "counties"}
                  </span>
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {agency.service_counties.sort().map((c: string) => (
                    <span key={c} style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,248,231,0.65)", background: "rgba(61,122,87,0.12)", border: "1px solid rgba(61,122,87,0.25)", borderRadius: 100, padding: "5px 14px" }}>{c}</span>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Languages */}
            {agency.languages_spoken && agency.languages_spoken.length > 0 && (
              <GlassCard className="fu4">
                <GlassCardHead title="Languages spoken" />
                <div style={{ padding: "16px 22px", display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {agency.languages_spoken.map((l: string) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,248,231,0.08)", borderRadius: 12 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: AM, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,248,231,0.75)" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="sidebar" style={{ position: "sticky", top: 76, display: "flex", flexDirection: "column", gap: 14 }}>

            {/* At a glance */}
            <GlassCard className="fu1">
              <GlassCardHead title="At a glance" />
              <div style={{ padding: "6px 20px 16px" }}>
                {[
                  { I: Clock, label: "Avg. response time", val: agency.avg_response_hours ? `${agency.avg_response_hours} hour` : "N/A", mono: false },
                  { I: Building, label: "NPI Number", val: agency.npi ?? "N/A", mono: true },
                  { I: Shield, label: "PA License", val: agency.pa_license_number ?? "N/A", mono: true },
                ].map((item, i, arr) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,248,231,0.06)" : "none" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(232,147,58,0.08)", border: "1px solid rgba(232,147,58,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <item.I size={15} stroke={AM} />
                    </div>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,248,231,0.35)", textTransform: "uppercase", letterSpacing: "0.09em", fontFamily: "'DM Mono', monospace", marginBottom: 2 }}>{item.label}</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: CR, fontFamily: item.mono ? "'DM Mono', monospace" : "inherit" }}>{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* CTA card */}
            {existingSwitchRequest ? (
              <GlassCard className="fu2">
                <div style={{ padding: "22px 20px", textAlign: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <Check size={20} stroke="#4ADE80" />
                  </div>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: CR, marginBottom: 6 }}>Request submitted!</p>
                  <p style={{ fontSize: 12, color: "rgba(255,248,231,0.45)", lineHeight: 1.65, marginBottom: 18 }}>
                    We'll coordinate everything. Status: {existingSwitchRequest.status}
                  </p>
                  <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: AM }}>
                    View in dashboard <ArrowR size={13} stroke={AM} />
                  </Link>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="fu2">
                <div style={{ padding: "22px 20px", display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 800, color: CR, letterSpacing: "-0.02em", marginBottom: 8 }}>
                    Ready to switch?
                  </h3>
                  <p style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,248,231,0.45)", lineHeight: 1.6, marginBottom: 20 }}>
                    SwitchMyCare handles all the paperwork and coordinates with your
                    current and new agency.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                    <Link href={`/switch/new?agency=${agency.id}`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: AM, color: FD, fontSize: 14, fontWeight: 800, padding: "14px 28px", borderRadius: 100, border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all .2s", boxShadow: "0 4px 20px rgba(232,147,58,0.3)", width: "100%", whiteSpace: "nowrap" }} className="hover:bg-[#D4822E] hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(232,147,58,0.4)]">
                      <Heart size={16} stroke={FD} fill={FD} /> Select this agency
                    </Link>
                    <p style={{ fontSize: 11, color: "rgba(255,248,231,0.35)", textAlign: "center", fontWeight: 600, letterSpacing: "0.02em" }}>
                      Free · $97 one-time fee to switch
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* HIPAA */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "13px 15px", background: "rgba(26,61,43,0.3)", border: "1px solid rgba(61,122,87,0.2)", borderRadius: 14 }}>
              <Shield size={13} stroke="rgba(255,248,231,0.4)" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 11, color: "rgba(255,248,231,0.4)", lineHeight: 1.7 }}>
                All information shared with this agency is protected under HIPAA.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
