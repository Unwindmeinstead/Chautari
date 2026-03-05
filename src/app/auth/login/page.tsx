"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "password" | "magic";

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

  const completeClientRedirect = React.useCallback(() => {
    // Navigate to /dashboard — the middleware reads the role from the DB
    // and immediately redirects admins to /admin, agency users to /agency/dashboard, etc.
    // This avoids the race condition where the session cookie isn't yet sent to
    // the server when we fetch /api/auth/redirect-path right after signInWithPassword.
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
    <div className="space-y-7">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-amber-500">
          <span className="h-px w-6 bg-amber-500" /> Account access
        </div>
        <h1 className="font-fraunces text-[clamp(30px,4vw,42px)] font-bold tracking-tight text-forest-700 leading-[1.1]">
          Secure login,
          <br />
          no dead ends.
        </h1>
        <p className="text-[15px] font-light leading-relaxed text-[#6B7B6E]">
          Sign in with your password, magic link, or Google and continue exactly where you left off.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-700">
          {success}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-[rgba(26,61,43,0.12)] bg-white px-5 py-3.5 text-[14px] font-medium text-forest-600 transition-all hover:border-forest-200 hover:bg-forest-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-[rgba(26,61,43,0.08)]" />
        <span className="text-xs font-medium text-[#6B7B6E]">or sign in with email</span>
        <div className="h-px flex-1 bg-[rgba(26,61,43,0.08)]" />
      </div>

      <div className="flex gap-1 rounded-2xl border border-[rgba(26,61,43,0.08)] bg-[rgba(26,61,43,0.03)] p-1">
        <button
          type="button"
          onClick={() => setMode("password")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all duration-200 ${mode === "password"
              ? "bg-forest-600 text-cream shadow-md"
              : "text-[#6B7B6E] hover:bg-white/50 hover:text-forest-600"
            }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode("magic")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all duration-200 ${mode === "magic"
              ? "bg-forest-600 text-cream shadow-md"
              : "text-[#6B7B6E] hover:bg-white/50 hover:text-forest-600"
            }`}
        >
          Magic link
        </button>
      </div>

      <form onSubmit={mode === "password" ? handlePasswordSignIn : handleMagicLink} className="space-y-5">
        <div className="space-y-1.5">
          <label className="ml-1 text-[13px] font-medium text-forest-600">Email address</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-400">
              <Mail className="size-5" />
            </div>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-[rgba(26,61,43,0.1)] bg-white py-3.5 pl-12 pr-4 text-[15px] text-forest-800 placeholder:text-forest-300 transition-all focus:border-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-100"
            />
          </div>
        </div>

        {mode === "password" && (
          <div className="space-y-1.5">
            <label className="ml-1 text-[13px] font-medium text-forest-600">Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-400">
                <Lock className="size-5" />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full rounded-2xl border border-[rgba(26,61,43,0.1)] bg-white py-3.5 pl-12 pr-14 text-[15px] text-forest-800 placeholder:text-forest-300 transition-all focus:border-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-forest-400 transition-colors hover:text-forest-600"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            <div className="flex justify-end px-1">
              <Link href="/auth/reset-password" className="text-[13px] text-forest-500 transition-colors hover:text-forest-700">
                Forgot password?
              </Link>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-forest-600 px-6 py-3.5 text-[15px] font-medium text-cream transition-all hover:-translate-y-0.5 hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-70"
          style={{ boxShadow: "0 8px 24px rgba(26,61,43,0.2)" }}
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-cream/30 border-t-cream" />
          ) : mode === "password" ? (
            <>
              Sign in now
              <ArrowRight className="size-4" />
            </>
          ) : (
            "Send magic link"
          )}
        </button>
      </form>

      <p className="text-center text-[14px] text-[#6B7B6E]">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="font-semibold text-forest-600 transition-colors hover:text-amber-500">
          Create one free
        </Link>
      </p>
    </div>
  );
}
