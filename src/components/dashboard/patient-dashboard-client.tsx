"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardData } from "@/lib/dashboard-actions";

/* ─── Design tokens ─────────────────────────────────────────────────── */
const T = {
    forest: "#1A3D2B",
    forestM: "#2A5C41",
    forestL: "#3D7A57",
    cream: "#FFF8E7",
    creamD: "#F5EDDA",
    amber: "#E8933A",
    amberL: "#F2AC5C",
    muted: "#6B7B6E",
    white: "#FFFFFF",
    bg: "#F8F5EF",  // warm off-white — different from dark pages
    cardBg: "#FFFFFF",
    border: "rgba(26,61,43,0.08)",
    borderM: "rgba(26,61,43,0.14)",
};

/* ─── Icons ─────────────────────────────────────────────────────────── */
const Ic = ({ d, size = 16, stroke = "currentColor", fill = "none", sw = 1.5 }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        {Array.isArray(d) ? d.map((p: string, i: number) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
);
const Icons = {
    Bell: (p: any) => <Ic {...p} d={["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 0 1-3.46 0"]} />,
    Home: (p: any) => <Ic {...p} d={["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"]} />,
    Search: (p: any) => <Ic {...p} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />,
    User: (p: any) => <Ic {...p} d={["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 3m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0"]} />,
    Msg: (p: any) => <Ic {...p} d={["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"]} />,
    File: (p: any) => <Ic {...p} d={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M16 13H8", "M16 17H8", "M10 9H8"]} />,
    Arrow: (p: any) => <Ic {...p} d="M5 12h14M12 5l7 7-7 7" />,
    Check: (p: any) => <Ic {...p} sw={2.5} d="M20 6L9 17l-5-5" />,
    Clock: (p: any) => <Ic {...p} d={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 6v6l4 2"]} />,
    Alert: (p: any) => <Ic {...p} d={["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"]} />,
    Plus: (p: any) => <Ic {...p} d={["M12 5v14", "M5 12h14"]} />,
    Map: (p: any) => <Ic {...p} d={["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", "M12 7m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"]} />,
    Star: (p: any) => <Ic {...p} fill={p.filled ? T.amber : "none"} stroke={p.filled ? T.amber : T.muted} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    Settings: (p: any) => <Ic {...p} d={["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"]} />,
    Menu: (p: any) => <Ic {...p} d={["M3 12h18", "M3 6h18", "M3 18h18"]} />,
    X: (p: any) => <Ic {...p} d={["M18 6L6 18", "M6 6l12 12"]} />,
    Upload: (p: any) => <Ic {...p} d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"]} />,
    Shield: (p: any) => <Ic {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
};

/* ─── Logo ───────────────────────────────────────────────────────────── */
const Logo = ({ size = "md" }) => {
    const fs = size === "sm" ? 15 : 17;
    const is = size === "sm" ? 26 : 30;
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <svg width={is} height={is} viewBox="0 0 48 48" fill="none">
                <rect x="4" y="4" width="40" height="40" rx="12" fill={T.forest} opacity="0.08" />
                <path d="M14 20L24 14L34 20" stroke={T.amber} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M24 14V28" stroke={T.amber} strokeWidth="2.5" strokeLinecap="round" />
                <path d="M24 38C24 38 14 32 14 27C14 24.5 16 23 18 23C20 23 22 24.5 24 27C26 24.5 28 23 30 23C32 23 34 24.5 34 27C34 32 24 38 24 38Z" fill={T.forest} opacity="0.85" />
            </svg>
            <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: fs, letterSpacing: "-0.02em", color: T.forest }}>
                Switch<span style={{ color: T.amber }}>My</span>Care
            </span>
        </div>
    );
};

/* ─── Status config ──────────────────────────────────────────────────── */
const STATUS: any = {
    submitted: { label: "Submitted", color: "#6366F1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)" },
    under_review: { label: "Under Review", color: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
    accepted: { label: "Accepted", color: "#22C55E", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)" },
    completed: { label: "Completed", color: T.forestL, bg: "rgba(61,122,87,0.08)", border: "rgba(61,122,87,0.2)" },
    denied: { label: "Not Accepted", color: "#EF4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
    cancelled: { label: "Cancelled", color: T.muted, bg: "rgba(107,123,110,0.08)", border: "rgba(107,123,110,0.2)" },
};

/* ─── Small components ───────────────────────────────────────────────── */
function Badge({ status }: { status: string }) {
    const s = STATUS[status] || STATUS.submitted;
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 100, padding: "3px 10px", fontFamily: "'DM Mono',monospace", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            {s.label}
        </span>
    );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
    return (
        <div style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 18, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: accent || T.amber, borderRadius: "18px 0 0 18px" }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, fontFamily: "'DM Mono',monospace" }}>{label}</p>
            <p style={{ fontFamily: "'Fraunces',serif", fontSize: 32, fontWeight: 800, color: T.forest, lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</p>
            {sub && <p style={{ fontSize: 11, color: T.muted, marginTop: 4, fontWeight: 400 }}>{sub}</p>}
        </div>
    );
}

/* ─── Progress tracker ───────────────────────────────────────────────── */
function ProgressTracker({ steps, currentStep }: { steps: any[]; currentStep: number }) {
    const pct = Math.round(((currentStep - 1) / (steps.length - 1)) * 100);
    return (
        <div style={{ padding: "24px 0 8px" }}>
            <div style={{ position: "relative", height: 4, background: T.creamD, borderRadius: 4, marginBottom: 28 }}>
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${T.forest}, ${T.forestL})`, borderRadius: 4, transition: "width 1s cubic-bezier(0.4,0,0.2,1)" }} />
                {steps.map((s, i) => {
                    const pos = (i / (steps.length - 1)) * 100;
                    const done = i + 1 <= currentStep;
                    const active = i + 1 === currentStep;
                    return (
                        <div key={i} style={{ position: "absolute", left: `${pos}%`, top: "50%", transform: "translate(-50%,-50%)" }}>
                            <div style={{ width: active ? 16 : 12, height: active ? 16 : 12, borderRadius: "50%", background: done ? T.forest : T.creamD, border: `2px solid ${done ? T.forest : T.border}`, transition: "all 0.4s ease", boxShadow: active ? `0 0 0 4px rgba(26,61,43,0.12)` : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {done && i + 1 < currentStep && <Icons.Check size={7} stroke={T.cream} sw={3} />}
                                {active && <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.amber }} />}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: 4 }}>
                {steps.map((s, i) => {
                    const done = i + 1 <= currentStep;
                    const active = i + 1 === currentStep;
                    return (
                        <div key={i} style={{ textAlign: i === 0 ? "left" : i === steps.length - 1 ? "right" : "center" }}>
                            <p style={{ fontSize: 11, fontWeight: active ? 700 : done ? 600 : 400, color: active ? T.forest : done ? T.forestL : T.muted, lineHeight: 1.3 }}>{s.label}</p>
                            <p style={{ fontSize: 10, color: T.muted, marginTop: 2, fontFamily: "'DM Mono',monospace", opacity: 0.7 }}>{s.date}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Notification row ───────────────────────────────────────────────── */
function NotifRow({ n }: { n: any }) {
    const isUnread = !n.read_at;
    return (
        <Link href={n.reference_type === "switch_request" ? `/switch/${n.reference_id}` : "/notifications"} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderBottom: `1px solid ${T.border}`, textDecoration: "none", transition: "background 0.15s", cursor: "pointer" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: isUnread ? T.amber : "transparent", border: isUnread ? "none" : `1px solid ${T.border}`, flexShrink: 0, marginTop: 5 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: isUnread ? 600 : 400, color: T.forest, lineHeight: 1.4, marginBottom: 2 }}>{n.title}</p>
                <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.body}</p>
            </div>
            <span style={{ fontSize: 11, color: T.muted, flexShrink: 0, fontFamily: "'DM Mono',monospace", marginTop: 2 }}>
                {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
        </Link>
    );
}

/* ─── Sidebar nav item ───────────────────────────────────────────────── */
function NavItem({ icon: Icon, label, active, badge, href = "#", onClick }: any) {
    const [hov, setHov] = useState(false);
    return (
        <Link href={href} onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 14px", borderRadius: 12, textDecoration: "none", cursor: "pointer", transition: "all 0.15s", background: active ? `rgba(26,61,43,0.08)` : hov ? `rgba(26,61,43,0.04)` : "transparent", color: active ? T.forest : T.muted, fontWeight: active ? 600 : 400, fontSize: 13, position: "relative" }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            {active && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, background: T.amber, borderRadius: "0 3px 3px 0" }} />}
            <Icon size={16} stroke={active ? T.forest : T.muted} />
            <span>{label}</span>
            {(badge ?? 0) > 0 && <span style={{ marginLeft: "auto", minWidth: 18, height: 18, borderRadius: 100, background: T.amber, color: T.white, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", fontFamily: "'DM Mono',monospace" }}>{badge}</span>}
        </Link>
    );
}

/* ═══════════════════════════════════════════════════════
   PATIENT DASHBOARD CLIENT
═══════════════════════════════════════════════════════ */
export function PatientDashboardClient({ data }: { data: DashboardData }) {
    const [activeTab, setActiveTab] = useState("home");
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const firstName = data.profile?.full_name?.split(" ")[0] ?? "Patient";
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    const activeRequests = data.switchRequests.filter(r => ["submitted", "under_review", "accepted"].includes(r.status));
    const pastRequests = data.switchRequests.filter(r => ["completed", "denied", "cancelled"].includes(r.status));
    const currentRequest = activeRequests[0] || null;

    // Status step calculation
    const getStep = (status: string) => {
        switch (status) {
            case "submitted": return 1;
            case "under_review": return 2;
            case "accepted": return 3;
            case "completed": return 4;
            default: return 1;
        }
    };

    const timelineSteps = [
        { label: "Submitted", date: currentRequest ? new Date(currentRequest.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "" },
        { label: "Under review", date: currentRequest?.submitted_at ? new Date(currentRequest.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Pending" },
        { label: "Accepted", date: currentRequest?.status === "accepted" ? "Active" : "Pending" },
        { label: "Start of care", date: currentRequest?.requested_start_date ? new Date(currentRequest.requested_start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD" },
    ];

    return (
        <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans',sans-serif", color: T.forest }}>
            <style dangerouslySetInnerHTML={{
                __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;0,900;1,700;1,800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500;600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        .fu  { animation:fadeUp 0.45s ease both; }
        .fu1 { animation:fadeUp 0.45s 0.07s ease both; }
        .fu2 { animation:fadeUp 0.45s 0.14s ease both; }
        .fu3 { animation:fadeUp 0.45s 0.21s ease both; }
        .fu4 { animation:fadeUp 0.45s 0.28s ease both; }
        .fu5 { animation:fadeUp 0.45s 0.35s ease both; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(26,61,43,0.15); border-radius:4px; }
        @media (max-width: 1023px) { .sidebar { display: none !important; } .main-content { margin-left: 0 !important; } .mob-menu { display: flex !important; } .mob-bottom-nav { display: flex !important; } }
        @media (max-width: 767px) { .stats-grid { grid-template-columns: repeat(2,1fr) !important; } .quick-grid { grid-template-columns: repeat(2,1fr) !important; } .two-col { grid-template-columns: 1fr !important; } }
      ` }} />

            {/* ── TOP NAV ─────────────────────────────────────────────────── */}
            <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 60, background: "rgba(248,245,239,0.95)", borderBottom: `1px solid ${T.border}`, backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(16px,3vw,32px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button onClick={() => setMobileNavOpen(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "none", color: T.forest }} className="mob-menu">
                        <Icons.Menu size={20} stroke={T.forest} />
                    </button>
                    <Link href="/" style={{ textDecoration: "none" }}><Logo size="sm" /></Link>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Link href="/notifications" style={{ position: "relative", width: 38, height: 38, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid ${T.border}`, textDecoration: "none", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.creamD; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                        <Icons.Bell size={16} stroke={T.forest} />
                        {data.unreadCount > 0 && <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: T.amber, border: `1.5px solid ${T.bg}` }} />}
                    </Link>
                    <Link href="/profile" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 12, background: `linear-gradient(135deg, ${T.forest}, ${T.forestL})`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13, fontWeight: 700, color: T.cream, flexShrink: 0 }}>
                            {firstName[0]}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }} className="sidebar">
                            <span style={{ fontSize: 13, fontWeight: 600, color: T.forest, lineHeight: 1.2 }}>{firstName}</span>
                            <span style={{ fontSize: 10, color: T.muted, fontFamily: "'DM Mono',monospace" }}>Patient</span>
                        </div>
                    </Link>
                </div>
            </nav>

            <div style={{ display: "flex", paddingTop: 60 }}>

                {/* ── SIDEBAR ─────────────────────────────────────────────── */}
                <aside className="sidebar" style={{ width: 220, flexShrink: 0, height: "calc(100vh - 60px)", position: "sticky", top: 60, overflowY: "auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 4, borderRight: `1px solid ${T.border}`, background: T.bg }}>
                    <div style={{ marginBottom: 8, padding: "0 14px" }}>
                        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, fontFamily: "'DM Mono',monospace" }}>Navigation</p>
                    </div>
                    <NavItem icon={Icons.Home} label="Dashboard" active={activeTab === "home"} onClick={(e: any) => { e.preventDefault(); setActiveTab("home") }} />
                    <NavItem icon={Icons.File} label="My Requests" active={activeTab === "requests"} onClick={(e: any) => { e.preventDefault(); setActiveTab("requests") }} />
                    <NavItem icon={Icons.Msg} label="Messages" active={activeTab === "messages"} href="/switch" badge={currentRequest?.status === "accepted" ? 1 : 0} />
                    <NavItem icon={Icons.Search} label="Find Agencies" active={activeTab === "agencies"} href="/agencies" />
                    <NavItem icon={Icons.Bell} label="Notifications" active={activeTab === "notifs"} onClick={(e: any) => { e.preventDefault(); setActiveTab("notifs") }} badge={data.unreadCount} />

                    <div style={{ height: 1, background: T.border, margin: "12px 14px" }} />
                    <div style={{ padding: "0 14px", marginBottom: 8 }}>
                        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, fontFamily: "'DM Mono',monospace" }}>Account</p>
                    </div>
                    <NavItem icon={Icons.User} label="Profile" href="/profile" />
                    <NavItem icon={SettingsIcon} label="Sign out" href="/api/auth/signout" />

                    {/* Profile card */}
                    <div style={{ marginTop: "auto", background: T.creamD, borderRadius: 16, padding: "16px", border: `1px solid ${T.border}` }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 4, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: "0.07em" }}>Your plan</div>
                        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 700, color: T.forest, marginBottom: 2 }}>
                            {data.patientDetails?.payer_type ? (data.patientDetails.payer_type.charAt(0).toUpperCase() + data.patientDetails.payer_type.slice(1)) : "Active Patient"}
                        </div>
                        <div style={{ fontSize: 11, color: T.muted }}>{data.patientDetails?.address_county || "PA"} County</div>
                        <Link href="/agencies" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12, fontSize: 12, fontWeight: 600, color: T.amber, textDecoration: "none" }}
                            onMouseEnter={(e: any) => e.currentTarget.style.color = T.forest} onMouseLeave={(e: any) => e.currentTarget.style.color = T.amber}>
                            Browse agencies <Icons.Arrow size={12} stroke={T.amber} />
                        </Link>
                    </div>
                </aside>

                {/* ── MAIN CONTENT ────────────────────────────────────────── */}
                <main className="main-content" style={{ flex: 1, minWidth: 0, padding: "clamp(20px,3vw,36px) clamp(16px,3vw,40px)", paddingBottom: 80 }}>

                    {/* Greeting header */}
                    <div className="fu" style={{ marginBottom: 28 }}>
                        <p style={{ fontSize: 12, fontWeight: 500, color: T.muted, fontFamily: "'DM Mono',monospace", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>{greeting}</p>
                        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(26px,3.5vw,38px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, color: T.forest }}>
                            Hi {firstName} <span style={{ color: T.amber }}>—</span>
                        </h1>
                        <p style={{ fontSize: 15, fontWeight: 300, color: T.muted, marginTop: 6, lineHeight: 1.6 }}>
                            {currentRequest
                                ? `Your switch to ${currentRequest.new_agency?.name} is in progress.`
                                : data.onboardingComplete
                                    ? "You're all set! Browse agencies to start your switch."
                                    : "Welcome! Complete your profile to get started."}
                        </p>
                    </div>

                    {!data.onboardingComplete && (
                        <div className="fu1" style={{ marginBottom: 28, background: "#FFFBEB", border: "1px solid #FEF3C7", borderRadius: 20, padding: 24 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                                <Icons.Alert size={20} stroke="#D97706" />
                                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#92400E" }}>Complete your profile</h2>
                            </div>
                            <p style={{ fontSize: 14, color: "#B45309", marginBottom: 20, lineHeight: 1.6 }}>
                                Finish setting up your care needs and insurance info so we can match you with the best agencies in your county.
                            </p>
                            <Link href="/onboarding" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#D97706", color: "#fff", padding: "10px 20px", borderRadius: 100, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                                Finish setup →
                            </Link>
                        </div>
                    )}

                    {/* ── STATS ROW ── */}
                    <div className="fu1 stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
                        <StatCard label="Switch status" value={currentRequest ? (STATUS[currentRequest.status]?.label || "Active") : "None"} sub={currentRequest ? `Agency: ${currentRequest.new_agency?.name}` : "No active switch"} accent={currentRequest ? STATUS[currentRequest.status]?.color : T.muted} />
                        <StatCard label="Total requests" value={data.switchRequests.length} sub="Lifetime total" accent={T.forestL} />
                        <StatCard label="Unread messages" value={data.unreadCount} sub="In your inbox" accent="#6366F1" />
                        <StatCard label="Insurance" value={data.patientDetails?.payer_type ? (data.patientDetails.payer_type.charAt(0).toUpperCase() + data.patientDetails.payer_type.slice(1)) : "—"} sub="Coverage type" accent={T.amber} />
                    </div>

                    {/* ── ACTIVE REQUEST CARD ── */}
                    {currentRequest && (
                        <div className="fu2" style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 22, padding: "clamp(20px,3vw,32px)", marginBottom: 20, position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${T.forest}, ${T.forestL}, ${T.amber})` }} />

                            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 600, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", marginBottom: 6 }}>Current switch request</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(18px,2.5vw,24px)", fontWeight: 700, color: T.forest, letterSpacing: "-0.02em" }}>{currentRequest.new_agency?.name}</h2>
                                        <Badge status={currentRequest.status} />
                                    </div>
                                    <p style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>
                                        Submitted {new Date(currentRequest.created_at).toLocaleDateString()} · Last updated {new Date(currentRequest.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    <Link href={`/switch/${currentRequest.id}/messages`} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.forest, color: T.cream, fontSize: 13, fontWeight: 600, padding: "9px 18px", borderRadius: 100, textDecoration: "none", transition: "all 0.2s", boxShadow: `0 4px 16px rgba(26,61,43,0.2)` }}>
                                        <Icons.Msg size={13} stroke={T.cream} /> Message
                                    </Link>
                                    <Link href={`/switch/${currentRequest.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: T.forest, padding: "9px 16px", borderRadius: 100, border: `1px solid ${T.border}`, textDecoration: "none", background: T.bg, transition: "all 0.2s" }}>
                                        View request <Icons.Arrow size={12} stroke={T.forest} />
                                    </Link>
                                </div>
                            </div>

                            <ProgressTracker steps={timelineSteps} currentStep={getStep(currentRequest.status)} />

                            <div style={{ marginTop: 20, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 10, background: T.creamD, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Icons.Arrow size={14} stroke={T.amber} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: T.forest, marginBottom: 2 }}>
                                        {currentRequest.status === "accepted" ? "Next step: Coordinate intake" : "Next step: Agency Review"}
                                    </p>
                                    <p style={{ fontSize: 13, fontWeight: 300, color: T.muted, lineHeight: 1.6 }}>
                                        {currentRequest.status === "accepted"
                                            ? `Contact ${currentRequest.new_agency?.name} to finalize your care schedule.`
                                            : "The agency is currently reviewing your documentation and care requirements."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── TWO COLUMN: Quick actions + Notifications ── */}
                    <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                        {/* Quick actions */}
                        <div className="fu3" style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 20, padding: "22px 24px" }}>
                            <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 700, color: T.forest, marginBottom: 16, letterSpacing: "-0.01em" }}>Quick actions</h3>
                            <div className="quick-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                <Link href={currentRequest ? `/switch/${currentRequest.id}/messages` : "/switch"} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, padding: "14px", borderRadius: 14, background: T.forest, border: `1px solid ${T.forest}`, textDecoration: "none" }}>
                                    <Icons.Msg size={18} stroke={T.cream} />
                                    <span style={{ fontSize: 12, fontWeight: 600, color: T.cream, lineHeight: 1.3 }}>Message agency</span>
                                </Link>
                                <Link href={currentRequest ? `/switch/${currentRequest.id}` : "/switch"} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, padding: "14px", borderRadius: 14, border: `1px solid ${T.border}`, textDecoration: "none" }}>
                                    <Icons.Upload size={18} stroke={T.forest} />
                                    <span style={{ fontSize: 12, fontWeight: 600, color: T.forest, lineHeight: 1.3 }}>Upload doc</span>
                                </Link>
                                <Link href="/agencies" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, padding: "14px", borderRadius: 14, border: `1px solid ${T.border}`, textDecoration: "none" }}>
                                    <Icons.Search size={18} stroke={T.forest} />
                                    <span style={{ fontSize: 12, fontWeight: 600, color: T.forest, lineHeight: 1.3 }}>Find agencies</span>
                                </Link>
                                <Link href="/profile" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, padding: "14px", borderRadius: 14, border: `1px solid ${T.border}`, textDecoration: "none" }}>
                                    <Icons.User size={18} stroke={T.forest} />
                                    <span style={{ fontSize: 12, fontWeight: 600, color: T.forest, lineHeight: 1.3 }}>Update profile</span>
                                </Link>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="fu3" style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 20, padding: "22px 24px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 700, color: T.forest, letterSpacing: "-0.01em" }}>Notifications</h3>
                                <Link href="/notifications" style={{ fontSize: 11, fontWeight: 600, color: T.amber, textDecoration: "none", fontFamily: "'DM Mono',monospace" }}>View all</Link>
                            </div>
                            <div>
                                {data.notifications.length === 0 ? (
                                    <p style={{ fontSize: 13, color: T.muted, marginTop: 20, textAlign: "center" }}>No new notifications</p>
                                ) : (
                                    data.notifications.slice(0, 3).map(n => <NotifRow key={n.id} n={n} />)
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── PAST REQUESTS ── */}
                    {pastRequests.length > 0 && (
                        <div className="fu4" style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 20, overflow: "hidden" }}>
                            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 700, color: T.forest, letterSpacing: "-0.01em" }}>Past requests</h3>
                                <Link href="/switch" style={{ fontSize: 11, fontWeight: 600, color: T.amber, textDecoration: "none", fontFamily: "'DM Mono',monospace" }}>View all</Link>
                            </div>
                            {pastRequests.map((r, i) => (
                                <Link key={r.id} href={`/switch/${r.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: i < pastRequests.length - 1 ? `1px solid ${T.border}` : "none", textDecoration: "none" }}>
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: T.forest }}>{r.new_agency?.name}</p>
                                        <p style={{ fontSize: 11, color: T.muted, marginTop: 2, fontFamily: "'DM Mono',monospace" }}>{new Date(r.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <Badge status={r.status} />
                                        <Icons.Arrow size={13} stroke={T.muted} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* ── START NEW REQUEST PROMPT ── */}
                    <div className="fu5" style={{ marginTop: 16, background: `linear-gradient(135deg, ${T.forest} 0%, ${T.forestM} 100%)`, borderRadius: 20, padding: "24px 28px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(232,147,58,0.08)", pointerEvents: "none" }} />
                        <div style={{ position: "relative", zIndex: 1 }}>
                            <p style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, color: T.cream, marginBottom: 4, letterSpacing: "-0.01em" }}>Need to switch again in the future?</p>
                            <p style={{ fontSize: 13, fontWeight: 300, color: "rgba(255,248,231,0.6)", lineHeight: 1.6 }}>Browse verified Pennsylvania agencies anytime.</p>
                        </div>
                        <Link href="/agencies" style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: 8, background: T.amber, color: T.forest, fontSize: 13, fontWeight: 700, padding: "11px 22px", borderRadius: 100, textDecoration: "none", flexShrink: 0, transition: "all 0.2s", boxShadow: "0 4px 16px rgba(232,147,58,0.3)" }}>
                            Browse agencies <Icons.Arrow size={14} stroke={T.forest} />
                        </Link>
                    </div>

                </main>
            </div>

            {/* ── MOBILE BOTTOM NAV ── */}
            <nav className="mob-bottom-nav" style={{ display: "none", position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: "rgba(248,245,239,0.97)", borderTop: `1px solid ${T.border}`, backdropFilter: "blur(16px)", padding: "8px 0 calc(8px + env(safe-area-inset-bottom))", justifyContent: "space-around" }}>
                {[
                    { icon: Icons.Home, label: "Home", tab: "home", href: "/dashboard" },
                    { icon: Icons.File, label: "Requests", tab: "requests", href: "/switch" },
                    { icon: Icons.Msg, label: "Messages", tab: "messages", href: "/switch", badge: currentRequest?.status === "accepted" ? 1 : 0 },
                    { icon: Icons.Bell, label: "Alerts", tab: "notifs", href: "/notifications", badge: data.unreadCount },
                    { icon: Icons.User, label: "Profile", tab: "profile", href: "/profile" },
                ].map(item => (
                    <Link key={item.tab} href={item.href}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "4px 12px", position: "relative", textDecoration: "none" }}>
                        {(item.badge ?? 0) > 0 && <span style={{ position: "absolute", top: 0, right: 8, minWidth: 15, height: 15, borderRadius: 100, background: T.amber, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>{item.badge}</span>}
                        <item.icon size={20} stroke={activeTab === item.tab ? T.forest : T.muted} />
                        <span style={{ fontSize: 10, fontWeight: activeTab === item.tab ? 700 : 400, color: activeTab === item.tab ? T.forest : T.muted }}>{item.label}</span>
                    </Link>
                ))}
            </nav>

        </div>
    );
}

const SettingsIcon = (p: any) => <Ic {...p} d={["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"]} />;
