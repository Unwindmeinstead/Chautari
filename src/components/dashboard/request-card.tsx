import Link from "next/link";
import {
  Clock, CheckCircle2, XCircle, AlertCircle,
  Building2, Calendar, ArrowRight, Stethoscope
} from "lucide-react";
import { cn, careTypeLabel } from "@/lib/utils";
import { SWITCH_REASONS_MAP } from "@/lib/switch-schema";
import type { DashboardData } from "@/lib/dashboard-actions";

type Request = DashboardData["switchRequests"][number];

const STATUS_CONFIG = {
  submitted: {
    label: "Submitted",
    icon: Clock,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    iconColor: "text-blue-500",
    dot: "bg-blue-400 animate-pulse",
    description: "Awaiting agency review",
  },
  under_review: {
    label: "Under Review",
    icon: AlertCircle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    iconColor: "text-amber-500",
    dot: "bg-amber-400 animate-pulse",
    description: "Agency is reviewing your request",
  },
  accepted: {
    label: "Accepted",
    icon: CheckCircle2,
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    iconColor: "text-green-500",
    dot: "bg-green-400",
    description: "Agency has accepted — switch in progress",
  },
  completed: {
    label: "Complete",
    icon: CheckCircle2,
    bg: "bg-forest-50",
    border: "border-forest-200",
    text: "text-forest-700",
    iconColor: "text-forest-500",
    dot: "bg-forest-500",
    description: "Switch successfully completed",
  },
  denied: {
    label: "Denied",
    icon: XCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    iconColor: "text-red-400",
    dot: "bg-red-400",
    description: "Agency could not accept this request",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-500",
    iconColor: "text-gray-400",
    dot: "bg-gray-300",
    description: "Request was cancelled",
  },
} as const;

interface RequestCardProps {
  request: Request;
  compact?: boolean;
}

export function RequestCard({ request, compact = false }: RequestCardProps) {
  const cfg = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.submitted;
  const Icon = cfg.icon;
  const submittedDate = new Date(request.submitted_at ?? request.created_at);
  const startDate = request.requested_start_date
    ? new Date(request.requested_start_date)
    : null;

  return (
    <Link href={`/switch/${request.id}`}>
      <div className={cn(
        "group rounded-2xl border bg-white shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer overflow-hidden",
        cfg.border
      )}>
        {/* Status bar */}
        <div className={cn("h-1.5 w-full", cfg.bg, "border-b", cfg.border)}>
          <div className={cn("h-full w-1/3 rounded-r-full", cfg.dot, {
            "w-full": request.status === "completed",
            "w-2/3": request.status === "accepted",
            "w-1/2": request.status === "under_review",
            "w-1/4": request.status === "submitted",
          })} />
        </div>

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full shrink-0", cfg.dot)} />
              <span className={cn("text-xs font-semibold uppercase tracking-wide", cfg.text)}>
                {cfg.label}
              </span>
            </div>
            <span className="text-xs text-forest-400 font-mono">
              #{request.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          {/* Agency */}
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-forest-100 flex items-center justify-center shrink-0">
              <Building2 className="size-5 text-forest-600" />
            </div>
            <div className="min-w-0">
              <p className="font-fraunces text-base font-semibold text-forest-800 leading-tight truncate">
                {request.new_agency?.name ?? "Unknown Agency"}
              </p>
              <p className="text-xs text-forest-400 mt-0.5">
                {request.new_agency?.address_city}, PA
              </p>
            </div>
          </div>

          {!compact && (
            <>
              {/* Care type + reason */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-1.5 text-forest-500">
                  <Stethoscope className="size-3.5 text-forest-400 shrink-0" />
                  <span className="truncate">{careTypeLabel(request.care_type)}</span>
                </div>
                <div className="text-forest-500 truncate text-xs">
                  {SWITCH_REASONS_MAP[request.switch_reason] ?? request.switch_reason}
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center justify-between text-xs text-forest-400">
                <span>
                  Submitted {submittedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                {startDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    Start: {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
            </>
          )}

          {/* Status description */}
          <div className={cn(
            "flex items-center justify-between rounded-xl px-3 py-2.5 text-xs",
            cfg.bg
          )}>
            <div className="flex items-center gap-1.5">
              <Icon className={cn("size-3.5 shrink-0", cfg.iconColor)} />
              <span className={cfg.text}>{cfg.description}</span>
            </div>
            <ArrowRight className={cn("size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5", cfg.text)} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function RequestCardSkeleton() {
  return (
    <div className="rounded-2xl border border-forest-100 bg-white shadow-card overflow-hidden animate-pulse">
      <div className="h-1.5 bg-forest-100" />
      <div className="p-5 space-y-4">
        <div className="h-3 w-24 skeleton rounded-full" />
        <div className="flex gap-3">
          <div className="h-10 w-10 skeleton rounded-xl" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 skeleton rounded" />
            <div className="h-3 w-1/2 skeleton rounded" />
          </div>
        </div>
        <div className="h-8 skeleton rounded-xl" />
      </div>
    </div>
  );
}
