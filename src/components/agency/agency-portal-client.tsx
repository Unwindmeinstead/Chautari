"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

/* ══════════════════════════════════════════════════════════
   TOKENS — exact match to all other pages
══════════════════════════════════════════════════════════ */
const FD = "#0F2419";
const F = "#1A3D2B";
const FM = "#2A5C41";
const FL = "#3D7A57";
const CR = "#FFF8E7";
const AM = "#E8933A";
const MU = "#6B7B6E";

const CLR = {
    submitted: { c: "#FBBF24", bg: "rgba(251,191,36,0.1)", b: "rgba(251,191,36,0.22)" },
    under_review: { c: "#60A5FA", bg: "rgba(96,165,250,0.1)", b: "rgba(96,165,250,0.22)" },
    accepted: { c: "#4ADE80", bg: "rgba(74,222,128,0.1)", b: "rgba(74,222,128,0.22)" },
    completed: { c: "#A78BFA", bg: "rgba(167,139,250,0.1)", b: "rgba(167,139,250,0.22)" },
    denied: { c: "#F87171", bg: "rgba(248,113,113,0.1)", b: "rgba(248,113,113,0.22)" },
    new: { c: "#FBBF24", bg: "rgba(251,191,36,0.1)", b: "rgba(251,191,36,0.22)" },
};

/* ── Icons ── */
const Ic = ({ d, size = 16, stroke = "currentColor", fill = "none", sw = 1.5, style }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
        strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
        {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
);
const I = {
    Home: (p: any) => <Ic {...p} d={["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"]} />,
    Reqs: (p: any) => <Ic {...p} d={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M16 13H8", "M16 17H8", "M10 9H8"]} />,
    Msgs: (p: any) => <Ic {...p} d={["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"]} />,
    Team: (p: any) => <Ic {...p} d={["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"]} />,
    Profile: (p: any) => <Ic {...p} d={["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"]} />,
    Docs: (p: any) => <Ic {...p} d={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6"]} />,
    Notifs: (p: any) => <Ic {...p} d={["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 0 1-3.46 0"]} />,
    Settings: (p: any) => <Ic {...p} d={["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"]} />,
    Check: (p: any) => <Ic {...p} sw={2.5} d="M20 6L9 17l-5-5" />,
    X: (p: any) => <Ic {...p} d={["M18 6L6 18", "M6 6l12 12"]} />,
    Alert: (p: any) => <Ic {...p} d={["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"]} />,
    ChevR: (p: any) => <Ic {...p} d="M9 18l6-6-6-6" />,
    ChevD: (p: any) => <Ic {...p} d="M6 9l6 6 6-6" />,
    ChevL: (p: any) => <Ic {...p} d="M15 18l-6-6 6-6" />,
    Clock: (p: any) => <Ic {...p} d={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 6v6l4 2"]} />,
    Zap: (p: any) => <Ic {...p} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    Trend: (p: any) => <Ic {...p} d={["M23 6l-9.5 9.5-5-5L1 18", "M17 6h6v6"]} />,
    Activity: (p: any) => <Ic {...p} d="M22 12h-4l-3 9L9 3l-3 9H2" />,
    Pin: (p: any) => <Ic {...p} d={["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", "M12 7m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"]} />,
    Phone: (p: any) => <Ic {...p} d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l1.06-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />,
    Shield: (p: any) => <Ic {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    User: (p: any) => <Ic {...p} d={["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0"]} />,
    Star: (p: any) => <Ic {...p} fill={AM} stroke="none" sw={0} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    Globe: (p: any) => <Ic {...p} d={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M2 12h20", "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"]} />,
    Upload: (p: any) => <Ic {...p} d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"]} />,
    Menu: (p: any) => <Ic {...p} d={["M3 12h18", "M3 6h18", "M3 18h18"]} />,
    Logout: (p: any) => <Ic {...p} d={["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"]} />,
    ArrowR: (p: any) => <Ic {...p} d="M5 12h14M12 5l7 7-7 7" />,
    Plus: (p: any) => <Ic {...p} d={["M12 5v14", "M5 12h14"]} />,
    Eye: (p: any) => <Ic {...p} d={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"]} />,
    Toggle: (p: any) => <Ic {...p} d={["M9 12l2 2 4-4", "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"]} />,
    Lang: (p: any) => <Ic {...p} d={["M5 8l6 6", "M4 14l6-6 2-3", "M2 5h12", "M7 2h1", "M22 22l-5-10-5 10", "M14 18h6"]} />,
    Award: (p: any) => <Ic {...p} d={["M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z", "M8.21 13.89L7 23l5-3 5 3-1.21-9.12"]} />,
    Search: (p: any) => <Ic {...p} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />,
    Send: (p: any) => <Ic {...p} d={["M22 2L11 13", "M22 2L15 22l-4-9-9-4 20-7"]} />,
};

/* ── Logo ── */
const Logo = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg width={30} height={30} viewBox="0 0 48 48" fill="none">
            <rect x="4" y="4" width="40" height="40" rx="12" fill={CR} opacity="0.09" />
            <path d="M14 20L24 14L34 20" stroke={AM} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 14V28" stroke={AM} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M24 38C24 38 14 32 14 27C14 24.5 16 23 18 23C20 23 22 24.5 24 27C26 24.5 28 23 30 23C32 23 34 24.5 34 27C34 32 24 38 24 38Z" fill={CR} opacity="0.9" />
        </svg>
        <div>
            <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em", color: CR, lineHeight: 1 }}>
                Switch<span style={{ color: AM }}>My</span>Care
            </div>
            <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,248,231,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", marginTop: 1 }}>Agency Portal</div>
        </div>
    </div>
);

/* ── Glass card ── */
const Card = ({ children, style = {} }: any) => (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,248,231,0.07)", borderRadius: 20, ...style }}>
        {children}
    </div>
);

/* ── Card header ── */
const CardHead = ({ title, sub, action }: any) => (
    <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 22px", borderBottom: "1px solid rgba(255,248,231,0.06)"
    }}>
        <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: CR, fontFamily: "'Fraunces',serif", letterSpacing: "-0.01em" }}>{title}</p>
            {sub && <p style={{ fontSize: 11, color: "rgba(255,248,231,0.35)", marginTop: 2 }}>{sub}</p>}
        </div>
        {action}
    </div>
);

/* ── Status badge ── */
const Badge = ({ type, label }: any) => {
    const s = (CLR as any)[type] || { c: "rgba(255,248,231,0.5)", bg: "rgba(255,255,255,0.06)", b: "rgba(255,248,231,0.1)" };
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700,
            color: s.c, background: s.bg, border: `1px solid ${s.b}`, borderRadius: 100,
            padding: "3px 9px", whiteSpace: "nowrap", fontFamily: "'DM Mono',monospace", letterSpacing: "0.03em"
        }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.c, flexShrink: 0 }} />
            {label}
        </span>
    );
};

