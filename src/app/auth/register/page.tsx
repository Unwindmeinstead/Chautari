"use client";

import * as React from "react";
import Link from "next/link";
import { signUpWithEmail } from "@/lib/auth";

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
const User = ({ size = 18, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d={["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"]} />;
const Mail = ({ size = 18, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d={["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"]} />;
const Lock = ({ size = 18, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d={["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z", "M7 11V7a5 5 0 0 1 10 0v4"]} />;
const Phone = ({ size = 18, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l1.06-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />;
const Eye = ({ size = 16, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"]} />;
const EyeOff = ({ size = 16, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d={["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94", "M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19", "M1 1l22 22"]} />;
const ArrowR = ({ size = 16, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d="M5 12h14M12 5l7 7-7 7" />;
const Shield = ({ size = 14, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d={["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"]} />;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  /* Focus states */
  const [focusedField, setFocusedField] = React.useState<string | null>(null);

  const passwordStrength = getPasswordStrength(password);

  async function clientAction(formData: FormData) {
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const result = await signUpWithEmail(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err: any) {
      if (err?.digest?.startsWith("NEXT_REDIRECT")) {
        return;
      }
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-0">
      {/* Eyebrow */}
      <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: AM, marginBottom: 16, fontFamily: "'DM Mono', monospace" }}>
        <span style={{ width: 20, height: 1, background: AM }} /> Join our platform
      </div>

      {/* Heading */}
      <h1 className="fade-up-d1" style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", color: CR, marginBottom: 10 }}>
        Start your care<br /><em style={{ fontStyle: "italic", color: AM }}>journey here.</em>
      </h1>
      <p className="fade-up-d2" style={{ fontSize: 14, fontWeight: 300, color: "rgba(255,248,231,0.55)", lineHeight: 1.7, marginBottom: 32 }}>
        Create a free account to find and switch home care agencies in Pennsylvania.
      </p>

      {/* HIPAA badge */}
      <div className="fade-up-d2" style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(26,61,43,0.3)", border: "1px solid rgba(255,248,231,0.08)", borderRadius: 12, padding: "10px 14px", marginBottom: 24 }}>
        <Shield size={14} stroke={AM} />
        <p style={{ fontSize: 12, color: "rgba(255,248,231,0.6)", fontWeight: 400 }}>
          Your data is strictly HIPAA-protected.
        </p>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#FCA5A5", marginBottom: 20 }}>
          {error}
        </div>
      )}

      <form action={clientAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Full Name */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,248,231,0.5)", marginBottom: 8 }}>Full name</label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: focusedField === "full_name" ? 0.8 : 0.35 }}>
              <User size={16} stroke={focusedField === "full_name" ? AM : CR} />
            </div>
            <input name="full_name" type="text" required placeholder="Jane Smith"
              onFocus={() => setFocusedField("full_name")}
              onBlur={() => setFocusedField(null)}
              style={{ width: "100%", height: 48, paddingLeft: 44, paddingRight: 16, background: "rgba(255,255,255,0.04)", border: `1px solid ${focusedField === "full_name" ? "rgba(232,147,58,0.5)" : "rgba(255,248,231,0.1)"}`, borderRadius: 14, fontSize: 14, color: CR, outline: "none", fontFamily: "inherit" }} />
          </div>
        </div>

        {/* Email */}
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

        {/* Phone */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,248,231,0.5)", marginBottom: 8 }}>Phone number <span style={{ opacity: 0.5 }}>(optional)</span></label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: focusedField === "phone" ? 0.8 : 0.35 }}>
              <Phone size={16} stroke={focusedField === "phone" ? AM : CR} />
            </div>
            <input name="phone" type="tel" placeholder="(555) 555-5555"
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField(null)}
              style={{ width: "100%", height: 48, paddingLeft: 44, paddingRight: 16, background: "rgba(255,255,255,0.04)", border: `1px solid ${focusedField === "phone" ? "rgba(232,147,58,0.5)" : "rgba(255,248,231,0.1)"}`, borderRadius: 14, fontSize: 14, color: CR, outline: "none", fontFamily: "inherit" }} />
          </div>
        </div>

        {/* Password */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,248,231,0.5)", marginBottom: 8 }}>Password</label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: focusedField === "password" ? 0.8 : 0.35 }}>
              <Lock size={16} stroke={focusedField === "password" ? AM : CR} />
            </div>
            <input name="password" type={showPassword ? "text" : "password"} required placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              style={{ width: "100%", height: 48, paddingLeft: 44, paddingRight: 44, background: "rgba(255,255,255,0.04)", border: `1px solid ${focusedField === "password" ? "rgba(232,147,58,0.5)" : "rgba(255,248,231,0.1)"}`, borderRadius: 14, fontSize: 14, color: CR, outline: "none", fontFamily: "inherit" }} />
            <button type="button" onClick={() => setShowPassword(v => !v)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,248,231,0.35)" }}>
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {password && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", gap: 3 }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ height: 3, flex: 1, borderRadius: 10, background: i <= passwordStrength.score ? passwordStrength.color : "rgba(255,255,255,0.05)" }} />
                ))}
              </div>
              <p style={{ fontSize: 11, color: passwordStrength.textColor, marginTop: 4, fontWeight: 600 }}>{passwordStrength.label}</p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,248,231,0.5)", marginBottom: 8 }}>Confirm password</label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: focusedField === "confirm" ? 0.8 : 0.35 }}>
              <Lock size={16} stroke={focusedField === "confirm" ? AM : CR} />
            </div>
            <input name="confirm_password" type={showConfirm ? "text" : "password"} required placeholder="••••••••"
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              onFocus={() => setFocusedField("confirm")}
              onBlur={() => setFocusedField(null)}
              style={{ width: "100%", height: 48, paddingLeft: 44, paddingRight: 44, background: "rgba(255,255,255,0.04)", border: `1px solid ${focusedField === "confirm" ? "rgba(232,147,58,0.5)" : "rgba(255,248,231,0.1)"}`, borderRadius: 14, fontSize: 14, color: CR, outline: "none", fontFamily: "inherit" }} />
            <button type="button" onClick={() => setShowConfirm(v => !v)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,248,231,0.35)" }}>
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <p style={{ fontSize: 12, color: "rgba(255,248,231,0.35)", lineHeight: 1.6, marginTop: 4 }}>
          By creating an account, you agree to our{" "}
          <Link href="/terms" style={{ color: CR, textDecoration: "underline" }}>Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" style={{ color: CR, textDecoration: "underline" }}>Privacy Policy</Link>.
        </p>

        {/* Submit */}
        <button type="submit" disabled={loading || (password !== confirm && confirm.length > 0)}
          style={{ width: "100%", height: 50, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: loading ? FM : F, border: `1px solid ${FM}`, borderRadius: 100, fontSize: 15, fontWeight: 600, color: CR, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", fontFamily: "inherit", boxShadow: "0 8px 24px rgba(26,61,43,0.4)", marginTop: 8 }}
          className="hover:translate-y-[-1px] hover:shadow-[0_12px_32px_rgba(26,61,43,0.5)]">
          {loading ? (
            <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid rgba(255,248,231,0.25)`, borderTopColor: CR, animation: "spin 0.7s linear infinite" }} />
          ) : (
            <><span>Create account</span><ArrowR size={15} stroke={CR} /></>
          )}
        </button>
      </form>

      {/* Footer link */}
      <p style={{ textAlign: "center", fontSize: 14, color: "rgba(255,248,231,0.4)", marginTop: 28 }}>
        Already have an account?{" "}
        <Link href="/auth/login" style={{ fontWeight: 600, color: CR, textDecoration: "none", borderBottom: `1px solid rgba(255,248,231,0.2)`, paddingBottom: 1, transition: "all 0.2s, border-color 0.2s" }}
          className="hover:text-[#E8933A] hover:border-[#E8933A]">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["#FCA5A5", "#FCD34D", "#FDE68A", "#4ADE80"];
  const textColors = ["#FCA5A5", "#FCD34D", "#FDE68A", "#4ADE80"];

  return {
    score,
    label: labels[score - 1] ?? "Too short",
    color: colors[score - 1] ?? "#FCA5A5",
    textColor: textColors[score - 1] ?? "#FCA5A5",
  };
}
