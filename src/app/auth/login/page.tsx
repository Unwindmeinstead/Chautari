"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithEmail, signInWithMagicLink, signInWithGoogle } from "@/lib/auth";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");
  const message = searchParams.get("message");

  const [mode, setMode] = React.useState<"password" | "magic">("password");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function clientAction(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      const action = mode === "password" ? signInWithEmail : signInWithMagicLink;
      const result = await action(formData);

      if (result?.error) {
        setError(result.error);
      } else if (mode === "magic") {
        setSuccess("Check your email for a sign-in link!");
      }
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await signInWithGoogle(redirectedFrom ?? "/dashboard");
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header with decorative element */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2.5 font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-amber-500">
          <span className="w-6 h-px bg-amber-500" />Welcome back
        </div>
        <h1 className="font-fraunces text-[clamp(32px,4vw,42px)] font-bold tracking-tight text-forest-600 leading-[1.1]">
          Sign in to<br /><span className="text-amber-500">continue</span>
        </h1>
        <p className="text-[15px] font-light text-[#6B7B6E] leading-relaxed pt-1">
          {redirectedFrom
            ? "Please sign in to continue your journey to better home care."
            : "Access your dashboard to manage your home care journey."}
        </p>
      </div>

      {/* Message banners */}
      {message && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-forest-50 border border-forest-200 px-4 py-3 text-sm text-forest-700">
          {success}
        </div>
      )}

      {/* Google sign in */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-full border border-[rgba(26,61,43,0.12)] bg-white text-[14px] font-medium text-forest-600 hover:bg-forest-50 hover:border-forest-200 transition-all"
      >
        <svg className="size-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-[rgba(26,61,43,0.08)]" />
        <span className="text-xs text-[#6B7B6E] font-medium">or</span>
        <div className="flex-1 h-px bg-[rgba(26,61,43,0.08)]" />
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-2xl border border-[rgba(26,61,43,0.08)] p-1 bg-[rgba(26,61,43,0.03)] gap-1">
        <button
          type="button"
          onClick={() => setMode("password")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-[13px] font-medium transition-all duration-200 ${mode === "password"
              ? "bg-forest-600 text-cream shadow-md"
              : "text-[#6B7B6E] hover:text-forest-600 hover:bg-white/50"
            }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode("magic")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-[13px] font-medium transition-all duration-200 ${mode === "magic"
              ? "bg-forest-600 text-cream shadow-md"
              : "text-[#6B7B6E] hover:text-forest-600 hover:bg-white/50"
            }`}
        >
          Magic link
        </button>
      </div>

      {/* Form */}
      <form action={clientAction} className="space-y-5">
        <input type="hidden" name="redirectedFrom" value={redirectedFrom ?? ""} />
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-forest-600 ml-1">Email address</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-400">
              <Mail className="size-5" />
            </div>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[rgba(26,61,43,0.1)] bg-white text-[15px] text-forest-800 placeholder:text-forest-300 focus:outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100 transition-all"
            />
          </div>
        </div>

        {mode === "password" && (
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-forest-600 ml-1">Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-400">
                <Lock className="size-5" />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full pl-12 pr-14 py-3.5 rounded-2xl border border-[rgba(26,61,43,0.1)] bg-white text-[15px] text-forest-800 placeholder:text-forest-300 focus:outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-600 transition-colors"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            <div className="flex justify-end px-1">
              <Link
                href="/auth/reset-password"
                className="text-[13px] text-forest-500 hover:text-forest-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-forest-600 text-cream font-medium text-[15px] px-6 py-3.5 rounded-full hover:bg-forest-700 transition-all hover:-translate-y-0.5"
          style={{ boxShadow: "0 8px 24px rgba(26,61,43,0.2)" }}
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
          ) : mode === "password" ? (
            <>
              Sign in
              <ArrowRight className="size-4" />
            </>
          ) : (
            "Send magic link"
          )}
        </button>
      </form>

      <p className="text-center text-[14px] text-[#6B7B6E]">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="text-forest-600 font-semibold hover:text-amber-500 transition-colors"
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}
