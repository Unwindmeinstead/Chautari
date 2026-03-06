"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "password" | "magic";

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
const Sparkle = ({ size = 14, stroke = "currentColor" }: any) => <Icon size={size} stroke={stroke} d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");
  const message = searchParams.get("message");

  const supabase = React.useMemo(() => createClient(), []);

  const [mode, setMode] = React.useState<AuthMode>("password");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [emailFocused, setEmailFocused] = React.useState(false);
  const [passFocused, setPassFocused] = React.useState(false);

  const completeClientRedirect = React.useCallback(() => {
    const destination = (redirectedFrom && redirectedFrom.startsWith("/") && !redirectedFrom.startsWith("/auth/"))
      ? redirectedFrom
      : "/dashboard";
    window.location.assign(destination);
  }, [redirectedFrom]);

  async function handlePasswordSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    completeClientRedirect();
  }

  async function handleMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    const safeNext = redirectedFrom && redirectedFrom.startsWith("/") && !redirectedFrom.startsWith("/auth/")
      ? redirectedFrom
      : "/dashboard";

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(safeNext)}`,
      },
    });

    if (otpError) {
      setError(otpError.message);
      setLoading(false);
      return;
    }

    setSuccess("Check your email for your secure sign-in link.");
    setLoading(false);
  }

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const safeNext = redirectedFrom && redirectedFrom.startsWith("/") && !redirectedFrom.startsWith("/auth/")
      ? redirectedFrom
      : "/dashboard";

    const { data, error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(safeNext)}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (googleError) {
      setError(googleError.message);
      setLoading(false);
      return;
    }

    if (data.url) {
      window.location.assign(data.url);
      return;
    }

    setLoading(false);
  }

  return (
    <div className="space-y-0">
      {/* Eyebrow */}
      <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: AM, marginBottom: 16, fontFamily: "'DM Mono', monospace" }}>
        <span style={{ width: 20, height: 1, background: AM }} /> Account access
      </div>

      {/* Heading */}
      <h1 className="fade-up-d1" style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", color: CR, marginBottom: 10 }}>
        Secure login,<br /><em style={{ fontStyle: "italic", color: AM }}>no dead ends.</em>
      </h1>
      <p className="fade-up-d2" style={{ fontSize: 14, fontWeight: 300, color: "rgba(255,248,231,0.55)", lineHeight: 1.7, marginBottom: 32 }}>
        Sign in with your password, magic link, or Google and continue exactly where you left off.
      </p>

      {/* Alerts */}
      {(error || message) && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#FCA5A5", marginBottom: 20 }}>
          {error || message}
        </div>
      )}
      {success && (
        <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#86EFAC", marginBottom: 20 }}>
          {success}
        </div>
      )}

      {/* Google button */}
      <div className="fade-up-d2">
        <button type="button" onClick={handleGoogle} disabled={loading}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,248,231,0.1)", borderRadius: 100, padding: "12px 20px", fontSize: 14, fontWeight: 500, color: CR, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit", marginBottom: 24, opacity: loading ? 0.7 : 1 }}
          className="hover:bg-[rgba(255,255,255,0.09)] hover:border-[rgba(255,248,231,0.2)]">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>
      </div>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,248,231,0.07)" }} />
        <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,248,231,0.3)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>or sign in with email</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,248,231,0.07)" }} />
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,248,231,0.07)", borderRadius: 14, padding: 4, marginBottom: 24 }}>
        {[["password", "Password"], ["magic", "Magic link"]].map(([m, label]) => (
          <button key={m} type="button" onClick={() => { setMode(m as AuthMode); setError(null); setSuccess(null); }}
            style={{ flex: 1, padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", fontFamily: "inherit", transition: "all 0.2s", background: mode === m ? F : "transparent", color: mode === m ? CR : "rgba(255,248,231,0.4)", boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.3)" : "none" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={mode === "password" ? handlePasswordSignIn : handleMagicLink} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Email */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,248,231,0.5)", marginBottom: 8, letterSpacing: "0.02em" }}>Email address</label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: emailFocused ? 0.8 : 0.35, transition: "opacity 0.2s" }}>
              <Mail size={16} stroke={emailFocused ? AM : CR} />
            </div>
            <input name="email" type="email" autoComplete="email" required placeholder="you@example.com"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              style={{ width: "100%", height: 48, paddingLeft: 44, paddingRight: 16, background: "rgba(255,255,255,0.04)", border: `1px solid ${emailFocused ? "rgba(232,147,58,0.5)" : "rgba(255,248,231,0.1)"}`, borderRadius: 14, fontSize: 14, fontWeight: 400, color: CR, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s", caretColor: AM }} />
          </div>
        </div>

        {/* Password */}
        {mode === "password" && (
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,248,231,0.5)", marginBottom: 8 }}>Password</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: passFocused ? 0.8 : 0.35, transition: "opacity 0.2s" }}>
                <Lock size={16} stroke={passFocused ? AM : CR} />
              </div>
              <input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required placeholder="••••••••"
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                style={{ width: "100%", height: 48, paddingLeft: 44, paddingRight: 48, background: "rgba(255,255,255,0.04)", border: `1px solid ${passFocused ? "rgba(232,147,58,0.5)" : "rgba(255,248,231,0.1)"}`, borderRadius: 14, fontSize: 14, color: CR, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s", caretColor: AM }} />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,248,231,0.35)", display: "flex", alignItems: "center", transition: "color 0.2s", padding: 4 }}
                className="hover:text-[rgba(255,248,231,0.7)]">
                {showPassword ? <EyeOff size={15} stroke="currentColor" /> : <Eye size={15} stroke="currentColor" />}
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <Link href="/auth/reset-password" style={{ fontSize: 12, color: "rgba(255,248,231,0.4)", textDecoration: "none", transition: "color 0.2s" }}
                className="hover:text-[#E8933A]">
                Forgot password?
              </Link>
            </div>
          </div>
        )}

        {/* Submit */}
        <button type="submit" disabled={loading}
          style={{ width: "100%", height: 50, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: loading ? FM : F, border: `1px solid ${FM}`, borderRadius: 100, fontSize: 15, fontWeight: 600, color: CR, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", fontFamily: "inherit", boxShadow: "0 8px 24px rgba(26,61,43,0.4)", marginTop: 4 }}
          className="hover:translate-y-[-1px] hover:shadow-[0_12px_32px_rgba(26,61,43,0.5)]">
          {loading ? (
            <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid rgba(255,248,231,0.25)`, borderTopColor: CR, animation: "spin 0.7s linear infinite" }} />
          ) : mode === "password" ? (
            <><span>Sign in now</span><ArrowR size={15} stroke={CR} /></>
          ) : (
            <><Sparkle size={15} stroke={CR} /><span>Send magic link</span></>
          )}
        </button>
      </form>

      {/* Footer link */}
      <p style={{ textAlign: "center", fontSize: 14, color: "rgba(255,248,231,0.4)", marginTop: 28 }}>
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" style={{ fontWeight: 600, color: CR, textDecoration: "none", borderBottom: `1px solid rgba(255,248,231,0.2)`, paddingBottom: 1, transition: "all 0.2s, border-color 0.2s" }}
          className="hover:text-[#E8933A] hover:border-[#E8933A]">
          Create one free
        </Link>
      </p>

      {/* Back to home */}
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Link href="/" style={{ fontSize: 12, color: "rgba(255,248,231,0.25)", textDecoration: "none", transition: "color 0.2s" }}
          className="hover:text-[rgba(255,248,231,0.5)]">
          ← Back to SwitchMyCare
        </Link>
      </div>
    </div>
  );
}
