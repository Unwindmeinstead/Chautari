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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const action = mode === "password" ? signInWithEmail : signInWithMagicLink;
    const result = await action(formData);

    if (result?.error) {
      setError(result.error);
    } else if (mode === "magic") {
      setSuccess("Check your email for a sign-in link!");
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setLoading(true);
    await signInWithGoogle();
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
          Welcome back
        </h1>
        <p className="text-forest-400">
          {redirectedFrom
            ? "Please sign in to continue."
            : "Sign in to manage your home care."}
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
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full gap-3"
        onClick={handleGoogle}
        loading={loading}
      >
        <svg className="size-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </Button>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-forest-100" />
        <span className="text-xs text-forest-300">or</span>
        <div className="flex-1 h-px bg-forest-100" />
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-xl border border-forest-200 p-1 bg-forest-50 gap-1">
        <button
          type="button"
          onClick={() => setMode("password")}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            mode === "password"
              ? "bg-white text-forest-700 shadow-sm"
              : "text-forest-400 hover:text-forest-600"
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode("magic")}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            mode === "magic"
              ? "bg-white text-forest-700 shadow-sm"
              : "text-forest-400 hover:text-forest-600"
          }`}
        >
          Magic link
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          required
          autoComplete="email"
          startIcon={<Mail className="size-4" />}
        />

        {mode === "password" && (
          <div className="space-y-1.5">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              startIcon={<Lock className="size-4" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-forest-400 hover:text-forest-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
            />
            <div className="flex justify-end">
              <Link
                href="/auth/reset-password"
                className="text-xs text-forest-500 hover:text-forest-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={loading}
        >
          {mode === "password" ? "Sign in" : "Send magic link"}
          <ArrowRight className="size-4 ml-1" />
        </Button>
      </form>

      <p className="text-center text-sm text-forest-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="text-forest-700 font-medium hover:underline"
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}
