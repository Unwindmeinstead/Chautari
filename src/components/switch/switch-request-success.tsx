"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, LayoutDashboard, Bell, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SwitchRequestSuccessProps {
  requestId: string;
  agencyName: string;
  requestedStartDate?: string;
  userName?: string | null;
}

export function SwitchRequestSuccess({
  requestId,
  agencyName,
  requestedStartDate,
  userName,
}: SwitchRequestSuccessProps) {
  const firstName = userName?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-8 animate-slide-up text-center">
        {/* Success animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="size-12 text-green-600" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping opacity-20" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="font-fraunces text-4xl font-semibold text-forest-800">
            Request submitted, {firstName}!
          </h1>
          <p className="text-forest-500 text-lg leading-relaxed">
            Your switch request to{" "}
            <strong className="text-forest-700">{agencyName}</strong> has been received.
            We&apos;ll handle everything from here.
          </p>
        </div>

        {/* What happens next */}
        <div className="rounded-2xl bg-forest-600 p-6 text-left space-y-4 text-white">
          <p className="font-fraunces text-lg font-semibold">What happens next</p>
          <div className="space-y-3">
            {[
              { day: "Now", text: `${agencyName} is notified of your request` },
              { day: "1–5 days", text: "Agency reviews and accepts (or contacts you with questions)" },
              { day: "After acceptance", text: "Your current agency is formally notified of the transfer" },
              { day: `${requestedStartDate ? new Date(requestedStartDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Your start date"}`, text: "Care begins with your new agency" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="shrink-0 min-w-[80px]">
                  <span className="text-xs font-semibold text-amber-400">{item.day}</span>
                </div>
                <p className="text-sm text-forest-100">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reference number */}
        <div className="rounded-xl bg-white border border-forest-100 shadow-card p-4 text-sm">
          <p className="text-forest-400 text-xs mb-1">Request reference number</p>
          <p className="font-mono font-medium text-forest-700 text-base">{requestId.slice(0, 8).toUpperCase()}</p>
          <p className="text-xs text-forest-400 mt-1">Save this for your records</p>
        </div>

        {/* Notifications notice */}
        <div className="flex items-start gap-3 text-left bg-amber-50 border border-amber-200 rounded-xl p-4">
          <Bell className="size-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-700">
            We&apos;ll send you updates by email and in your dashboard as the agency responds.
            Check your dashboard to track progress.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="space-y-3">
          <Button size="xl" className="w-full" asChild>
            <Link href={`/switch/${requestId}`}>
              Track my request
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
      </div>
    </div>
  );
}
