import Link from "next/link";
import { Clock, CheckCircle2, AlertCircle, MapPin, ShieldCheck, Languages, ArrowUpRight } from "lucide-react";
import { cn, payerLabel, careTypeLabel } from "@/lib/utils";
import type { SwitchRequestWithPatient } from "@/lib/agency-portal-actions";

const STATUS: Record<string, { label: string; dot: string; text: string }> = {
  submitted: { label: "Needs Review", dot: "bg-red-500", text: "text-gray-900" },
  under_review: { label: "Reviewing", dot: "bg-blue-500", text: "text-gray-900" },
  accepted: { label: "Approved", dot: "bg-green-500", text: "text-gray-900" },
  completed: { label: "Completed", dot: "bg-gray-300", text: "text-gray-500" },
  denied: { label: "Denied", dot: "bg-gray-300", text: "text-gray-500" },
  cancelled: { label: "Cancelled", dot: "bg-gray-200", text: "text-gray-400" },
};

const LANG_LABELS: Record<string, string> = {
  en: "English", ne: "Nepali", hi: "Hindi", es: "Spanish",
  zh: "Mandarin", ar: "Arabic", fr: "French", pt: "Portuguese",
};

function timeAgo(dateStr: string) {
  const hrs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 3600000);
  if (hrs < 1) return "Just now";
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
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
    <Link href={`/agency/requests/${request.id}`} className="block group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 rounded-[24px] bg-white border border-gray-100 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-900/5 transition-all duration-300 ease-out cursor-pointer relative overflow-hidden">

        {/* Hover Highlight line */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gray-900 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />

        <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-1 pl-1">
          {/* Avatar Area */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:scale-105 transition-transform duration-300">
              <span className="text-[16px] font-bold text-gray-900">{initials}</span>
            </div>
            <div className="min-w-[160px]">
              <p className="text-[16px] font-bold text-gray-900 leading-tight">
                {request.patient?.full_name ?? "Unknown patient"}
              </p>
              <p className="text-[13px] font-medium text-gray-500 mt-0.5">
                {request.patient_details?.address_city ?? "—"}, {request.patient_details?.address_county ?? "—"}
              </p>
            </div>
          </div>

          <div className="hidden sm:block w-[1px] h-10 bg-gray-100 shrink-0 mx-2" />

          {/* Details Row */}
          <div className="flex items-center gap-2 flex-wrap text-[12px] font-semibold text-gray-600">
            <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full border border-gray-100">
              <ShieldCheck className="size-3.5 text-gray-400" />
              {request.patient_details?.payer_type ? payerLabel(request.patient_details.payer_type) : "Unknown Payer"}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full border border-gray-100">
              <MapPin className="size-3.5 text-gray-400" />
              {careTypeLabel(request.care_type)}
            </span>
            {needsInterpreter && (
              <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-900 px-3 py-1.5 rounded-full border border-gray-200">
                <Languages className="size-3.5 text-gray-500" />
                {LANG_LABELS[lang!] ?? lang}
              </span>
            )}
            {!hipaaOk && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1.5 rounded-full border border-red-100 font-bold">
                <AlertCircle className="size-3.5" /> No HIPAA
              </span>
            )}
          </div>
        </div>

        {/* Right side Status & Action */}
        <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 mt-2 sm:mt-0">
          <div className="flex flex-col sm:items-end gap-1">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", cfg.dot)} />
              <span className={cn("text-[14px] font-bold", cfg.text)}>{cfg.label}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-400">
              <Clock className="size-3.5" />
              {timeAgo(submittedAt)}
            </div>
          </div>

          <div className="h-10 w-10 text-gray-400 flex items-center justify-center shrink-0 group-hover:text-gray-900 transition-colors">
            <ArrowUpRight className="size-6 stroke-[2.5]" />
          </div>
        </div>

      </div>
    </Link>
  );
}
