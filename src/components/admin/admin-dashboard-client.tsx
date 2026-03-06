"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
    getAdminUsers, getAdminAgencies, getAdminRequests, getAuditLogs,
    setUserRole, suspendUser, deleteUserAccount, approveAgency,
    deactivateAgency, toggleVerifiedPartner
} from "@/lib/admin-actions";
import type { PlatformStats, AdminUser, AdminAgency, AdminRequest, AuditLogEntry } from "@/lib/admin-actions";

/* ══════════════════════════════════════════════════════════
   DESIGN TOKENS — exact match to landing / agencies pages
══════════════════════════════════════════════════════════ */
const FD = "#0F2419";   // forest dark (page bg)
const F = "#1A3D2B";   // forest
const FM = "#2A5C41";   // forest mid
const FL = "#3D7A57";   // forest light
const CR = "#FFF8E7";   // cream (primary text)
const AM = "#E8933A";   // amber
const MU = "#6B7B6E";   // muted

// Status / role accent palette
const CLR: Record<string, { c: string; bg: string; b: string }> = {
    new: { c: "#FBBF24", bg: "rgba(251,191,36,0.1)", b: "rgba(251,191,36,0.22)" },
    submitted: { c: "#FBBF24", bg: "rgba(251,191,36,0.1)", b: "rgba(251,191,36,0.22)" },
    reviewing: { c: "#60A5FA", bg: "rgba(96,165,250,0.1)", b: "rgba(96,165,250,0.22)" },
    under_review: { c: "#60A5FA", bg: "rgba(96,165,250,0.1)", b: "rgba(96,165,250,0.22)" },
    accepted: { c: "#4ADE80", bg: "rgba(74,222,128,0.1)", b: "rgba(74,222,128,0.22)" },
    completed: { c: "#A78BFA", bg: "rgba(167,139,250,0.1)", b: "rgba(167,139,250,0.22)" },
    denied: { c: "#F87171", bg: "rgba(248,113,113,0.1)", b: "rgba(248,113,113,0.22)" },
    cancelled: { c: MU, bg: "rgba(107,123,110,0.1)", b: "rgba(107,123,110,0.2)" },
    pending: { c: "#FBBF24", bg: "rgba(251,191,36,0.1)", b: "rgba(251,191,36,0.22)" },
    approved: { c: "#4ADE80", bg: "rgba(74,222,128,0.1)", b: "rgba(74,222,128,0.22)" },
    inactive: { c: MU, bg: "rgba(107,123,110,0.1)", b: "rgba(107,123,110,0.2)" },
    patient: { c: "rgba(255,248,231,0.7)", bg: "rgba(255,255,255,0.06)", b: "rgba(255,248,231,0.12)" },
    agency_staff: { c: "#60A5FA", bg: "rgba(96,165,250,0.1)", b: "rgba(96,165,250,0.22)" },
    agency_admin: { c: "#FBBF24", bg: "rgba(251,191,36,0.1)", b: "rgba(251,191,36,0.22)" },
    switchmycare_admin: { c: "#F87171", bg: "rgba(248,113,113,0.1)", b: "rgba(248,113,113,0.22)" },
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
    Requests: (p: any) => <Ic {...p} d={["M8 3H5a2 2 0 0 0-2 2v3", "M21 8V5a2 2 0 0 0-2-2h-3", "M3 16v3a2 2 0 0 0 2 2h3", "M16 21h3a2 2 0 0 0 2-2v-3"]} />,
    Agency: (p: any) => <Ic {...p} d={["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"]} />,
    Users: (p: any) => <Ic {...p} d={["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"]} />,
    Audit: (p: any) => <Ic {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    Settings: (p: any) => <Ic {...p} d={["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"]} />,
    Bell: (p: any) => <Ic {...p} d={["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 0 1-3.46 0"]} />,
    Search: (p: any) => <Ic {...p} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />,
    ChevR: (p: any) => <Ic {...p} d="M9 18l6-6-6-6" />,
    ChevD: (p: any) => <Ic {...p} d="M6 9l6 6 6-6" />,
    Check: (p: any) => <Ic {...p} sw={2.5} d="M20 6L9 17l-5-5" />,
    X: (p: any) => <Ic {...p} d={["M18 6L6 18", "M6 6l12 12"]} />,
    Alert: (p: any) => <Ic {...p} d={["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"]} />,
    Trend: (p: any) => <Ic {...p} d={["M23 6l-9.5 9.5-5-5L1 18", "M17 6h6v6"]} />,
    Activity: (p: any) => <Ic {...p} d="M22 12h-4l-3 9L9 3l-3 9H2" />,
    Zap: (p: any) => <Ic {...p} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    Globe: (p: any) => <Ic {...p} d={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M2 12h20", "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"]} />,
    Menu: (p: any) => <Ic {...p} d={["M3 12h18", "M3 6h18", "M3 18h18"]} />,
    Eye: (p: any) => <Ic {...p} d={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"]} />,
    Filter: (p: any) => <Ic {...p} d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />,
    Clock: (p: any) => <Ic {...p} d={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 6v6l4 2"]} />,
    Shield: (p: any) => <Ic {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    Dot: (p: any) => <Ic {...p} fill="currentColor" stroke="none" sw={0} d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0" />,
    ArrowR: (p: any) => <Ic {...p} d="M5 12h14M12 5l7 7-7 7" />,
    Plus: (p: any) => <Ic {...p} d={["M12 5v14", "M5 12h14"]} />,
    Refresh: (p: any) => <Ic {...p} d={["M23 4v6h-6", "M1 20v-6h6", "M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"]} />,
    Ban: (p: any) => <Ic {...p} d={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M4.93 4.93l14.14 14.14"]} />,
    UserChk: (p: any) => <Ic {...p} d={["M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0", "M17 11l2 2 4-4"]} />,
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
            <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,248,231,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", marginTop: 1 }}>Admin</div>
        </div>
    </div>
);

/* ── Status / Role Badge ── */
const Badge = ({ type, label }: { type: string; label: string }) => {
    const s = CLR[type] || { c: "rgba(255,248,231,0.5)", bg: "rgba(255,255,255,0.06)", b: "rgba(255,248,231,0.1)" };
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

/* ── Glass card ── */
const Card = ({ children, style = {} }: any) => (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,248,231,0.07)", borderRadius: 20, ...style }}>
        {children}
    </div>
);

/* ── Section header inside card ── */
const CardHead = ({ title, sub, action }: any) => (
    <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 24px", borderBottom: "1px solid rgba(255,248,231,0.06)"
    }}>
        <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: CR, fontFamily: "'Fraunces',serif", letterSpacing: "-0.01em" }}>{title}</p>
            {sub && <p style={{ fontSize: 11, color: "rgba(255,248,231,0.3)", marginTop: 2 }}>{sub}</p>}
        </div>
        {action}
    </div>
);

/* ── KPI stat tile ── */
const KpiTile = ({ label, value, sub, accent, icon: Icon, trend }: any) => (
    <div style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
        border: "1px solid rgba(255,248,231,0.07)",
        borderRadius: 22, padding: "22px 24px", position: "relative", overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
    }}>
        <div style={{
            position: "absolute", top: 0, left: 0, width: 4, height: "100%",
            background: accent, borderRadius: "22px 0 0 22px", opacity: 0.6
        }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <p style={{
                fontSize: 10, fontWeight: 700, color: "rgba(255,248,231,0.35)",
                letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace"
            }}>{label}</p>
            <div style={{
                width: 32, height: 32, borderRadius: 10, background: `${accent}12`,
                border: `1px solid ${accent}20`, display: "flex", alignItems: "center", justifyContent: "center"
            }}>
                <Icon size={16} stroke={accent} />
            </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
            <p style={{
                fontFamily: "'Fraunces',serif", fontSize: 36, fontWeight: 800, color: CR,
                lineHeight: 1, letterSpacing: "-0.04em"
            }}>{value}</p>
            {trend && <span style={{
                fontSize: 11, fontWeight: 700, color: "#4ADE80",
                background: "rgba(74,222,128,0.08)", borderRadius: 100, padding: "2px 8px",
                fontFamily: "'DM Mono',monospace"
            }}>{trend}</span>}
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,248,231,0.3)", lineHeight: 1.4, fontWeight: 400 }}>{sub}</p>
    </div>
);