/* ── KPI tile ── */
const KpiTile = ({ label, value, sub, accent, icon: Icon, alert }: any) => (
    <div style={{
        background: "rgba(255,255,255,0.04)", border: `1px solid ${alert ? "rgba(251,191,36,0.25)" : "rgba(255,248,231,0.07)"}`,
        borderRadius: 18, padding: "18px 20px", position: "relative", overflow: "hidden"
    }}>
        <div style={{
            position: "absolute", top: 0, left: 0, width: 3, height: "100%",
            background: alert ? "#FBBF24" : accent, borderRadius: "18px 0 0 18px", opacity: 0.7
        }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{
                fontSize: 10, fontWeight: 600, color: "rgba(255,248,231,0.4)",
                letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace"
            }}>{label}</p>
            <div style={{
                width: 30, height: 30, borderRadius: 9, background: `${accent}15`,
                border: `1px solid ${accent}25`, display: "flex", alignItems: "center", justifyContent: "center"
            }}>
                <Icon size={14} stroke={accent} />
            </div>
        </div>
        <p style={{
            fontFamily: "'Fraunces',serif", fontSize: 30, fontWeight: 800, color: CR,
            lineHeight: 1, letterSpacing: "-0.03em", marginBottom: 5
        }}>{value}</p>
        <p style={{ fontSize: 11, color: "rgba(255,248,231,0.35)" }}>{sub}</p>
        {alert && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "#FBBF24" }} />}
    </div>
);

/* ── Tab bar ── */
const TabBar = ({ tabs, active, onChange }: any) => (
    <div style={{ display: "flex", gap: 2, overflowX: "auto", borderBottom: "1px solid rgba(255,248,231,0.07)", flexShrink: 0 }}>
        {tabs.map((t: any) => (
            <button key={t.value} onClick={() => onChange(t.value)}
                style={{
                    padding: "10px 16px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
                    background: "none", border: "none", borderBottom: active === t.value ? `2px solid ${AM}` : "2px solid transparent",
                    marginBottom: -1, cursor: "pointer", fontFamily: "inherit", transition: "color .15s",
                    color: active === t.value ? AM : "rgba(255,248,231,0.38)"
                }}>
                {t.label}
                {t.count != null && (
                    <span style={{
                        marginLeft: 6, fontSize: 10, fontWeight: 700,
                        background: active === t.value ? `${AM}22` : "rgba(255,248,231,0.07)",
                        color: active === t.value ? AM : "rgba(255,248,231,0.3)",
                        borderRadius: 100, padding: "1px 6px", fontFamily: "'DM Mono',monospace"
                    }}>
                        {t.count}
                    </span>
                )}
            </button>
        ))}
    </div>
);

