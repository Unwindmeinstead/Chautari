"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword, updatePassword } from "@/lib/auth";

/* ── Design tokens ── */
const F = "#1A3D2B"; // forest
const CR = "#FFF8E7"; // cream
const AM = "#E8933A"; // amber
const FM = "#2A5C41"; // forest mid

/* ── SVG Icons ── */
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.5 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p: string, i: number) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const Mail = ({ size = 18, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d={["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"]} />;
const Lock = ({ size = 18, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d={["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z", "M7 11V7a5 5 0 0 1 10 0v4"]} />;
const Eye = ({ size = 16, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"]} />;
const EyeOff = ({ size = 16, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d={["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94", "M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19", "M1 1l22 22"]} />;
const ArrowR = ({ size = 16, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d="M5 12h14M12 5l7 7-7 7" />;
const ArrowL = ({ size = 16, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d="M19 12H5M12 19l-7-7 7-7" />;
const Check = ({ size = 24, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} strokeWidth={2.5} d="M20 6L9 17l-5-5" />;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const isReset = type === "recovery";

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [focusedField, setFocusedField] = React.useState<string | null>(null);

  async function handleRequestReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await resetPassword(formData);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSent(true);
    }
    setLoading(false);
  }

  async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);
    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="space-y-0 text-center fade-up">
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px" }}>
          <Check size={40} stroke="#4ADE80" />
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 800, color: CR, marginBottom: 16 }}>Check your email</h1>
        <p style={{ fontSize: 15, color: "rgba(255,248,231,0.55)", lineHeight: 1.7, marginBottom: 40 }}>
          We&apos;ve sent a password reset link to your inbox.
        </p>
        <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: F, border: `1px solid ${FM}`, borderRadius: 100, padding: "12px 32px", fontSize: 14, fontWeight: 600, color: CR, textDecoration: "none", transition: "all 0.2s" }}
          className="hover:translate-y-[-1px] hover:bg-[#2A5C41]">
          <ArrowL size={16} stroke={CR} /> Back to sign in
        </Link>
      </div>
    );
  }

  if (isReset) {
    return (
      <div className="space-y-0">
        <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: AM, marginBottom: 16, fontFamily: "'DM Mono', monospace" }}>
          <span style={{ width: 20, height: 1, background: AM }} /> Security setup
        </div>
        <h1 className="fade-up-d1" style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, lineHeight: 1.05, color: CR, marginBottom: 10 }}>Set new<br /><em style={{ fontStyle: "italic", color: AM }}>password.</em></h1>
        <p className="fade-up-d2" style={{ fontSize: 14, fontWeight: 300, color: "rgba(255,248,231,0.55)", lineHeight: 1.7, marginBottom: 32 }}>Choose a strong password for your account.</p>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#FCA5A5", marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,248,231,0.5)", marginBottom: 8 }}>New password</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: focusedField === "password" ? 0.8 : 0.35 }}>
                <Lock size={16} stroke={focusedField === "password" ? AM : CR} />
              </div>
              <input name="password" type={showPassword ? "text" : "password"} required placeholder="••••••••"
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                style={{ width: "100%", height: 48, paddingLeft: 44, paddingRight: 44, background: "rgba(255,255,255,0.04)", border: `1px solid ${focusedField === "password" ? "rgba(232,147,58,0.5)" : "rgba(255,248,231,0.1)"}`, borderRadius: 14, fontSize: 14, color: CR, outline: "none", fontFamily: "inherit" }} />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,248,231,0.35)" }}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{ width: "100%", height: 50, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: loading ? FM : F, border: `1px solid ${FM}`, borderRadius: 100, fontSize: 15, fontWeight: 600, color: CR, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", fontFamily: "inherit", boxShadow: "0 8px 24px rgba(26,61,43,0.4)", marginTop: 8 }}
            className="hover:translate-y-[-1px] hover:shadow-[0_12px_32px_rgba(26,61,43,0.5)]">
            {loading ? (
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid rgba(255,248,231,0.25)`, borderTopColor: CR, animation: "spin 0.7s linear infinite" }} />
            ) : (
              <><span>Update password</span><ArrowR size={15} stroke={CR} /></>
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: AM, marginBottom: 16, fontFamily: "'DM Mono', monospace" }}>
        <span style={{ width: 20, height: 1, background: AM }} /> Troubleshooting
      </div>

      <div className="fade-up-d1">
        <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,248,231,0.45)", textDecoration: "none", marginBottom: 24, transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = AM}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,248,231,0.45)"}>
          <ArrowL size={14} stroke="currentColor" /> Back to sign in
        </Link>
      </div>

      <h1 className="fade-up-d2" style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, lineHeight: 1.05, color: CR, marginBottom: 10 }}>Reset your<br /><em style={{ fontStyle: "italic", color: AM }}>password.</em></h1>
      <p className="fade-up-d3" style={{ fontSize: 14, fontWeight: 300, color: "rgba(255,248,231,0.55)", lineHeight: 1.7, marginBottom: 32 }}>
        Enter your email and we&apos;ll send a link to get back into your account.
      </p>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#FCA5A5", marginBottom: 20 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleRequestReset} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,248,231,0.5)", marginBottom: 8 }}>Email address</label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: focusedField === "email" ? 0.8 : 0.35 }}>
              <Mail size={16} stroke={focusedField === "email" ? AM : CR} />
            </div>
            <input name="email" type="email" required placeholder="you@example.com"
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              style={{ width: "100%", height: 48, paddingLeft: 44, paddingRight: 16, background: "rgba(255,255,255,0.04)", border: `1px solid ${focusedField === "email" ? "rgba(232,147,58,0.5)" : "rgba(255,248,231,0.1)"}`, borderRadius: 14, fontSize: 14, color: CR, outline: "none", fontFamily: "inherit" }} />
          </div>
        </div>

        <button type="submit" disabled={loading}
          style={{ width: "100%", height: 50, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: loading ? FM : F, border: `1px solid ${FM}`, borderRadius: 100, fontSize: 15, fontWeight: 600, color: CR, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", fontFamily: "inherit", boxShadow: "0 8px 24px rgba(26,61,43,0.4)", marginTop: 8 }}
          className="hover:translate-y-[-1px] hover:shadow-[0_12px_32px_rgba(26,61,43,0.5)]">
          {loading ? (
            <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid rgba(255,248,231,0.25)`, borderTopColor: CR, animation: "spin 0.7s linear infinite" }} />
          ) : (
            <><span>Send reset link</span><ArrowR size={15} stroke={CR} /></>
          )}
        </button>
      </form>
    </div>
  );
}
