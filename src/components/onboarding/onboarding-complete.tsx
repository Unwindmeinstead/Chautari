"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Search, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { careTypeLabel, payerLabel } from "@/lib/utils";
import type { OnboardingData } from "@/lib/onboarding-schema";

interface OnboardingCompleteProps {
  userName?: string | null;
  data: Partial<OnboardingData>;
}

export function OnboardingComplete({ userName, data }: OnboardingCompleteProps) {
  const firstName = userName?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-8 animate-slide-up text-center">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-forest-100 flex items-center justify-center">
              <CheckCircle2 className="size-12 text-forest-600" />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full border-4 border-forest-300 animate-ping opacity-20" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="font-fraunces text-4xl font-semibold text-forest-800">
            You&apos;re all set, {firstName}!
          </h1>
          <p className="text-forest-500 text-lg leading-relaxed">
            Your profile is ready. We&apos;re matching you with agencies in{" "}
            <strong className="text-forest-700">{data.address_county} County</strong>{" "}
            that accept <strong className="text-forest-700">{payerLabel(data.payer_type ?? "")}</strong>.
          </p>
        </div>

        {/* Profile summary */}
        <div className="rounded-2xl bg-white shadow-card p-6 text-left space-y-4">
          <p className="text-sm font-semibold text-forest-700">Your profile summary</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-forest-400">Care type</p>
              <Badge variant="default" className="text-xs">
                {careTypeLabel(data.care_type ?? "")}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-forest-400">Insurance</p>
              <Badge variant="info" className="text-xs">
                {payerLabel(data.payer_type ?? "")}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-forest-400">Location</p>
              <p className="text-sm font-medium text-forest-700">
                {data.address_city}, {data.address_county} Co.
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-forest-400">Services needed</p>
              <p className="text-sm font-medium text-forest-700">
                {(data.care_needs?.length ?? 0)} selected
              </p>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="space-y-3">
          <Button size="xl" className="w-full" asChild>
            <Link href="/agencies">
              <Search className="size-5" />
              Find my agencies
              <ArrowRight className="size-5" />
            </Link>
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="size-4" />
              Go to dashboard
            </Link>
          </Button>
        </div>

        <p className="text-xs text-forest-300">
          You can update your profile at any time from your dashboard.
        </p>
      </div>
    </div>
  );
}
