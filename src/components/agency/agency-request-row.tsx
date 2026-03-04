import Link from "next/link";
import { Clock, CheckCircle2, AlertCircle, MapPin, ShieldCheck, Languages, ArrowRight } from "lucide-react";
import { cn, payerLabel, careTypeLabel } from "@/lib/utils";
import type { SwitchRequestWithPatient } from "@/lib/agency-portal-actions";

const STATUS: Record<string, { label: string; color: string; bg: string; dot: string; pulse: boolean }> = {
  submitted: { label: "New", color: "text-amber-700", bg: "bg-amber-50 border-amber-200/50", dot: "bg-amber-500", pulse: true },
  under_review: { label: "Reviewing", color: "text-blue-700", bg: "bg-blue-50 border-blue-200/50", dot: "bg-blue-500", pulse: true },
  accepted: { label: "Accepted", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200/50", dot: "bg-emerald-500", pulse: false },
  completed: { label: "Completed", color: "text-zinc-700", bg: "bg-zinc-100 border-zinc-200/50", dot: "bg-zinc-500", pulse: false },
  denied: { label: "Denied", color: "text-red-700", bg: "bg-red-50 border-red-200/50", dot: "bg-red-500", pulse: false },
  cancelled: { label: "Cancelled", color: "text-zinc-500", bg: "bg-zinc-50 border-zinc-200/50", dot: "bg-zinc-400", pulse: false },
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
        "group relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl border bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 cursor-pointer overflow-hidden",
        "border-zinc-200/60 hover:border-zinc-300/80"
      )}>
        {/* Subtle accent line on left */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover:w-1.5", cfg.dot)} />

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 flex-1 pl-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 group-hover:bg-zinc-50 transition-colors">
              <span className="text-[13px] font-bold text-zinc-600">{initials}</span>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-zinc-900 leading-snug">
                {request.patient?.full_name ?? "Unknown patient"}
              </p>
              <p className="text-[11px] font-medium text-zinc-500 mt-0.5">
                {request.patient_details?.address_city ?? "—"}, {request.patient_details?.address_county ?? "—"}
              </p>
            </div>
          </div>

          <div className="hidden sm:block w-px h-8 bg-zinc-200 shrink-0 mx-2" />

          {/* Details Row */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-medium text-zinc-600">
            <span className="inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-700 px-2 py-1 rounded-md">
              <ShieldCheck className="size-3 text-zinc-400" />
              {request.patient_details?.payer_type ? payerLabel(request.patient_details.payer_type) : "Unknown Payer"}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-700 px-2 py-1 rounded-md">
              <MapPin className="size-3 text-zinc-400" />
              {careTypeLabel(request.care_type)}
            </span>
            {needsInterpreter && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2 py-1 rounded-md border border-amber-200/50">
                <Languages className="size-3" />
                {LANG_LABELS[lang!] ?? lang}
              </span>
            )}
            {!hipaaOk && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-2 py-1 rounded-md border border-red-200/50 font-bold">
                <AlertCircle className="size-3" /> No HIPAA
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 mt-2 sm:mt-0 px-3 sm:px-0">
          <div className="flex flex-col sm:items-end gap-1.5">
            <span className={cn("flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold tracking-wide", cfg.bg, cfg.color)}>
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot, cfg.pulse && "animate-pulse")} />
              {cfg.label}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
              <Clock className="size-3 opacity-60" />
              {timeAgo(submittedAt)}
            </div>
          </div>

          <div className="h-8 w-8 rounded-full bg-zinc-50 text-zinc-400 flex items-center justify-center shrink-0 group-hover:bg-zinc-100 group-hover:text-zinc-900 transition-colors">
            <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

      </div>
    </Link>
  );
}