/* ── Avatar ── */
const Avatar = ({ name, size = 32, color = "#60A5FA" }: any) => (
    <div style={{
        width: size, height: size, borderRadius: size / 3, flexShrink: 0,
        background: `${color}18`, border: `1px solid ${color}28`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.38, fontWeight: 700, color
    }}>
        {(name || "?")[0].toUpperCase()}
    </div>
);

/* ── Urgency badge ── */
const UrgencyBadge = ({ hrs }: any) => {
    if (hrs >= 48) return <Badge type="denied" label="48h+" />;
    if (hrs >= 24) return <Badge type="submitted" label="24h+" />;
    return <Badge type="accepted" label="New" />;
};

/* ── Empty state ── */
const Empty = ({ icon: Icon, title, sub }: any) => (
    <div style={{
        padding: "52px 24px", display: "flex", flexDirection: "column",
        alignItems: "center", gap: 12, textAlign: "center"
    }}>
        <div style={{
            width: 52, height: 52, borderRadius: 16, background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,248,231,0.07)",
            display: "flex", alignItems: "center", justifyContent: "center"
        }}>
            <Icon size={24} stroke="rgba(255,248,231,0.2)" />
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,248,231,0.5)" }}>{title}</p>
        {sub && <p style={{ fontSize: 12, color: "rgba(255,248,231,0.25)", maxWidth: 280 }}>{sub}</p>}
    </div>
);

/* ── Search input ── */
const SearchInput = ({ value, onChange, placeholder = "Search…" }: any) => (
    <div style={{ position: "relative" }}>
        <I.Search size={13} stroke="rgba(255,248,231,0.3)"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={{
                width: "100%", height: 36, paddingLeft: 34, paddingRight: 12,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,248,231,0.09)",
                borderRadius: 12, fontSize: 12, color: CR, outline: "none", fontFamily: "inherit", caretColor: AM
            }}
            onFocus={(e: any) => e.target.style.borderColor = "rgba(232,147,58,0.4)"}
            onBlur={(e: any) => e.target.style.borderColor = "rgba(255,248,231,0.09)"} />
    </div>
);

/* ── Link-style button ── */
const LinkBtn = ({ children, onClick, color = AM }: any) => (
    <button onClick={onClick} style={{
        background: "none", border: "none", cursor: "pointer",
        fontFamily: "inherit", fontSize: 12, fontWeight: 600, color,
        display: "flex", alignItems: "center", gap: 4, transition: "opacity .15s", padding: 0
    }}
        onMouseEnter={(e: any) => e.currentTarget.style.opacity = ".7"}
        onMouseLeave={(e: any) => e.currentTarget.style.opacity = "1"}>
        {children}
    </button>
);

