import Link from "next/link";
import { Clock, CheckCircle2, XCircle, AlertCircle, MapPin, ShieldCheck, Languages, ArrowRight, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, payerLabel, careTypeLabel } from "@/lib/utils";
import { SWITCH_REASONS_MAP } from "@/lib/switch-schema";
import type { SwitchRequestWithPatient } from "@/lib/agency-portal-actions";

const STATUS: Record<string, { label: string; badge: string; dot: string; stripe: string; pulse: boolean }> = {
  submitted: { label: "New", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-400", stripe: "bg-amber-400", pulse: true },
  under_review: { label: "Reviewing", badge: "bg-blue-100 text-blue-700", dot: "bg-blue-400", stripe: "bg-blue-400", pulse: true },
  accepted: { label: "Accepted", badge: "bg-green-100 text-green-700", dot: "bg-green-500", stripe: "bg-green-500", pulse: false },
  completed: { label: "Completed", badge: "bg-forest-100 text-forest-700", dot: "bg-forest-500", stripe: "bg-forest-500", pulse: false },
  denied: { label: "Denied", badge: "bg-gray-100 text-gray-500", dot: "bg-gray-300", stripe: "bg-gray-200", pulse: false },
  cancelled: { label: "Cancelled", badge: "bg-gray-100 text-gray-400", dot: "bg-gray-200", stripe: "bg-gray-100", pulse: false },
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
    <Link href={`/agency/requests/${request.id}`} className="block outline-none">
      <div className={cn(
        "group relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-[24px] border bg-white p-5 sm:px-7 shadow-[0_2px_12px_rgba(26,61,43,0.02)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(26,61,43,0.06)] hover:-translate-y-1 cursor-pointer overflow-hidden",
        cfg.pulse ? "bg-gradient-to-r from-amber-50/40 to-white border-amber-200/60 ring-1 ring-amber-300/30" : "border-forest-900/5 hover:border-forest-900/10"
      )}>
        {/* Subtle accent line inside the card */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500 group-hover:w-2.5", cfg.stripe)} />

        {/* Left side: Avatar + Identity + Tags */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 flex-1 pl-2">

          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-forest-50 border border-forest-100 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-500 ease-out">
              <span className="text-base font-bold text-forest-700">{initials}</span>
            </div>
            <div>
              <p className="font-fraunces text-base font-semibold text-forest-900 leading-tight">
                {request.patient?.full_name ?? "Unknown patient"}
              </p>
              <p className="text-sm font-medium text-forest-500 mt-0.5">
                {request.patient_details?.address_city ?? "—"}, {request.patient_details?.address_county ?? "—"} Co.
              </p>
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-forest-100 shrink-0 mx-2" />

          {/* Details Row */}
          <div className="flex items-center gap-3 flex-wrap text-sm font-medium text-forest-600">
            <Badge className="bg-forest-50 text-forest-700 hover:bg-forest-100 border-none px-2.5 py-1 gap-1.5 shadow-sm">
              <ShieldCheck className="size-3.5 text-forest-400" />
              {request.patient_details?.payer_type ? payerLabel(request.patient_details.payer_type) : "Unknown Payer"}
            </Badge>
            <Badge className="bg-forest-50 text-forest-700 hover:bg-forest-100 border-none px-2.5 py-1 gap-1.5 shadow-sm">
              <MapPin className="size-3.5 text-forest-400" />
              {careTypeLabel(request.care_type)}
            </Badge>
            {needsInterpreter && (
              <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-none px-2.5 py-1 gap-1.5 shadow-sm">
                <Languages className="size-3.5" />
                {LANG_LABELS[lang!] ?? lang}
              </Badge>
            )}
            {!hipaaOk && (
              <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-none px-2.5 py-1 gap-1.5 shadow-sm font-bold">
                <AlertCircle className="size-3.5" /> No HIPAA
              </Badge>
            )}
          </div>
        </div>

        {/* Right side: Status + Date + Arrow */}
        <div className="flex items-center justify-between sm:justify-end gap-5 sm:pl-4 shrink-0 mt-2 sm:mt-0">

          <div className="flex flex-col sm:items-end gap-1.5">
            <span className={cn("flex items-center gap-1.5 rounded-xl px-3 py-1 text-[13px] font-bold shadow-sm whitespace-nowrap w-fit sm:w-auto", cfg.badge)}>
              <span className={cn("h-2 w-2 rounded-full shrink-0", cfg.dot, cfg.pulse && "animate-pulse ring-2 ring-amber-400/30")} />
              {cfg.label}
            </span>
            <div className="flex items-center gap-2 text-xs font-semibold text-forest-400">
              <Clock className="size-3" />
              {timeAgo(submittedAt)}
            </div>
          </div>

          <div className="h-10 w-10 rounded-full bg-forest-50 text-forest-400 flex items-center justify-center shrink-0 group-hover:bg-forest-100 group-hover:text-forest-900 transition-colors duration-300">
            <ArrowRight className="size-5 group-hover:translate-x-0.5 transition-transform duration-300" />
          </div>

        </div>

      </div>
    </Link>
  );
}
