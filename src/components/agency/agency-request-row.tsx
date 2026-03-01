import Link from "next/link";
import { Clock, CheckCircle2, XCircle, AlertCircle, MapPin, ShieldCheck, Languages, ArrowRight, Calendar } from "lucide-react";
import { cn, payerLabel, careTypeLabel } from "@/lib/utils";
import { SWITCH_REASONS_MAP } from "@/lib/switch-schema";
import type { SwitchRequestWithPatient } from "@/lib/agency-portal-actions";

const STATUS: Record<string, { label: string; badge: string; dot: string; stripe: string; pulse: boolean }> = {
  submitted:    { label: "New",       badge: "bg-amber-100 text-amber-700",  dot: "bg-amber-400",  stripe: "bg-amber-400", pulse: true  },
  under_review: { label: "Reviewing", badge: "bg-blue-100 text-blue-700",    dot: "bg-blue-400",   stripe: "bg-blue-400",  pulse: true  },
  accepted:     { label: "Accepted",  badge: "bg-green-100 text-green-700",  dot: "bg-green-500",  stripe: "bg-green-500", pulse: false },
  completed:    { label: "Completed", badge: "bg-forest-100 text-forest-700",dot: "bg-forest-500", stripe: "bg-forest-500",pulse: false },
  denied:       { label: "Denied",    badge: "bg-gray-100 text-gray-500",    dot: "bg-gray-300",   stripe: "bg-gray-200",  pulse: false },
  cancelled:    { label: "Cancelled", badge: "bg-gray-100 text-gray-400",    dot: "bg-gray-200",   stripe: "bg-gray-100",  pulse: false },
};

const LANG_LABELS: Record<string, string> = {
  en: "English", ne: "Nepali", hi: "Hindi", es: "Spanish",
  zh: "Mandarin", ar: "Arabic", fr: "French", pt: "Portuguese",
};

function timeAgo(dateStr: string) {
  const hrs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 3600000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

export function AgencyRequestRow({ request }: { request: SwitchRequestWithPatient }) {
  const cfg = STATUS[request.status] ?? STATUS.submitted;
  const hipaaOk = request.e_signatures?.some((s) => s.consent_hipaa);
  const lang = request.patient?.preferred_lang;
  const needsInterpreter = lang && lang !== "en";
  const submittedAt = request.submitted_at ?? request.created_at;
  const initials = (request.patient?.full_name ?? "?")[0]?.toUpperCase() ?? "?";

  return (
    <Link href={`/agency/requests/${request.id}`}>
      <div className={cn(
        "group flex rounded-2xl border bg-white shadow-card overflow-hidden",
        "transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer",
        cfg.pulse && "ring-1 ring-amber-300/60"
      )}>
        {/* Left accent stripe */}
        <div className={cn("w-1 shrink-0", cfg.stripe)} />

        <div className="flex-1 p-5 space-y-3.5">
          {/* Top row: patient + status */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-forest-100 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-forest-600">{initials}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm leading-tight">
                  {request.patient?.full_name ?? "Unknown patient"}
                </p>
                <p className="text-xs text-gray-400">
                  {request.patient_details?.address_city ?? "—"}, {request.patient_details?.address_county ?? "—"} Co.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-400">{timeAgo(submittedAt)}</span>
              <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", cfg.badge)}>
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot, cfg.pulse && "animate-pulse")} />
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Details row */}
          <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-gray-400 shrink-0" />
              {request.patient_details?.payer_type ? payerLabel(request.patient_details.payer_type) : "Insurance unknown"}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-gray-400 shrink-0" />
              {careTypeLabel(request.care_type)}
            </span>
            {needsInterpreter && (
              <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                <Languages className="size-3.5 shrink-0" />
                {LANG_LABELS[lang!] ?? lang} speaker
              </span>
            )}
            {!hipaaOk && (
              <span className="text-red-500 font-medium">⚠ No HIPAA</span>
            )}
          </div>

          {/* Footer: reason + start date + arrow */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-gray-400 italic truncate max-w-xs">
              "{SWITCH_REASONS_MAP[request.switch_reason] ?? request.switch_reason}"
            </p>
            <div className="flex items-center gap-2.5 shrink-0">
              {request.requested_start_date && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="size-3" />
                  {new Date(request.requested_start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
              <ArrowRight className="size-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
