import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { searchAgencies, getPatientFilters } from "@/lib/agency-actions";
import { AgencySearchClient } from "@/components/agencies/agency-search-client";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

export const metadata = { title: "Find Home Care Agencies | SwitchMyCare" };

interface AgenciesPageProps {
  searchParams: { [key: string]: string | undefined };
}

/* ── Design tokens (match landing page) ── */
const F = "#1A3D2B"; // forest
const FD = "#0F2419"; // forest dark
const CR = "#FFF8E7"; // cream
const AM = "#E8933A"; // amber

export default async function AgenciesPage({ searchParams }: AgenciesPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("full_name").eq("id", user.id).single() : { data: null };

  const patientFilters = user ? await getPatientFilters() : null;

  const initialFilters = {
    county: searchParams.county,
    care_type: searchParams.care_type as any,
    payer_type: searchParams.payer_type as any,
    language: searchParams.language,
    verified_only: searchParams.verified === "true",
    accepting_patients: searchParams.accepting === "true",
    min_quality_score: searchParams.quality ? Number(searchParams.quality) : undefined,
    sort_by: (searchParams.sort as any) ?? "verified",
    query: searchParams.q,
  };

  const { agencies, total } = await searchAgencies(initialFilters, 1, 12);

  return (
    <div style={{ minHeight: "100vh", background: FD, fontFamily: "'DM Sans', sans-serif", color: CR, overflowX: "hidden" }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;0,900;1,700;1,800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${FD}; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.75)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .card-in { animation: fadeUp 0.5s ease forwards; }
        select option { background: ${FD}; color: ${CR}; }
        
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .agencies-header { padding-top: 24px !important; padding-bottom: 24px !important; }
        }
      `}} />

      {/* ── NAV ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(16px,4vw,48px)", transition: "all 0.3s", background: "rgba(15,36,25,0.97)", borderBottom: "1px solid rgba(255,248,231,0.06)", backdropFilter: "blur(20px)" }}>
        <Link href="/" style={{ textDecoration: "none" }}><Logo light size="sm" /></Link>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="nav-desktop">
          <Link href="/" style={{ fontSize: 13, color: "rgba(255,248,231,0.45)", textDecoration: "none", transition: "color 0.2s" }} className="hover:text-[#FFF8E7]">Home</Link>
          <Link href="/agencies" style={{ fontSize: 13, fontWeight: 600, color: AM, textDecoration: "none", borderBottom: `1px solid ${AM}`, paddingBottom: 1 }}>Find Agencies</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link href="/dashboard" className="nav-desktop hover:text-[#FFF8E7]" style={{ fontSize: 13, color: "rgba(255,248,231,0.5)", textDecoration: "none" }}>Dashboard</Link>
              <Link href="/profile" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, background: "rgba(255,248,231,0.05)", padding: "4px 12px 4px 6px", borderRadius: 100, border: "1px solid rgba(255,248,231,0.1)" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${F}, #2A5C41)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: CR }}>
                  {(profile?.full_name || user.email)?.[0].toUpperCase()}
                </div>
                <span className="nav-desktop" style={{ fontSize: 13, fontWeight: 600, color: CR }}>
                  {profile?.full_name?.split(" ")[0] || "User"}
                </span>
              </Link>
            </div>
          ) : (
            <>
              <Link href="/auth/login" style={{ fontSize: 13, color: "rgba(255,248,231,0.5)", textDecoration: "none" }} className="nav-desktop hover:text-[#FFF8E7]">Sign in</Link>
              <Link href="/auth/register" style={{ fontSize: 13, fontWeight: 600, color: FD, background: AM, padding: "8px 20px", borderRadius: 100, textDecoration: "none", transition: "all 0.2s" }} className="hover:bg-[#D4822E] hover:-translate-y-px">
                Start free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── PAGE HEADER ── */}
      <div style={{ paddingTop: 64, background: F, borderBottom: "1px solid rgba(255,248,231,0.07)" }}>
        <div className="agencies-header" style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(32px,5vw,56px) clamp(16px,4vw,48px) clamp(24px,4vw,40px)" }}>
          {/* Eyebrow */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: AM, marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>
            <span style={{ width: 24, height: 1, background: AM }} /> Pennsylvania directory
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
            <div style={{ flex: "1 1 500px" }}>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(32px,4vw,52px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, color: CR, marginBottom: 10 }}>
                Find a Home Care <em style={{ fontStyle: "italic", color: AM }}>Agency.</em>
              </h1>
              <p style={{ fontSize: 15, fontWeight: 300, color: "rgba(255,248,231,0.6)", lineHeight: 1.7, maxWidth: 520 }}>
                {total > 0 ? `${total.toLocaleString()} agencies` : "Agencies"} verified to operate in Pennsylvania.
                {!user && " Sign in for personalized recommendations based on your insurance."}
              </p>
            </div>
            {/* Quick stats */}
            <div style={{ display: "flex", gap: "clamp(16px, 4vw, 32px)", flexWrap: "wrap", background: "rgba(255,255,255,0.03)", padding: "16px 24px", borderRadius: 20, border: "1px solid rgba(255,248,231,0.06)" }}>
              {[["27+", "Verified agencies"], ["$97", "Flat switch fee"], ["5–7", "Days to switch"]].map(([val, lbl]) => (
                <div key={lbl} style={{ textAlign: "center", flex: "1 1 80px" }}>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 800, color: AM, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,248,231,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(20px,3vw,36px) clamp(16px,4vw,48px) 80px" }}>
        <Suspense fallback={<div style={{ color: "rgba(255,248,231,0.4)", fontSize: 14, fontWeight: 500, padding: "32px 0" }}>Loading agencies…</div>}>
          <AgencySearchClient
            initialAgencies={agencies}
            initialTotal={total}
            initialFilters={initialFilters}
            patientCounty={patientFilters?.address_county}
            patientPayerType={patientFilters?.payer_type}
          />
        </Suspense>
      </div>
    </div>
  );
}