/* ── Sparkline ── */
const Spark = ({ vals = [1, 1, 1, 1, 1, 1, 1], color = AM }) => {
    const max = Math.max(...vals, 1);
    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 32 }}>
            {vals.map((v, i) => (
                <div key={i} style={{
                    flex: 1, borderRadius: 3, transition: "height .3s",
                    background: i === vals.length - 1 ? color : `${color}35`,
                    height: `${Math.max(10, Math.round((v / max) * 100))}%`
                }} />
            ))}
        </div>
    );
};

/* ── Funnel bar ── */
const FunnelBar = ({ label, value, total, color }: any) => {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: "rgba(255,248,231,0.45)" }}>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: CR, fontFamily: "'DM Mono',monospace" }}>
                    {value} <span style={{ color: "rgba(255,248,231,0.3)", fontWeight: 400 }}>({pct}%)</span>
                </span>
            </div>
            <div style={{ height: 5, background: "rgba(255,248,231,0.06)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                    height: "100%", width: `${pct}%`,
                    background: `linear-gradient(90deg,${color}70,${color})`,
                    borderRadius: 3, transition: "width .8s cubic-bezier(.4,0,.2,1)"
                }} />
            </div>
        </div>
    );
};

/* ── Responsive Table / Card Switcher ── */
const TableWrap = ({ children }: any) => (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }} className="hide-scrollbar">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 650 }}>{children}</table>
    </div>
);
const Th = ({ children, right }: any) => (
    <th style={{
        padding: "11px 16px", textAlign: right ? "right" : "left", fontSize: 9, fontWeight: 700,
        color: "rgba(255,248,231,0.3)", textTransform: "uppercase", letterSpacing: "0.12em",
        fontFamily: "'DM Mono',monospace", background: "rgba(255,255,255,0.02)",
        borderBottom: "1px solid rgba(255,248,231,0.06)", whiteSpace: "nowrap"
    }}>
        {children}
    </th>
);
const Td = ({ children, mono, right, muted, style = {} }: any) => (
    <td style={{
        padding: "12px 16px", textAlign: right ? "right" : "left",
        fontSize: mono ? 11 : 13, fontFamily: mono ? "'DM Mono',monospace" : "inherit",
        color: muted ? "rgba(255,248,231,0.35)" : "rgba(255,248,231,0.8)",
        borderBottom: "1px solid rgba(255,248,231,0.04)", ...style
    }}>
        {children}
    </td>
);

