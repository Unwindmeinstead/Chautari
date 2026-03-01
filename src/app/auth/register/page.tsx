"use client";

import * as React from "react";
import Link from "next/link";
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUpWithEmail } from "@/lib/auth";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  const passwordStrength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await signUpWithEmail(formData);

    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
          Create your account
        </h1>
        <p className="text-forest-400">
          Free for patients. We&apos;ll help you find the right home care.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* HIPAA badge */}
      <div className="flex items-center gap-2 rounded-xl bg-forest-50 border border-forest-100 px-4 py-3">
        <ShieldCheck className="size-4 text-forest-600 shrink-0" />
        <p className="text-xs text-forest-600">
          Your information is protected under HIPAA. We never sell your data.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="full_name"
          type="text"
          label="Full name"
          placeholder="Jane Smith"
          required
          autoComplete="name"
          startIcon={<User className="size-4" />}
        />

        <Input
          name="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          required
          autoComplete="email"
          startIcon={<Mail className="size-4" />}
        />

        <Input
          name="phone"
          type="tel"
          label="Phone number"
          placeholder="(555) 555-5555"
          autoComplete="tel"
          startIcon={<Phone className="size-4" />}
          hint="Optional. Used for SMS updates on your switch request."
        />

        <div className="space-y-1.5">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

          {password && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= passwordStrength.score
                        ? passwordStrength.color
                        : "bg-forest-100"
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs ${passwordStrength.textColor}`}>
                {passwordStrength.label}
              </p>
            </div>
          )}
        </div>

        <Input
          name="confirm_password"
          type={showConfirm ? "text" : "password"}
          label="Confirm password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={confirm && password !== confirm ? "Passwords don't match" : undefined}
          startIcon={<Lock className="size-4" />}
          endIcon={
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-forest-400 hover:text-forest-600 transition-colors"
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />

        <p className="text-xs text-forest-400 leading-relaxed">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-forest-700 hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-forest-700 hover:underline">Privacy Policy</Link>.
        </p>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={loading}
          disabled={password !== confirm && confirm.length > 0}
        >
          Create account
          <ArrowRight className="size-4 ml-1" />
        </Button>
      </form>

      <p className="text-center text-sm text-forest-400">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-forest-700 font-medium hover:underline"
        >
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
  const colors = ["bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-green-500"];
  const textColors = ["text-red-600", "text-amber-600", "text-yellow-600", "text-green-600"];

  return {
    score,
    label: labels[score - 1] ?? "Too short",
    color: colors[score - 1] ?? "bg-red-400",
    textColor: textColors[score - 1] ?? "text-red-600",
  };
}
