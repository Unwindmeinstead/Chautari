import Link from "next/link";
import { MapPin, Phone, Star, CheckCircle2, Clock, Languages, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, careTypeLabel, payerLabel } from "@/lib/utils";
import type { Agency } from "@/types/database";

interface AgencyCardProps {
  agency: Agency;
  highlighted?: boolean;
  showSelectButton?: boolean;
  onSelect?: (agency: Agency) => void;
}

export function AgencyCard({ agency, highlighted = false, showSelectButton = false, onSelect }: AgencyCardProps) {
  const stars = agency.medicare_quality_score ?? null;
  const topLanguages = agency.languages_spoken.slice(0, 3);
  const hasMore = agency.languages_spoken.length > 3;

  return (
    <div
      className={cn(
        "rounded-2xl bg-white border transition-all duration-200 group",
        highlighted
          ? "border-forest-400 shadow-card-hover ring-2 ring-forest-600 ring-offset-2"
          : "border-forest-100 shadow-card hover:shadow-card-hover hover:border-forest-200"
      )}
    >
      {/* Card header */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {agency.is_verified_partner && (
                <Badge variant="verified" className="text-xs gap-1 shrink-0">
                  <CheckCircle2 className="size-3" />
                  Verified
                </Badge>
              )}
            </div>
            <h3 className="font-fraunces text-lg font-semibold text-forest-800 mt-1 leading-tight">
              {agency.name}
            </h3>
            {agency.dba_name && (
              <p className="text-xs text-forest-400 mt-0.5">dba {agency.dba_name}</p>
            )}
          </div>

          {/* Star rating */}
          {stars && (
            <div className="flex flex-col items-center gap-0.5 shrink-0">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={cn(
                      "size-3.5",
                      i <= Math.round(stars)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200 fill-gray-200"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-forest-400">{stars.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-forest-500">
          <MapPin className="size-3.5 shrink-0 text-forest-400" />
          <span className="truncate">
            {agency.address_city}, PA {agency.address_zip}
          </span>
        </div>

        {/* Response time */}
        {agency.avg_response_hours && (
          <div className="flex items-center gap-1.5 text-xs text-forest-400">
            <Clock className="size-3.5 shrink-0" />
            Typically responds in {agency.avg_response_hours}h
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="px-5 pb-4 space-y-2.5">
        {/* Care types */}
        <div className="flex flex-wrap gap-1.5">
          {agency.care_types.map((ct) => (
            <Badge key={ct} variant="default" className="text-xs">
              {careTypeLabel(ct)}
            </Badge>
          ))}
        </div>

        {/* Payers */}
        <div className="flex flex-wrap gap-1.5">
          {agency.payers_accepted.slice(0, 4).map((p) => (
            <Badge key={p} variant="secondary" className="text-xs">
              {payerLabel(p)}
            </Badge>
          ))}
          {agency.payers_accepted.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{agency.payers_accepted.length - 4} more
            </Badge>
          )}
        </div>

        {/* Languages */}
        {agency.languages_spoken.length > 1 && (
          <div className="flex items-center gap-1.5 text-xs text-forest-500">
            <Languages className="size-3.5 shrink-0 text-forest-400" />
            {topLanguages.join(", ")}
            {hasMore && ` +${agency.languages_spoken.length - 3} more`}
          </div>
        )}

        {/* Service counties preview */}
        <div className="flex items-center gap-1.5 text-xs text-forest-400">
          <MapPin className="size-3 shrink-0" />
          Serves {agency.service_counties.slice(0, 3).join(", ")}
          {agency.service_counties.length > 3 && ` + ${agency.service_counties.length - 3} counties`}
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-forest-100 p-4 flex items-center gap-2">
        {agency.phone && (
          <Button variant="ghost" size="sm" className="gap-1.5 text-forest-500" asChild>
            <a href={`tel:${agency.phone}`}>
              <Phone className="size-3.5" />
              <span className="hidden sm:inline">{agency.phone}</span>
              <span className="sm:hidden">Call</span>
            </a>
          </Button>
        )}

        <div className="flex-1" />

        {showSelectButton && onSelect ? (
          <Button
            size="sm"
            variant="amber"
            onClick={() => onSelect(agency)}
            className="gap-1.5"
          >
            <Heart className="size-3.5" />
            Select agency
          </Button>
        ) : (
          <Button size="sm" variant="outline" asChild>
            <Link href={`/agencies/${agency.id}`}>
              View details
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

// Skeleton loader
export function AgencyCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-forest-100 p-5 space-y-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-20 skeleton rounded-full" />
        <div className="h-5 w-3/4 skeleton rounded-lg" />
        <div className="h-3 w-1/2 skeleton rounded-lg" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-20 skeleton rounded-full" />
        <div className="h-5 w-16 skeleton rounded-full" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-24 skeleton rounded-full" />
        <div className="h-5 w-16 skeleton rounded-full" />
        <div className="h-5 w-20 skeleton rounded-full" />
      </div>
      <div className="h-9 skeleton rounded-xl mt-4" />
    </div>
  );
}