/* ── Avatar initial ── */
const Avatar = ({ name, color = "#60A5FA" }: { name: string; color?: string }) => (
    <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        background: `${color}18`, border: `1px solid ${color}28`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700, color
    }}>
        {(name || "?")[0].toUpperCase()}
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
                borderRadius: 12, fontSize: 12, color: CR, outline: "none", fontFamily: "inherit", caretColor: AM,
                transition: "border-color .2s"
            }}
            onFocus={(e: any) => e.target.style.borderColor = "rgba(232,147,58,0.4)"}
            onBlur={(e: any) => e.target.style.borderColor = "rgba(255,248,231,0.09)"} />
    </div>
);

/* ── Tab bar ── */
const TabBar = ({ tabs, active, onChange }: any) => (
    <div style={{
        display: "flex", gap: 2, overflowX: "auto", borderBottom: "1px solid rgba(255,248,231,0.07)",
        paddingBottom: 0, flexShrink: 0
    }}>
        {tabs.map((t: any) => (
            <button key={t.value} onClick={() => onChange(t.value)}
                style={{
                    padding: "10px 16px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
                    background: "none", border: "none", borderBottom: active === t.value
                        ? `2px solid ${AM}` : "2px solid transparent",
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

/* ── Empty state ── */
const Empty = ({ icon: Icon, text }: any) => (
    <div style={{
        padding: "56px 24px", display: "flex", flexDirection: "column",
        alignItems: "center", gap: 12, textAlign: "center"
    }}>
        <div style={{
            width: 48, height: 48, borderRadius: 16, background: "rgba(255,255,255,0.04)",
            display: "flex", alignItems: "center", justifyContent: "center"
        }}>
            <Icon size={22} stroke="rgba(255,248,231,0.2)" />
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,248,231,0.25)" }}>{text}</p>
    </div>
);

interface AdminDashboardClientProps {
    initialStats: PlatformStats;
    initialRequests: AdminRequest[];
    initialAgencies: AdminAgency[];
    initialUsers: AdminUser[];
    initialLogs: AuditLogEntry[];
    adminProfile: { full_name: string; email: string };
}

export function AdminDashboardClient({
    initialStats, initialRequests, initialAgencies, initialUsers, initialLogs, adminProfile
}: AdminDashboardClientProps) {
    const [view, setView] = useState("overview");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [agencies, setAgencies] = useState(initialAgencies);
    const [requests, setRequests] = useState(initialRequests);
    const [users, setUsers] = useState(initialUsers);
    const [logs, setLogs] = useState(initialLogs);
    const [stats, setStats] = useState(initialStats);

    const [qUsers, setQUsers] = useState("");
    const [qAgencies, setQAgencies] = useState("");
    const [qRequests, setQRequests] = useState("");

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    /* ── VIEW HANDLERS ── */
    async function handleApproveAgency(id: string) {
        const res = await approveAgency(id);
        if (!res.error) setAgencies(prev => prev.map(a => a.id === id ? { ...a, is_approved: true } : a));
    }

    async function handleToggleSuspend(id: string, currentlySuspended: boolean) {
        const res = await suspendUser(id, !currentlySuspended);
        if (!res.error) setUsers(prev => prev.map(u => u.id === id ? { ...u, is_suspended: !currentlySuspended } : u));
    }

    async function handleDeleteUser(id: string) {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        const res = await deleteUserAccount(id);
        if (!res.error) setUsers(prev => prev.filter(u => u.id !== id));
    }

    /* ── SUB-VIEWS ── */

    const Overview = () => {
        const agencyStaff = stats.totalUsers - stats.totalPatients;
        const completionRate = stats.totalRequests > 0 ? Math.round((stats.completedRequests / stats.totalRequests) * 100) : 0;

        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {stats.pendingAgencyApprovals > 0 && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "12px 18px",
                        background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)",
                        borderRadius: 16, cursor: "pointer"
                    }} onClick={() => setView("agencies")}>
                        <I.Alert size={16} stroke="#FBBF24" />
                        <p style={{ fontSize: 13, color: "#FBBF24", fontWeight: 600, flex: 1 }}>
                            {stats.pendingAgencyApprovals} agencies awaiting review — click to resolve
                        </p>
                        <I.ChevR size={14} stroke="#FBBF24" />
                    </div>
                )}

                <div>
                    <p style={{
                        fontSize: 10, fontWeight: 600, color: "rgba(255,248,231,0.3)",
                        letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace",
                        marginBottom: 10
                    }}>Platform Overview</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }} className="kpi-grid">
                        <KpiTile label="Total Users" value={stats.totalUsers} sub={`${stats.totalPatients} patients · ${agencyStaff} staff`} accent="#60A5FA" icon={I.Users} trend="+12%" />
                        <KpiTile label="Active Agencies" value={stats.totalAgencies} sub={`${stats.pendingAgencyApprovals} pending approval`} accent="#4ADE80" icon={I.Agency} />
                        <KpiTile label="Switch Requests" value={stats.totalRequests} sub={`${stats.requestsThisMonth} this month`} accent="#A78BFA" icon={I.Requests} trend="+8%" />
                        <KpiTile label="Completed" value={stats.completedRequests} sub={`${completionRate}% completion rate`} accent={AM} icon={I.Check} trend={`${completionRate}%`} />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="chart-grid">
                    <Card style={{ padding: "18px 20px" }}>
                        <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,248,231,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>Requests / mo</p>
                        <p style={{ fontFamily: "'Fraunces',serif", fontSize: 30, fontWeight: 800, color: CR, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 12 }}>{stats.requestsThisMonth}</p>
                        <Spark vals={[4, 6, 3, 8, 5, 7, stats.requestsThisMonth]} color="#A78BFA" />
                    </Card>
                    <Card style={{ padding: "18px 20px" }}>
                        <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,248,231,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>Total users</p>
                        <p style={{ fontFamily: "'Fraunces',serif", fontSize: 30, fontWeight: 800, color: CR, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 12 }}>{stats.totalUsers}</p>
                        <Spark vals={[stats.totalUsers - 15, stats.totalUsers - 10, stats.totalUsers - 8, stats.totalUsers]} color="#60A5FA" />
                    </Card>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <Card style={{ flex: 1, padding: "14px 16px" }}>
                            <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,248,231,0.3)", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", marginBottom: 3 }}>Active Cases</p>
                            <p style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 800, color: CR, letterSpacing: "-0.02em" }}>{stats.activeRequests}</p>
                        </Card>
                        <Card style={{ flex: 1, padding: "14px 16px" }}>
                            <p style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,248,231,0.3)", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", marginBottom: 3 }}>Avg Response</p>
                            <p style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 800, color: CR, letterSpacing: "-0.02em" }}>{stats.avgResponseHours || "—"}h</p>
                        </Card>
                    </div>
                    <Card style={{ padding: "18px 20px" }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: CR, fontFamily: "'Fraunces',serif", marginBottom: 16 }}>Funnel</p>
                        <FunnelBar label="Active" value={stats.activeRequests} total={stats.totalRequests} color={AM} />
                        <FunnelBar label="Completed" value={stats.completedRequests} total={stats.totalRequests} color="#4ADE80" />
                    </Card>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="panel-grid">
                    <Card>
                        <CardHead title="Pending Agencies" action={<button onClick={() => setView("agencies")} style={{ color: AM, fontSize: 11, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>View all</button>} />
                        {agencies.filter(a => !a.is_approved).slice(0, 5).map(a => (
                            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 22px", borderBottom: "1px solid rgba(255,248,231,0.05)" }}>
                                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${AM}15`, border: `1px solid ${AM}25`, display: "flex", alignItems: "center", justifyContent: "center" }}><I.Agency size={14} stroke={AM} /></div>
                                <div style={{ flex: 1 }}><p style={{ fontSize: 13, fontWeight: 600, color: CR }}>{a.name}</p><p style={{ fontSize: 11, color: "rgba(255,248,231,0.3)" }}>{a.address_city}, PA</p></div>
                                <Badge type="pending" label="Pending" />
                            </div>
                        ))}
                    </Card>
                    <Card>
                        <CardHead title="Recent Requests" action={<button onClick={() => setView("requests")} style={{ color: AM, fontSize: 11, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>View all</button>} />
                        {requests.slice(0, 5).map(r => (
                            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 22px", borderBottom: "1px solid rgba(255,248,231,0.05)" }}>
                                <Avatar name={r.patient_name || "?"} />
                                <div style={{ flex: 1, minWidth: 0 }}><p style={{ fontSize: 13, fontWeight: 600, color: CR, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.patient_name}</p><p style={{ fontSize: 11, color: "rgba(255,248,231,0.3)" }}>{r.agency_name}</p></div>
                                <Badge type={r.status} label={r.status.replace("_", " ")} />
                            </div>
                        ))}
                    </Card>
                </div>
            </div>
        );
    };

    const Requests = () => {
        const [tab, setTab] = useState("all");
        const filtered = requests.filter(r => tab === "all" || r.status === tab).filter(r => !qRequests || r.patient_name?.toLowerCase().includes(qRequests.toLowerCase()) || r.agency_name?.toLowerCase().includes(qRequests.toLowerCase()));
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 800, color: CR }}>Requests</h2>
                    <div style={{ width: 240 }}><SearchInput value={qRequests} onChange={setQRequests} placeholder="Search patient or agency…" /></div>
                </div>
                <Card>
                    <div style={{ padding: "0 22px" }}><TabBar tabs={[{ v: "all", l: "All" }, { v: "submitted", l: "New" }, { v: "under_review", l: "Reviewing" }, { v: "accepted", l: "Accepted" }, { v: "completed", l: "Done" }].map(t => ({ value: t.v, label: t.l }))} active={tab} onChange={setTab} /></div>

                    {/* Desktop View */}
                    <div className="desktop-view">
                        <TableWrap>
                            <thead><tr><Th>Patient</Th><Th>Agency</Th><Th>Care</Th><Th>Status</Th><Th right>Actions</Th></tr></thead>
                            <tbody>
                                {filtered.map(r => (
                                    <tr key={r.id}>
                                        <Td><p style={{ fontWeight: 600 }}>{r.patient_name}</p><p style={{ fontSize: 10, color: "rgba(255,248,231,0.3)" }}>{r.payer_type}</p></Td>
                                        <Td muted>{r.agency_name}</Td>
                                        <Td muted>{r.care_type}</Td>
                                        <Td><Badge type={r.status} label={r.status} /></Td>
                                        <Td right><Link href={`/admin/requests/${r.id}`} style={{ color: AM, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>View</Link></Td>
                                    </tr>
                                ))}
                            </tbody>
                        </TableWrap>
                    </div>

                    {/* Mobile View */}
                    <div className="mobile-view" style={{ display: "none" }}>
                        {filtered.length === 0 ? <Empty icon={I.Requests} text="No matching requests" /> : filtered.map(r => (
                            <div key={r.id} style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,248,231,0.06)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                        <Avatar name={r.patient_name || "?"} />
                                        <div><p style={{ fontSize: 14, fontWeight: 700, color: CR }}>{r.patient_name}</p><p style={{ fontSize: 11, color: "rgba(255,248,231,0.35)" }}>{r.payer_type?.replace(/_/g, " ")}</p></div>
                                    </div>
                                    <Badge type={r.status} label={r.status.replace("_", " ")} />
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div><p style={{ fontSize: 10, color: "rgba(255,248,231,0.3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Agency</p><p style={{ fontSize: 12, color: "rgba(255,248,231,0.6)" }}>{r.agency_name}</p></div>
                                    <Link href={`/admin/requests/${r.id}`} style={{ background: "rgba(232,147,58,0.1)", color: AM, padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700, textDecoration: "none" }}>Manage</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        );
    };

    const Agencies = () => {
        const [tab, setTab] = useState("all");
        const filtered = agencies.filter(a => tab === "all" || (tab === "pending" && !a.is_approved) || (tab === "approved" && a.is_approved)).filter(a => !qAgencies || a.name.toLowerCase().includes(qAgencies.toLowerCase()));
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 800, color: CR }}>Agencies</h2>
                    <div style={{ width: 240 }}><SearchInput value={qAgencies} onChange={setQAgencies} placeholder="Search agency…" /></div>
                </div>
                <Card>
                    <div style={{ padding: "0 22px" }}><TabBar tabs={[{ value: "all", label: "All" }, { value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }]} active={tab} onChange={setTab} /></div>

                    {/* Desktop */}
                    <div className="desktop-view">
                        <TableWrap>
                            <thead><tr><Th>Agency</Th><Th>NPI</Th><Th>Status</Th><Th right>Actions</Th></tr></thead>
                            <tbody>
                                {filtered.map(a => (
                                    <tr key={a.id}>
                                        <Td><p style={{ fontWeight: 600 }}>{a.name}</p><p style={{ fontSize: 11, color: "rgba(255,248,231,0.3)" }}>{a.address_city}, PA</p></Td>
                                        <Td mono muted>{a.npi}</Td>
                                        <Td><Badge type={a.is_approved ? "approved" : "pending"} label={a.is_approved ? "Approved" : "Pending"} /></Td>
                                        <Td right>
                                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                                <Link href={`/admin/agencies/${a.id}`} style={{ color: CR, opacity: 0.5, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Details</Link>
                                                {!a.is_approved && <button onClick={() => handleApproveAgency(a.id)} style={{ background: AM, color: FD, border: "none", borderRadius: 8, padding: "4px 10px", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Approve</button>}
                                            </div>
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </TableWrap>
                    </div>

                    {/* Mobile */}
                    <div className="mobile-view" style={{ display: "none" }}>
                        {filtered.length === 0 ? <Empty icon={I.Agency} text="No agencies found" /> : filtered.map(a => (
                            <div key={a.id} style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,248,231,0.06)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                    <div><p style={{ fontSize: 15, fontWeight: 700, color: CR }}>{a.name}</p><p style={{ fontSize: 11, color: "rgba(255,248,231,0.35)" }}>{a.address_city}, PA</p></div>
                                    <Badge type={a.is_approved ? "approved" : "pending"} label={a.is_approved ? "Live" : "Review"} />
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <p style={{ fontSize: 11, color: "rgba(255,248,231,0.3)", fontFamily: "'DM Mono',monospace" }}>NPI: {a.npi}</p>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <Link href={`/admin/agencies/${a.id}`} style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,248,231,0.5)", textDecoration: "none" }}>View</Link>
                                        {!a.is_approved && <button onClick={() => handleApproveAgency(a.id)} style={{ background: AM, color: FD, border: "none", borderRadius: 8, padding: "4px 12px", fontSize: 11, fontWeight: 700 }}>Approve</button>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        );
    };

    const Users = () => {
        const [tab, setTab] = useState("all");
        const filtered = users.filter(u => tab === "all" || u.role === tab).filter(u => !qUsers || u.full_name?.toLowerCase().includes(qUsers.toLowerCase()) || u.email?.toLowerCase().includes(qUsers.toLowerCase()));
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 800, color: CR }}>Users</h2>
                    <div style={{ width: 240 }}><SearchInput value={qUsers} onChange={setQUsers} placeholder="Search name or email…" /></div>
                </div>
                <Card>
                    <div style={{ padding: "0 22px" }}><TabBar tabs={[{ v: "all", l: "All" }, { v: "patient", l: "Patients" }, { v: "agency_admin", l: "Ag. Admins" }, { v: "switchmycare_admin", l: "System" }].map(t => ({ value: t.v, label: t.l }))} active={tab} onChange={setTab} /></div>

                    {/* Desktop */}
                    <div className="desktop-view">
                        <TableWrap>
                            <thead><tr><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th right>Actions</Th></tr></thead>
                            <tbody>
                                {filtered.map(u => (
                                    <tr key={u.id}>
                                        <Td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={u.full_name || "?"} />{u.full_name}</div></Td>
                                        <Td muted>{u.email}</Td>
                                        <Td><Badge type={u.role} label={u.role.replace("_", " ")} /></Td>
                                        <Td right>
                                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                                <button onClick={() => handleToggleSuspend(u.id, u.is_suspended || false)} style={{ background: "none", border: "none", cursor: "pointer" }}>{u.is_suspended ? <I.UserChk size={16} stroke="#4ADE80" /> : <I.Ban size={16} stroke="#FBBF24" />}</button>
                                                <button onClick={() => handleDeleteUser(u.id)} style={{ background: "none", border: "none", cursor: "pointer" }}><I.X size={16} stroke="#F87171" /></button>
                                            </div>
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </TableWrap>
                    </div>

                    {/* Mobile */}
                    <div className="mobile-view" style={{ display: "none" }}>
                        {filtered.length === 0 ? <Empty icon={I.Users} text="No users found" /> : filtered.map(u => (
                            <div key={u.id} style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,248,231,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <Avatar name={u.full_name || "?"} />
                                    <div><p style={{ fontSize: 13, fontWeight: 700, color: CR }}>{u.full_name}</p><p style={{ fontSize: 11, color: "rgba(255,248,231,0.3)" }}>{u.role.replace("_", " ")}</p></div>
                                </div>
                                <div style={{ display: "flex", gap: 12 }}>
                                    <button onClick={() => handleToggleSuspend(u.id, u.is_suspended || false)} style={{ background: "none", border: "none" }}>{u.is_suspended ? <I.UserChk size={18} stroke="#4ADE80" /> : <I.Ban size={18} stroke="#FBBF24" />}</button>
                                    <button onClick={() => handleDeleteUser(u.id)} style={{ background: "none", border: "none" }}><I.X size={18} stroke="#F87171" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        );
    };

    const Audit = () => {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 800, color: CR }}>Audit trail</h2>
                <Card>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {logs.length === 0 ? <Empty icon={I.Audit} text="No audit logs available" /> : logs.map((log, i) => (
                            <div key={log.id} style={{ padding: "20px 22px", borderBottom: i < logs.length - 1 ? "1px solid rgba(255,248,231,0.05)" : "none", display: "flex", gap: 16 }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,248,231,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}><I.Activity size={14} stroke={AM} /></div>
                                    {i < logs.length - 1 && <div style={{ width: 1, flex: 1, background: "rgba(255,248,231,0.06)" }} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                                        <p style={{ fontSize: 14, fontWeight: 700, color: CR }}>{log.action.replace(/_/g, " ").toUpperCase()}</p>
                                        <Badge type={log.action.includes("approve") ? "approved" : "pending"} label={(log.actor_role || "system").split("_")[0]} />
                                    </div>
                                    <p style={{ fontSize: 13, color: "rgba(255,248,231,0.55)", marginBottom: 8 }}>Modified <span style={{ color: AM, fontWeight: 600 }}>{log.resource}</span> (#{(log.resource_id || "").slice(0, 8)}...)</p>
                                    <div style={{ fontSize: 11, color: "rgba(255,248,231,0.3)", fontFamily: "'DM Mono',monospace" }}>{new Date(log.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        );
    };

    const Settings = () => (
        <div style={{ maxWidth: 500, display: "flex", flexDirection: "column", gap: 18 }}>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 800, color: CR }}>Settings</h2>
            <Card><CardHead title="Platform Config" /><div style={{ padding: "12px 22px" }}><p style={{ fontSize: 13, color: "rgba(255,248,231,0.5)" }}>SwitchMyCare v1.0.4 - Admin Portal</p></div></Card>
            <Card><CardHead title="Security" /><div style={{ padding: "12px 22px" }}><button style={{ background: AM, border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13 }}>Rotate API Tokens</button></div></Card>
        </div>
    );

    const VIEWS: Record<string, any> = {
        overview: <Overview />, requests: <Requests />, agencies: <Agencies />,
        users: <Users />, audit: <Audit />, settings: <Settings />
    };

    const CORE_NAV = [
        { id: "overview", label: "Overview", icon: I.Home, badge: null },
        { id: "requests", label: "Requests", icon: I.Requests, badge: stats.activeRequests },
        { id: "agencies", label: "Agencies", icon: I.Agency, badge: stats.pendingAgencyApprovals },
        { id: "users", label: "Users", icon: I.Users, badge: null },
        { id: "audit", label: "Logs", icon: I.Audit, badge: null },
    ];

    const UTIL_NAV = [
        { id: "settings", label: "Settings", icon: I.Settings, badge: null },
    ];

    return (
        <div style={{ minHeight: "100vh", display: "flex", background: FD, fontFamily: "'DM Sans',sans-serif", color: CR }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;0,900;1,700;1,800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .page-in{animation:fu .35s ease both}
        .live-dot{animation:pulse-dot 2s ease-in-out infinite}
        @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.35}}
          .desktop-view{display:block}
          .mobile-view{display:none}
          .desktop-sidebar{display:none!important}
          .desktop-topbar{display:none!important}
          .mobile-header{display:flex!important}
          .bottom-nav{display:flex!important}
          .main-pad{padding:96px 20px 120px!important}
          .desktop-view{display:none!important}
          .mobile-view{display:block!important}
        }
        .hide-scrollbar::-webkit-scrollbar{display:none}
        .hide-scrollbar{scrollbar-width:none}
        @media(min-width:1024px){
          .mobile-header{display:none!important}
          .bottom-nav{display:none!important}
          .mobile-overlay{display:none!important}
        }
        @media(max-width:1200px){
          .kpi-grid{grid-template-columns:repeat(2,1fr)!important}
          .chart-grid{grid-template-columns:1fr 1fr!important}
          .panel-grid, .summary-grid{grid-template-columns:1fr!important}
        }
        @media(max-width:640px){
          .kpi-grid{grid-template-columns:1fr!important}
          .chart-grid{grid-template-columns:1fr!important}
        }
      `}</style>

            {/* DESKTOP SIDEBAR */}
            <aside className="desktop-sidebar" style={{ width: 220, flexShrink: 0, height: "100vh", position: "sticky", top: 0, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,248,231,0.06)" }}>
                <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,248,231,0.06)" }}><Logo /></div>
                <nav style={{ flex: 1, padding: "10px 10px" }}>
                    {[...CORE_NAV, ...UTIL_NAV].map(item => (
                        <button key={item.id} onClick={() => setView(item.id)}
                            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all .15s", marginBottom: 2, position: "relative", background: view === item.id ? "rgba(255,255,255,0.07)" : "transparent", color: view === item.id ? CR : "rgba(255,248,231,0.45)" }}>
                            {view === item.id && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, background: AM, borderRadius: "0 3px 3px 0" }} />}
                            <item.icon size={16} stroke="currentColor" />
                            <span style={{ fontSize: 13, fontWeight: view === item.id ? 600 : 400 }}>{item.label}</span>
                            {item.badge ? <span style={{ marginLeft: "auto", background: AM, color: FD, fontSize: 10, fontWeight: 700, borderRadius: 100, padding: "0 5px" }}>{item.badge}</span> : null}
                        </button>
                    ))}
                </nav>
                <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,248,231,0.06)" }}>
                    <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,248,231,0.07)", display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={adminProfile.full_name} color="#F87171" />
                        <div style={{ minWidth: 0 }}><p style={{ fontSize: 12, fontWeight: 700, color: CR, overflow: "hidden", textOverflow: "ellipsis" }}>{adminProfile.full_name}</p><p style={{ fontSize: 10, color: "rgba(255,248,231,0.3)" }}>Admin</p></div>
                    </div>
                </div>
            </aside>

            {/* MOBILE HEADER */}
            <header className="mobile-header" style={{ display: "none", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#0F2419ec", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,248,231,0.06)", height: 60, alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
                <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none" }}><I.Menu size={20} stroke={CR} /></button>
                <Logo />
                <Avatar name={adminProfile.full_name} color="#F87171" />
            </header>

            {/* MOBILE DRAWER */}
            {sidebarOpen && (
                <>
                    <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
                    <aside style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 280, zIndex: 201, background: FD, borderRight: "1px solid rgba(255,248,231,0.08)", transition: "transform .3s ease", transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", display: "flex", flexDirection: "column" }}>
                        <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,248,231,0.06)" }}><Logo /><button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none" }}><I.X size={20} stroke={CR} /></button></div>
                        <div style={{ padding: "24px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                                <Avatar name={adminProfile.full_name} color="#F87171" />
                                <div><p style={{ fontSize: 15, fontWeight: 700, color: CR }}>{adminProfile.full_name}</p><p style={{ fontSize: 12, color: "rgba(255,248,231,0.4)" }}>{adminProfile.email}</p></div>
                            </div>
                        </div>
                        <nav style={{ padding: "10px", flex: 1 }}>
                            {UTIL_NAV.map(item => (
                                <button key={item.id} onClick={() => { setView(item.id); setSidebarOpen(false) }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, border: "none", background: view === item.id ? "rgba(255,255,255,0.08)" : "none", color: view === item.id ? AM : CR, fontSize: 15, fontWeight: view === item.id ? 700 : 400, marginBottom: 4 }}>
                                    <item.icon size={18} stroke="currentColor" />{item.label}
                                </button>
                            ))}
                            <Link href="/agencies" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, color: "rgba(255,248,231,0.6)", fontSize: 15, textDecoration: "none" }}>
                                <I.Globe size={18} stroke="currentColor" /> Patient Site
                            </Link>
                        </nav>
                        <div style={{ padding: "20px", borderTop: "1px solid rgba(255,248,231,0.06)" }}>
                            <Link href="/api/auth/signout" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "12px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 12, color: "#F87171", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Sign Out</Link>
                        </div>
                    </aside>
                </>
            )}

            {/* MAIN CONTENT */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                <header className="desktop-topbar" style={{ height: 64, padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,248,231,0.08)", background: "rgba(15,36,25,0.85)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 50, marginBottom: 4 }}>
                    <div>
                        <h1 style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Fraunces',serif", textTransform: "capitalize", color: CR, lineHeight: 1 }}>{view}</h1>
                        <p style={{ fontSize: 10, color: "rgba(255,248,231,0.3)", fontFamily: "'DM Mono',monospace", marginTop: 2 }}>{dateStr}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#4ADE80", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 100, padding: "4px 14px", display: "flex", alignItems: "center", gap: 7 }}>
                            <span className="live-dot" style={{ width: 6, height: 6, background: "#4ADE80", borderRadius: "50%" }} />
                            LIVE MONITOR
                        </div>
                        <div style={{ width: 1, height: 20, background: "rgba(255,248,231,0.1)" }} />
                        <I.Bell size={19} stroke="rgba(255,248,231,0.45)" style={{ cursor: "pointer" }} />
                    </div>
                </header>

                <main className="main-pad page-in" style={{ padding: "60px 48px", flex: 1, overflowY: "auto" }}>
                    {VIEWS[view]}
                </main>
            </div>

            {/* MOBILE BOTTOM NAV */}
            <nav className="bottom-nav" style={{ display: "none", position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, height: 70, background: "#0F2419ec", borderTop: "1px solid rgba(255,248,231,0.1)", backdropFilter: "blur(20px)", alignItems: "center", justifyContent: "space-around" }}>
                {CORE_NAV.map(item => (
                    <button key={item.id} onClick={() => setView(item.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", color: view === item.id ? AM : "rgba(255,248,231,0.4)" }}>
                        <item.icon size={22} stroke="currentColor" />
                        <span style={{ fontSize: 10, fontWeight: 700 }}>{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}
