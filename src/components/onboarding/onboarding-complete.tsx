"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Search, LayoutDashboard } from "lucide-react";
import { careTypeLabel, payerLabel } from "@/lib/utils";
import type { OnboardingData } from "@/lib/onboarding-schema";

interface OnboardingCompleteProps {
  userName?: string | null;
  data: Partial<OnboardingData>;
}

export function OnboardingComplete({ userName, data }: OnboardingCompleteProps) {
  const router = useRouter();
  const firstName = userName?.split(" ")[0] ?? "there";
  const [countdown, setCountdown] = React.useState(6);

  // Auto-redirect to dashboard after countdown
  React.useEffect(() => {
    if (countdown <= 0) {
      router.push("/dashboard");
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-7 animate-slide-up text-center">

        {/* Success icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-forest-100 flex items-center justify-center">
              <CheckCircle2 className="size-12 text-forest-600" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-forest-300 animate-ping opacity-20" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-fraunces text-4xl font-semibold text-forest-800">
            You&apos;re all set, {firstName}!
          </h1>
          <p className="text-forest-500 text-base leading-relaxed">
            Your profile is saved. Now browse agencies in{" "}
            <strong className="text-forest-700">{data.address_county} County</strong>{" "}
            and submit your first switch request.
          </p>
        </div>

        {/* Profile summary */}
        <div className="rounded-2xl bg-white shadow-sm border border-forest-100 p-5 text-left space-y-3">
          <p className="text-xs font-semibold text-forest-500 uppercase tracking-wider">Profile saved</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {[
              { label: "Care type", value: careTypeLabel(String(data.care_type ?? "")) },
              { label: "Insurance", value: payerLabel(String(data.payer_type ?? "")) },
              { label: "Location", value: `${data.address_city}, ${data.address_county} Co.` },
              { label: "Services", value: `${(Array.isArray(data.care_needs) ? data.care_needs.length : 0)} selected` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] text-forest-400 font-semibold uppercase tracking-wider">{label}</p>
                <p className="text-sm font-medium text-forest-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What's next callout */}
        <div className="rounded-xl bg-forest-600 p-4 text-left text-white">
          <p className="text-sm font-semibold mb-2">What happens next?</p>
          <ol className="space-y-1.5 text-sm text-forest-100">
            <li className="flex gap-2"><span className="text-amber-400 font-bold shrink-0">01</span> Browse matching agencies below</li>
            <li className="flex gap-2"><span className="text-amber-400 font-bold shrink-0">02</span> Select one and submit a switch request</li>
            <li className="flex gap-2"><span className="text-amber-400 font-bold shrink-0">03</span> Our team reviews and coordinates everything</li>
          </ol>
        </div>

        {/* CTAs */}
        <div className="space-y-2.5">
          <Link
            href="/agencies"
            className="w-full h-12 rounded-2xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Search className="size-4" />
            Browse agencies now
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full h-10 rounded-2xl border border-forest-200 text-forest-600 text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-forest-50 transition-colors"
          >
            <LayoutDashboard className="size-4" />
            Go to dashboard
          </Link>
        </div>

        <p className="text-xs text-forest-300">
          Redirecting to dashboard in {countdown}s…
        </p>
      </div>
    </div>
  );
}
