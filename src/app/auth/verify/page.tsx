"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const method = searchParams.get("method");

  const isMagicLink = method === "magic";

  return (
    <div className="space-y-8 text-center">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="h-20 w-20 rounded-full bg-forest-100 flex items-center justify-center">
          <Mail className="size-9 text-forest-600" />
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
          {isMagicLink ? "Check your email" : "Verify your email"}
        </h1>
        <p className="text-forest-500 leading-relaxed">
          {isMagicLink ? (
            <>
              We sent a sign-in link to{" "}
              {email ? <strong className="text-forest-700">{email}</strong> : "your email"}.
              Click the link to sign in.
            </>
          ) : (
            <>
              We sent a confirmation link to{" "}
              {email ? <strong className="text-forest-700">{email}</strong> : "your email"}.
              Click the link to activate your account.
            </>
          )}
        </p>
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700 text-left space-y-2">
        <p className="font-medium">Can&apos;t find the email?</p>
        <ul className="list-disc list-inside space-y-1 text-amber-600">
          <li>Check your spam or junk folder</li>
          <li>Make sure you entered the right email</li>
          <li>Allow a minute or two for delivery</li>
        </ul>
      </div>

      <div className="space-y-3">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/auth/login">
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </Button>
      </div>

      <p className="text-xs text-forest-300">
        The link expires in 1 hour for security.
      </p>
    </div>
  );
}