function OverviewView({ setView, setSelectedReq, agency, staff, requests, notifications }: any) {
    const pending = requests.filter((r: any) => ["submitted", "under_review"].includes(r.status));
    const submitted = requests.filter((r: any) => r.status === "submitted");
    const active = requests.filter((r: any) => r.status === "accepted");
    const completed = requests.filter((r: any) => r.status === "completed");
    const unread = notifications.filter((n: any) => !n.read_at).length;

    const profileChecks = [
        { label: "Phone", ok: !!agency.phone },
        { label: "Website", ok: !!agency.website },
        { label: "Email", ok: !!agency.email },
        { label: "Counties", ok: agency.service_counties?.length > 0 },
        { label: "Services", ok: agency.services_offered?.length > 0 },
        { label: "Languages", ok: agency.languages_spoken?.length > 0 },
    ];
    const profileScore = Math.round((profileChecks.filter(c => c.ok).length / profileChecks.length) * 100);

    const sortedPending = [...pending].sort((a, b) => {
        const ah = (Date.now() - new Date(a.submitted_at || a.created_at).getTime()) / 3600000;
        const bh = (Date.now() - new Date(b.submitted_at || b.created_at).getTime()) / 3600000;
        return bh - ah;
    }).slice(0, 6);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {submitted.length > 0 && (
                <div onClick={() => setView("requests")}
                    style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "12px 18px",
                        background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.22)",
                        borderRadius: 16, cursor: "pointer", transition: "background .15s"
                    }}
                    onMouseEnter={(e: any) => e.currentTarget.style.background = "rgba(251,191,36,0.11)"}
                    onMouseLeave={(e: any) => e.currentTarget.style.background = "rgba(251,191,36,0.07)"}>
                    <I.Alert size={16} stroke="#FBBF24" />
                    <p style={{ flex: 1, fontSize: 13, color: "#FBBF24", fontWeight: 600 }}>
                        {submitted.length} new request{submitted.length > 1 ? "s" : ""} need your response
                    </p>
                    <I.ChevR size={14} stroke="#FBBF24" />
                </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }} className="header-stack">
                <div>
                    <p style={{
                        fontSize: 10, fontWeight: 600, color: "rgba(255,248,231,0.35)",
                        letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", marginBottom: 4
                    }}>
                        Good morning
                    </p>
                    <h2 style={{
                        fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 800,
                        color: CR, letterSpacing: "-0.02em", lineHeight: 1.1
                    }}>{agency.name}</h2>
                    <p style={{ fontSize: 12, color: "rgba(255,248,231,0.4)", marginTop: 5 }}>
                        {staff.full_name || staff.email} · <span style={{ textTransform: "capitalize" }}>{staff.role}</span>
                        {pending.length > 0 && <span style={{ color: "#FBBF24", fontWeight: 600 }} className="hide-mobile"> · {pending.length} actions needed</span>}
                    </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
                        background: agency.is_accepting_patients ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.03)",
                        border: agency.is_accepting_patients ? "1px solid rgba(74,222,128,0.2)" : "1px solid rgba(255,248,231,0.08)",
                        borderRadius: 14, cursor: "pointer"
                    }}>
                        <div style={{
                            width: 36, height: 20, borderRadius: 10,
                            background: agency.is_accepting_patients ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.1)",
                            border: agency.is_accepting_patients ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(255,248,231,0.15)",
                            position: "relative"
                        }}>
                            <div style={{
                                position: "absolute", top: 2, left: agency.is_accepting_patients ? 18 : 2, width: 14, height: 14, borderRadius: "50%",
                                background: agency.is_accepting_patients ? "#4ADE80" : "rgba(255,255,255,0.4)",
                                transition: "all .2s ease"
                            }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: agency.is_accepting_patients ? "#4ADE80" : "rgba(255,248,231,0.4)" }}>
                            {agency.is_accepting_patients ? "Accepting patients" : "Paused"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="kpi-grid">
                <KpiTile label="New" value={submitted.length} sub="Awaiting response" accent="#FBBF24" icon={I.Reqs} alert={submitted.length > 0} />
                <KpiTile label="Active" value={active.length} sub="In progress" accent="#60A5FA" icon={I.Activity} />
                <KpiTile label="Completed" value={completed.length} sub="All time" accent="#4ADE80" icon={I.Check} />
                <KpiTile label="Avg Response" value={`${agency.average_response_time_hours || 0}h`} sub="Rolling 30 days" accent="#A78BFA" icon={I.Clock} />
                <KpiTile label="Acceptance" value="82%" sub="Last 90 days" accent={AM} icon={I.Trend} />
                <KpiTile label="Unread" value={unread} sub="Alerts" accent="#F87171" icon={I.Notifs} alert={unread > 0} />
            </div>

            <div className="dash-grid">
                <Card>
                    <CardHead title="Request Pipeline"
                        sub="Sorted by urgency — oldest first"
                        action={<LinkBtn onClick={() => setView("requests")}>All requests <I.ChevR size={12} stroke={AM} /></LinkBtn>} />
                    {sortedPending.length === 0 ? (
                        <Empty icon={I.Check} title="All caught up!" sub="No pending requests. Keep your profile complete to receive more matches." />
                    ) : (
                        <div>
                            {sortedPending.map((r, i) => {
                                const hrs = (Date.now() - new Date(r.submitted_at || r.created_at).getTime()) / 3600000;
                                return (
                                    <div key={r.id} style={{
                                        padding: "14px 22px",
                                        borderBottom: i < sortedPending.length - 1 ? "1px solid rgba(255,248,231,0.05)" : "none",
                                        transition: "background .15s", cursor: "pointer"
                                    }}
                                        onMouseEnter={(e: any) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                                        onMouseLeave={(e: any) => e.currentTarget.style.background = "transparent"}
                                        onClick={() => { setSelectedReq(r.id); setView("request-detail"); }}>
                                        <div style={{
                                            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                                            gap: 12, flexWrap: "wrap"
                                        }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                                                    <Avatar name={r.patient?.full_name || "?"} size={28} color="#60A5FA" />
                                                    <p style={{ fontSize: 13, fontWeight: 600, color: CR }}>{r.patient?.full_name || "Patient"}</p>
                                                    <span style={{
                                                        fontSize: 11, color: "rgba(255,248,231,0.4)",
                                                        background: "rgba(255,255,255,0.05)", borderRadius: 100, padding: "2px 8px"
                                                    }}>{r.care_type?.replace("_", " ")}</span>
                                                    <UrgencyBadge hrs={hrs} />
                                                </div>
                                                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingLeft: 36 }}>
                                                    <span style={{ fontSize: 11, color: "rgba(255,248,231,0.35)", display: "flex", alignItems: "center", gap: 4 }}>
                                                        <I.Shield size={11} stroke="rgba(255,248,231,0.3)" />{r.patient_details?.payer_type?.toUpperCase() || "Unknown"}
                                                    </span>
                                                    <span style={{ fontSize: 11, color: "rgba(255,248,231,0.35)", display: "flex", alignItems: "center", gap: 4 }}>
                                                        <I.Pin size={11} stroke="rgba(255,248,231,0.3)" />{r.patient_details?.address_county || "Any"}
                                                    </span>
                                                    <span style={{ fontSize: 11, color: "rgba(255,248,231,0.35)" }}>Starts {r.requested_start_date ? new Date(r.requested_start_date).toLocaleDateString() : "ASAP"}</span>
                                                </div>
                                            </div>
                                            <div className="pipeline-actions" style={{ display: "flex", gap: 7, flexShrink: 0 }}>
                                                <button onClick={(e: any) => { e.stopPropagation() }}
                                                    style={{
                                                        height: 30, padding: "0 14px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                                                        background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)",
                                                        color: "#4ADE80", cursor: "pointer", fontFamily: "inherit", transition: "all .15s"
                                                    }}
                                                    onMouseEnter={(e: any) => e.currentTarget.style.background = "rgba(74,222,128,0.25)"}
                                                    onMouseLeave={(e: any) => e.currentTarget.style.background = "rgba(74,222,128,0.15)"}>
                                                    Accept
                                                </button>
                                                <button onClick={(e: any) => { e.stopPropagation() }}
                                                    style={{
                                                        height: 30, padding: "0 14px", borderRadius: 10, fontSize: 11, fontWeight: 600,
                                                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,248,231,0.1)",
                                                        color: "rgba(255,248,231,0.6)", cursor: "pointer", fontFamily: "inherit", transition: "all .15s"
                                                    }}
                                                    onMouseEnter={(e: any) => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                                                    onMouseLeave={(e: any) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                                                    Decline
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <Card>
                        <CardHead title="Profile Health"
                            action={<LinkBtn onClick={() => setView("profile")}>Improve <I.ChevR size={12} stroke={AM} /></LinkBtn>} />
                        <div style={{ padding: "18px 20px" }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                                <span style={{ fontFamily: "'Fraunces',serif", fontSize: 30, fontWeight: 800, color: CR, letterSpacing: "-0.03em" }}>{profileScore}%</span>
                                {profileScore === 100 && <span style={{ fontSize: 11, fontWeight: 600, color: "#4ADE80" }}>Complete</span>}
                            </div>
                            <div style={{ height: 5, borderRadius: 3, background: "rgba(255,248,231,0.07)", overflow: "hidden", marginBottom: 14 }}>
                                <div style={{
                                    height: "100%", width: `${profileScore}%`, borderRadius: 3,
                                    background: profileScore >= 80 ? "#4ADE80" : profileScore >= 50 ? "#FBBF24" : "#F87171",
                                    transition: "width .7s cubic-bezier(.4,0,.2,1)"
                                }} />
                            </div>
                            {profileChecks.filter(c => !c.ok).slice(0, 3).map(c => (
                                <div key={c.label} style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "7px 10px", marginBottom: 6,
                                    background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 10
                                }}>
                                    <I.Alert size={11} stroke="#FBBF24" />
                                    <span style={{ fontSize: 11, color: "#FBBF24" }}>Missing: {c.label}</span>
                                </div>
                            ))}
                            <div style={{
                                marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,248,231,0.06)",
                                display: "flex", justifyContent: "space-between", alignItems: "center"
                            }}>
                                <span style={{ fontSize: 11, color: agency.is_verified_partner ? "#4ADE80" : "rgba(255,248,231,0.3)", fontWeight: 600 }}>
                                    {agency.is_verified_partner ? "✓ Verified partner" : "Verification pending"}
                                </span>
                                <span style={{ fontSize: 11, color: AM, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                                    <I.Star size={11} />{agency.medicare_quality_score || "—"}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function RequestsView({ setView, setSelectedReq, requests }: any) {
    const [tab, setTab] = useState("all");
    const [q, setQ] = useState("");
    const tabs = [
        { value: "all", label: "All", count: requests.length },
        { value: "submitted", label: "New", count: requests.filter((r: any) => r.status === "submitted").length },
        { value: "under_review", label: "Reviewing", count: requests.filter((r: any) => r.status === "under_review").length },
        { value: "accepted", label: "Accepted", count: requests.filter((r: any) => r.status === "accepted").length },
        { value: "completed", label: "Completed", count: requests.filter((r: any) => r.status === "completed").length },
        { value: "denied", label: "Denied", count: requests.filter((r: any) => r.status === "denied").length },
    ];
    const filtered = requests
        .filter((r: any) => tab === "all" || r.status === tab)
        .filter((r: any) => !q || r.patient?.full_name?.toLowerCase().includes(q.toLowerCase()) || r.patient_details?.address_county?.toLowerCase().includes(q.toLowerCase()));

    const statusLabel = (s: string) => ({ submitted: "New", under_review: "Reviewing", accepted: "Accepted", completed: "Completed", denied: "Denied" })[s] || s;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                    <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 800, color: CR, letterSpacing: "-0.02em" }}>Switch Requests</h2>
                    <p style={{ fontSize: 12, color: "rgba(255,248,231,0.4)", marginTop: 2 }}>
                        {requests.length} total · <span style={{ color: "#FBBF24", fontWeight: 600 }}>{requests.filter((r: any) => r.status === "submitted").length} pending action</span>
                    </p>
                </div>
                <div style={{ width: 240 }}><SearchInput value={q} onChange={setQ} placeholder="Search patient or county…" /></div>
            </div>

            <Card>
                <div style={{ padding: "0 22px" }}><TabBar tabs={tabs} active={tab} onChange={setTab} /></div>
                {filtered.length === 0 ? (
                    <Empty icon={I.Reqs} title="No requests found" sub="Try a different filter or search term." />
                ) : (
                    <div>
                        {filtered.map((r: any, i: number) => {
                            const hrs = (Date.now() - new Date(r.submitted_at || r.created_at).getTime()) / 3600000;
                            return (
                                <div key={r.id}
                                    style={{
                                        padding: "16px 22px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,248,231,0.05)" : "none",
                                        transition: "background .15s", cursor: "pointer"
                                    }}
                                    onMouseEnter={(e: any) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                                    onMouseLeave={(e: any) => e.currentTarget.style.background = "transparent"}
                                    onClick={() => { setSelectedReq(r.id); setView("request-detail"); }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                                            <Avatar name={r.patient?.full_name || "?"} color="#60A5FA" />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                                                    <p style={{ fontSize: 13, fontWeight: 600, color: CR }}>{r.patient?.full_name || "Patient"}</p>
                                                    <span style={{
                                                        fontSize: 11, color: "rgba(255,248,231,0.4)",
                                                        background: "rgba(255,255,255,0.05)", borderRadius: 100, padding: "2px 8px"
                                                    }}>{r.care_type?.replace("_", " ")}</span>
                                                    {["submitted", "under_review"].includes(r.status) && <UrgencyBadge hrs={hrs} />}
                                                </div>
                                                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                                                    <span style={{ fontSize: 11, color: "rgba(255,248,231,0.35)" }}>{r.patient_details?.payer_type?.toUpperCase()}</span>
                                                    <span style={{ fontSize: 11, color: "rgba(255,248,231,0.35)" }}>{r.patient_details?.address_county} County</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                                            <Badge type={r.status} label={statusLabel(r.status)} />
                                            <I.ChevR size={14} stroke="rgba(255,248,231,0.25)" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
}

function RequestDetailView({ reqId, setView, requests }: any) {
    const r = requests.find((x: any) => x.id === reqId) || requests[0];
    const statusLabel = (s: string) => ({ submitted: "New", under_review: "Reviewing", accepted: "Accepted", completed: "Completed", denied: "Denied" })[s] || s;

    if (!r) return <Empty icon={I.Reqs} title="Request not found" />;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 860 }}>
            <button onClick={() => setView("requests")}
                style={{
                    display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600,
                    color: "rgba(255,248,231,0.4)", background: "none", border: "none", cursor: "pointer",
                    fontFamily: "inherit", padding: 0, transition: "color .15s"
                }}
                onMouseEnter={(e: any) => e.currentTarget.style.color = CR}
                onMouseLeave={(e: any) => e.currentTarget.style.color = "rgba(255,248,231,0.4)"}>
                <I.ChevL size={14} stroke="currentColor" /> All requests
            </button>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                    <p style={{ fontSize: 10, color: "rgba(255,248,231,0.3)", fontFamily: "'DM Mono',monospace", marginBottom: 4, letterSpacing: "0.08em" }}>
                        REQ-{r.id.slice(0, 8).toUpperCase()}
                    </p>
                    <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 800, color: CR, letterSpacing: "-0.02em", marginBottom: 4 }}>
                        Switch Request
                    </h2>
                </div>
                <Badge type={r.status} label={statusLabel(r.status)} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 264px", gap: 16, alignItems: "start" }} className="detail-grid">
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <Card>
                        <CardHead title="Patient Information"
                            action={
                                <button
                                    onClick={() => setView("messages")}
                                    style={{ background: AM, color: FD, border: "none", borderRadius: 10, padding: "8px 16px", fontWeight: 800, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                                >
                                    <I.Msgs size={14} stroke={FD} /> Message Patient
                                </button>
                            }
                        />
                        <div style={{ padding: "18px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="info-grid">
                            <div>
                                <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,248,231,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", marginBottom: 5 }}>Full name</p>
                                <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,248,231,0.8)" }}>{r.patient?.full_name}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,248,231,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", marginBottom: 5 }}>Location</p>
                                <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,248,231,0.8)" }}>{r.patient_details?.address_city}, {r.patient_details?.address_county} County</p>
                            </div>
                            <div>
                                <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,248,231,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", marginBottom: 5 }}>Insurance</p>
                                <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,248,231,0.8)" }}>{r.patient_details?.payer_type?.toUpperCase()}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function MessagesView({ conversations }: { conversations: any[] }) {
    const totalUnread = conversations.reduce((sum, c) => sum + (c.agency_unread || 0), 0);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                    <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 800, color: CR, letterSpacing: "-0.02em" }}>Messages</h2>
                    <p style={{ fontSize: 12, color: "rgba(255,248,231,0.4)", marginTop: 2 }}>
                        {conversations.length} total conversations · <span style={{ color: "#FBBF24", fontWeight: 600 }}>{totalUnread} unread</span>
                    </p>
                </div>
            </div>

            <Card style={{ overflow: "hidden" }}>
                {conversations.length === 0 ? (
                    <Empty icon={I.Msgs} title="No conversations" sub="Once patients start requesting switches, secure chat threads will appear here." />
                ) : (
                    <div style={{ display: "grid" }}>
                        {conversations.map((conv, i) => (
                            <Link
                                key={conv.id}
                                href={`/agency/messages/${conv.id}`}
                                style={{
                                    padding: "16px 22px",
                                    borderBottom: i < conversations.length - 1 ? "1px solid rgba(255,248,231,0.05)" : "none",
                                    display: "flex", alignItems: "center", gap: 14,
                                    textDecoration: "none",
                                    transition: "background .15s"
                                }}
                                onMouseEnter={(e: any) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                                onMouseLeave={(e: any) => e.currentTarget.style.background = "transparent"}
                            >
                                <Avatar name={conv.patient_name || "?"} size={40} color={conv.agency_unread > 0 ? "#60A5FA" : "rgba(255,248,231,0.5)"} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                                        <p style={{ fontSize: 13, fontWeight: conv.agency_unread > 0 ? 800 : 600, color: conv.agency_unread > 0 ? "#60A5FA" : CR }}>
                                            {conv.patient_name || "Patient"}
                                        </p>
                                        <p style={{ fontSize: 10, color: "rgba(255,248,231,0.25)", fontFamily: "'DM Mono',monospace" }}>
                                            {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : ""}
                                        </p>
                                    </div>
                                    <p style={{ fontSize: 12, color: "rgba(255,248,231,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {conv.last_message_preview || "No messages yet"}
                                    </p>
                                </div>
                                {conv.agency_unread > 0 && (
                                    <div style={{ background: AM, color: FD, fontSize: 10, fontWeight: 800, minWidth: 18, height: 18, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>
                                        {conv.agency_unread}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}


export function AgencyPortalClient({
    agency, member, requests, notifications, conversations = [], staff
}: any) {
    const NAV_ITEMS = [
        { id: "overview", label: "Overview", icon: I.Home, badge: null },
        { id: "requests", label: "Requests", icon: I.Reqs, badge: null },
        { id: "messages", label: "Messages", icon: I.Msgs, badge: conversations.reduce((sum: number, c: any) => sum + (c.agency_unread || 0), 0) || null },
        { id: "team", label: "Team", icon: I.Team, badge: null },
        { id: "profile", label: "Profile", icon: I.Profile, badge: null },
        { id: "notifs", label: "Alerts", icon: I.Notifs, badge: null },
        { id: "settings", label: "Settings", icon: I.Settings, badge: null },
    ];
    const [view, setView] = useState("overview");
    const [selectedReq, setSelectedReq] = useState(null);
    const [drawerOpen, setDrawer] = useState(false);
    const [profileOpen, setProfile] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const h = (e: any) => { if ((profileRef as any).current && !(profileRef as any).current.contains(e.target)) setProfile(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    const viewLabel = ({
        overview: "Overview",
        requests: "Requests",
        messages: "Messages",
        team: "Team",
        profile: "Profile",
        notifs: "Notifications",
        settings: "Settings",
        "request-detail": "Request Detail",
    } as any)[view] || view;

    const renderView = () => {
        switch (view) {
            case "overview": return <OverviewView setView={setView} setSelectedReq={setSelectedReq} agency={agency} staff={staff} requests={requests} notifications={notifications} />;
            case "requests": return <RequestsView setView={setView} setSelectedReq={setSelectedReq} requests={requests} />;
            case "request-detail": return <RequestDetailView reqId={selectedReq} setView={setView} requests={requests} />;
            case "messages": return <MessagesView conversations={conversations} />;
            case "team": return <Empty icon={I.Team} title="Team Management Coming Soon" sub="Manage your agency staff and roles here. (Feature coming soon)" />;
            case "profile": return <Empty icon={I.Profile} title="Profile Editing Coming Soon" sub="Update your agency's public listing, services, and coverage area." />;
            case "notifs": return <Empty icon={I.Notifs} title="Notifications Coming Soon" sub="View all your recent activity and alerts." />;
            case "settings": return <Empty icon={I.Settings} title="Settings Coming Soon" sub="Manage your account preferences and security settings." />;
            default: return <OverviewView setView={setView} setSelectedReq={setSelectedReq} agency={agency} staff={staff} requests={requests} notifications={notifications} />;
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", background: FD, fontFamily: "'DM Sans',sans-serif", color: CR }}>
            <style dangerouslySetInnerHTML={{
                __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;0,900;1,700;1,800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;}
        @keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .page-in{animation:fu .35s ease both}
        @keyframes pulse-live{0%,100%{opacity:1}50%{opacity:.35}}
        .live{animation:pulse-live 2s ease-in-out infinite}
        
        /* Grid Optimization */
        .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .dash-grid { display: grid; grid-template-columns: 1fr 288px; gap: 16px; align-items: start; }
        
        @media(max-width:1023px){
          .desktop-sidebar{display:none!important}
          .mobile-topbar{display:flex!important}
          .bottom-nav{display:flex!important}
          .main-pad{padding:24px 16px 100px!important}
          .kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .dash-grid { grid-template-columns: 1fr; gap: 20px; }
          .hide-mobile { display: none !important; }
        }
        
        @media(max-width:640px){
          .kpi-grid { grid-template-columns: 1fr; }
          .pipeline-actions { width: 100%; display: grid !important; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
          .pipeline-actions button { height: 38px !important; font-size: 13px !important; }
          .header-stack { flex-direction: column !important; align-items: flex-start !important; }
          .header-stack > div { width: 100% !important; }
        }

        @media(min-width:1024px){
          .mobile-topbar{display:none!important}
          .bottom-nav{display:none!important}
        }
      ` }} />

            {/* DESKTOP SIDEBAR */}
            <aside className="desktop-sidebar" style={{ width: 240, flexShrink: 0, height: "100vh", position: "sticky", top: 0, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,248,231,0.06)" }}>
                <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,248,231,0.06)" }}><Logo /></div>
                <nav style={{ padding: 12, flex: 1 }}>
                    {NAV_ITEMS.map(item => (
                        <button key={item.id} onClick={() => setView(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, border: "none", background: view === item.id ? "rgba(255,255,255,0.08)" : "none", color: view === item.id ? AM : CR, fontSize: 14, fontWeight: view === item.id ? 700 : 400, cursor: "pointer", marginBottom: 4, textAlign: "left" }}>
                            <item.icon size={16} stroke="currentColor" />{item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* MAIN */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                <header className="mobile-topbar" style={{ height: 64, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,248,231,0.08)", background: FD, position: "sticky", top: 0, zIndex: 100 }}>
                    <button onClick={() => setDrawer(true)} style={{ background: "none", border: "none" }}><I.Menu size={24} stroke={CR} /></button>
                    <Logo />
                    <Avatar name={staff.full_name || "?"} size={32} color="#FBBF24" />
                </header>

                <header className="desktop-sidebar" style={{ height: 64, padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,248,231,0.08)", background: FD, position: "sticky", top: 0, zIndex: 50 }}>
                    <h1 style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Fraunces',serif" }}>{viewLabel}</h1>
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                        <p style={{ fontSize: 12, color: "rgba(255,248,231,0.4)" }}>{dateStr}</p>
                        <Avatar name={staff.full_name || "?"} size={32} color="#FBBF24" />
                    </div>
                </header>

                <main className="main-pad page-in" style={{ padding: 40, flex: 1, overflowY: "auto" }}>
                    {renderView()}
                </main>
            </div>

            {/* MOBILE BOTTOM NAV */}
            <nav className="bottom-nav" style={{ display: "none", position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, height: 70, background: "#0F2419ec", borderTop: "1px solid rgba(255,248,231,0.1)", backdropFilter: "blur(20px)", alignItems: "center", justifyContent: "space-around" }}>
                {NAV_ITEMS.slice(0, 5).map(item => (
                    <button key={item.id} onClick={() => setView(item.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", color: view === item.id ? AM : "rgba(255,248,231,0.4)" }}>
                        <item.icon size={22} stroke="currentColor" />
                        <span style={{ fontSize: 10, fontWeight: 700 }}>{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}
