"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword, updatePassword } from "@/lib/auth";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  // Supabase sets these when user clicks the reset link
  const type = searchParams.get("type");
  const isReset = type === "recovery";

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

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

  // After reset email sent
  if (sent) {
    return (
      <div className="space-y-8 text-center">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="size-9 text-green-600" />
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
            Email sent!
          </h1>
          <p className="text-forest-500">
            Check your inbox for a password reset link.
          </p>
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/auth/login">
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </Button>
      </div>
    );
  }

  // Set new password form (after clicking email link)
  if (isReset) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
            Set new password
          </h1>
          <p className="text-forest-400">Choose a strong password for your account.</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            label="New password"
            placeholder="••••••••"
            required
            minLength={8}
            startIcon={<Lock className="size-4" />}
            endIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
          />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Update password
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </div>
    );
  }

  // Request reset email form
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1 text-sm text-forest-400 hover:text-forest-600 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </Link>
        <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
          Reset password
        </h1>
        <p className="text-forest-400">
          Enter your email and we&apos;ll send a reset link.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleRequestReset} className="space-y-4">
        <Input
          name="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          required
          autoComplete="email"
          startIcon={<Mail className="size-4" />}
        />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Send reset link
          <ArrowRight className="size-4" />
        </Button>
      </form>
    </div>
  );
}
