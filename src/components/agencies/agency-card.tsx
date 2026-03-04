import Link from "next/link";
import { MapPin, Phone, Star, CheckCircle, Clock, Languages, Heart, ArrowUpRight, ShieldCheck } from "lucide-react";
import { cn, careTypeLabel, payerLabel } from "@/lib/utils";
import type { Agency } from "@/types/database";

const LANG_LABELS: Record<string, string> = {
  en: "English", ne: "Nepali", hi: "Hindi", es: "Spanish", zh: "Mandarin", ar: "Arabic", fr: "French"
};

interface AgencyCardProps {
  agency: Agency;
  highlighted?: boolean;
  showSelectButton?: boolean;
  onSelect?: (agency: Agency) => void;
}

export function AgencyCard({ agency, highlighted = false, showSelectButton = false, onSelect }: AgencyCardProps) {
  const stars = agency.medicare_quality_score ?? null;
  const topLangs = agency.languages_spoken.slice(0, 3);

  return (
    <div className={cn(
      "group rounded-2xl bg-white border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col",
      highlighted
        ? "border-gray-900 shadow-xl shadow-gray-900/10"
        : "border-gray-100 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-900/5"
    )}>
      {/* Left accent on hover/highlight */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 transition-transform duration-300 bg-gray-900",
        highlighted ? "translate-x-0" : "-translate-x-full group-hover:translate-x-0")} />

      <div className="p-5 flex-1 space-y-4 pl-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {agency.is_verified_partner && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                  <CheckCircle className="size-3" /> Verified
                </span>
              )}
              {agency.is_accepting_patients && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" /> Accepting
                </span>
              )}
            </div>
            <h3 className="text-[16px] font-bold text-gray-900 leading-tight">{agency.name}</h3>
            {agency.dba_name && <p className="text-[11px] font-medium text-gray-400 mt-0.5">dba {agency.dba_name}</p>}
          </div>

          {/* Star rating */}
          {stars && (
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={cn("size-3", i <= Math.round(stars) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200")} />
                ))}
              </div>
              <span className="text-[11px] font-bold text-gray-500">{stars.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[12px] font-medium text-gray-500">
            <MapPin className="size-3.5 text-gray-400 shrink-0" />
            {agency.address_city}, PA {agency.address_zip} · Serves {agency.service_counties.slice(0, 2).join(", ")}{agency.service_counties.length > 2 ? ` +${agency.service_counties.length - 2}` : ""}
          </div>
          {agency.average_response_time_hours && (
            <div className="flex items-center gap-2 text-[12px] font-medium text-gray-500">
              <Clock className="size-3.5 text-gray-400 shrink-0" />
              Responds in ~{agency.average_response_time_hours}h
            </div>
          )}
          {agency.languages_spoken.length > 1 && (
            <div className="flex items-center gap-2 text-[12px] font-medium text-gray-500">
              <Languages className="size-3.5 text-gray-400 shrink-0" />
              {topLangs.map(l => LANG_LABELS[l] ?? l).join(", ")}{agency.languages_spoken.length > 3 ? ` +${agency.languages_spoken.length - 3}` : ""}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {agency.care_types.map(ct => (
            <span key={ct} className="text-[11px] font-bold text-gray-700 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
              {careTypeLabel(ct)}
            </span>
          ))}
          {agency.payers_accepted.slice(0, 3).map(p => (
            <span key={p} className="text-[11px] font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
              {payerLabel(p)}
            </span>
          ))}
          {agency.payers_accepted.length > 3 && (
            <span className="text-[11px] font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
              +{agency.payers_accepted.length - 3} payers
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-5 py-3 pl-6 flex items-center gap-3">
        {agency.phone && (
          <a href={`tel:${agency.phone}`}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            onClick={e => e.stopPropagation()}>
            <Phone className="size-3.5" /> {agency.phone}
          </a>
        )}
        <div className="flex-1" />
        {showSelectButton && onSelect ? (
          <button
            onClick={() => onSelect(agency)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-gray-900 text-white text-[12px] font-bold hover:bg-gray-800 transition-colors">
            <Heart className="size-3.5" /> Select
          </button>
        ) : (
          <Link href={`/agencies/${agency.id}`}
            className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-gray-200 text-[12px] font-bold text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all group/btn">
            View details <ArrowUpRight className="size-3.5 group-hover/btn:text-gray-900 transition-colors" />
          </Link>
        )}
      </div>
    </div>
  );
}

export function AgencyCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-5 space-y-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-3.5 w-16 bg-gray-100 rounded-full" />
        <div className="h-5 w-3/4 bg-gray-100 rounded-lg" />
        <div className="h-3 w-1/2 bg-gray-100 rounded-lg" />
      </div>
      <div className="flex gap-2">
        <div className="h-4 w-20 bg-gray-100 rounded-full" />
        <div className="h-4 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="flex gap-2">
        <div className="h-4 w-24 bg-gray-100 rounded-full" />
        <div className="h-4 w-16 bg-gray-100 rounded-full" />
        <div className="h-4 w-20 bg-gray-100 rounded-full" />
      </div>
      <div className="h-9 bg-gray-100 rounded-xl mt-4" />
    </div>
  );
}
