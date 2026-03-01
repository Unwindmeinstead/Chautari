import Link from "next/link";
import {
  User, MapPin, ShieldCheck, Heart, Pencil,
  Search, ArrowRight, ClipboardList, Phone, Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, payerLabel, careTypeLabel } from "@/lib/utils";
import type { DashboardData } from "@/lib/dashboard-actions";

// ─────────────────────────────────────────
// Profile summary card
// ─────────────────────────────────────────

interface ProfileSummaryCardProps {
  profile: DashboardData["profile"];
  details: DashboardData["patientDetails"];
}

export function ProfileSummaryCard({ profile, details }: ProfileSummaryCardProps) {
  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  return (
    <div className="rounded-2xl bg-white border border-forest-100 shadow-card overflow-hidden">
      {/* Header band */}
      <div className="bg-forest-gradient h-12 relative">
        <div className="absolute -bottom-6 left-5">
          <div className="h-14 w-14 rounded-2xl bg-amber-500 border-4 border-white flex items-center justify-center">
            <span className="font-fraunces text-xl font-semibold text-white">{initials}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-10 px-5 pb-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-fraunces text-lg font-semibold text-forest-800">
              {profile?.full_name ?? "Your name"}
            </p>
            <p className="text-xs text-forest-400">{profile?.email}</p>
          </div>
          <Button variant="ghost" size="sm" asChild className="shrink-0">
            <Link href="/profile">
              <Pencil className="size-3.5" />
              Edit
            </Link>
          </Button>
        </div>

        {/* Info items */}
        <div className="space-y-2.5">
          {details?.address_city && (
            <div className="flex items-center gap-2 text-sm text-forest-600">
              <MapPin className="size-3.5 text-forest-400 shrink-0" />
              {details.address_city}, {details.address_county} County, PA
            </div>
          )}
          {details?.payer_type && (
            <div className="flex items-center gap-2 text-sm text-forest-600">
              <ShieldCheck className="size-3.5 text-forest-400 shrink-0" />
              {payerLabel(details.payer_type)}
            </div>
          )}
          {details?.care_type && (
            <div className="flex items-center gap-2 text-sm text-forest-600">
              <Heart className="size-3.5 text-forest-400 shrink-0" />
              {careTypeLabel(details.care_type)}
            </div>
          )}
          {profile?.phone && (
            <div className="flex items-center gap-2 text-sm text-forest-600">
              <Phone className="size-3.5 text-forest-400 shrink-0" />
              {profile.phone}
            </div>
          )}
          {profile?.preferred_lang && profile.preferred_lang !== "en" && (
            <div className="flex items-center gap-2 text-sm text-forest-600">
              <Languages className="size-3.5 text-forest-400 shrink-0" />
              {profile.preferred_lang === "ne" ? "Nepali" : profile.preferred_lang === "hi" ? "Hindi" : profile.preferred_lang}
            </div>
          )}
        </div>

        {/* Services needed */}
        {details?.services_needed && details.services_needed.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {details.services_needed.slice(0, 5).map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">
                {s.replace(/_/g, " ")}
              </Badge>
            ))}
            {details.services_needed.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{details.services_needed.length - 5}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Stats row
// ─────────────────────────────────────────

interface StatsRowProps {
  requests: DashboardData["switchRequests"];
}

export function StatsRow({ requests }: StatsRowProps) {
  const total = requests.length;
  const active = requests.filter((r) => ["submitted", "under_review", "accepted"].includes(r.status)).length;
  const completed = requests.filter((r) => r.status === "completed").length;

  const stats = [
    { label: "Total requests", value: total, color: "text-forest-800" },
    { label: "Active", value: active, color: "text-blue-600" },
    { label: "Completed", value: completed, color: "text-green-600" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl bg-white border border-forest-100 shadow-card p-4 text-center">
          <p className={cn("font-fraunces text-3xl font-semibold", s.color)}>{s.value}</p>
          <p className="text-xs text-forest-400 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// Quick actions panel
// ─────────────────────────────────────────

interface QuickActionsProps {
  onboardingComplete: boolean;
  hasActiveRequest: boolean;
}

export function QuickActions({ onboardingComplete, hasActiveRequest }: QuickActionsProps) {
  const actions = [
    {
      icon: <Search className="size-5 text-forest-600" />,
      label: "Browse Agencies",
      description: "Find agencies in your county that accept your insurance",
      href: "/agencies",
      disabled: !onboardingComplete,
      variant: "outline" as const,
    },
    {
      icon: <ClipboardList className="size-5 text-amber-600" />,
      label: "Start a Switch Request",
      description: hasActiveRequest
        ? "You already have an active request"
        : "Select an agency and we handle all the paperwork",
      href: "/agencies",
      disabled: !onboardingComplete || hasActiveRequest,
      variant: "amber" as const,
      cta: true,
    },
    {
      icon: <User className="size-5 text-forest-600" />,
      label: "Update My Profile",
      description: "Edit your care needs, address, or insurance info",
      href: onboardingComplete ? "/profile" : "/onboarding",
      disabled: false,
      variant: "ghost" as const,
    },
  ];

  return (
    <div className="rounded-2xl bg-white border border-forest-100 shadow-card p-5 space-y-4">
      <h2 className="font-fraunces text-lg font-semibold text-forest-800">Quick Actions</h2>
      <div className="space-y-2">
        {actions.map((a) => (
          <div
            key={a.label}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border transition-all",
              a.disabled
                ? "border-forest-100 bg-forest-50 opacity-50 pointer-events-none"
                : a.cta
                ? "border-amber-200 bg-amber-50 hover:bg-amber-100"
                : "border-forest-100 hover:border-forest-200 hover:bg-forest-50"
            )}
          >
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
              a.cta ? "bg-amber-100" : "bg-forest-100"
            )}>
              {a.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-forest-800">{a.label}</p>
              <p className="text-xs text-forest-400 mt-0.5 leading-relaxed">{a.description}</p>
            </div>
            {!a.disabled && (
              <Button size="sm" variant={a.variant} asChild className="shrink-0">
                <Link href={a.href}>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        ))}
      </div>

      {!onboardingComplete && (
        <div className="rounded-xl bg-forest-600 p-4 flex items-center gap-3">
          <ClipboardList className="size-5 text-cream shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Complete your profile first</p>
            <p className="text-xs text-forest-200 mt-0.5">Takes 5 minutes — unlocks all features</p>
          </div>
          <Button size="sm" variant="amber" asChild>
            <Link href="/onboarding">Start</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
