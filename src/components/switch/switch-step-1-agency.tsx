"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, CheckCircle2, Star, MapPin, Phone, Languages, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, careTypeLabel, payerLabel } from "@/lib/utils";
import { switchStep1Schema, type SwitchStep1Data } from "@/lib/switch-schema";
import { StepNav } from "./switch-wizard";
import type { Agency } from "@/types/database";

interface SwitchStep1Props {
  agency: Agency;
  onComplete: (data: Partial<SwitchStep1Data>) => void;
  defaultValues: Partial<SwitchStep1Data>;
}

export function SwitchStep1Agency({ agency, onComplete, defaultValues }: SwitchStep1Props) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SwitchStep1Data>({
    resolver: zodResolver(switchStep1Schema),
    defaultValues: {
      new_agency_id: agency.id,
      confirmed_agency: defaultValues.confirmed_agency ?? false,
    },
  });

  const confirmed = watch("confirmed_agency");
  const stars = agency.medicare_quality_score;

  function onSubmit(data: SwitchStep1Data) {
    onComplete(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest-400">Step 1 of 5</p>
        <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
          Confirm your agency
        </h1>
        <p className="text-forest-500">
          Review the agency details below and confirm this is the one you want to switch to.
        </p>
      </div>

      {/* Agency preview card */}
      <div className={cn(
        "rounded-2xl border-2 p-6 space-y-5 transition-all",
        confirmed ? "border-forest-600 bg-forest-50" : "border-forest-200 bg-white"
      )}>
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-forest-100 flex items-center justify-center shrink-0">
            <Building2 className="size-7 text-forest-600" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap gap-2">
              {agency.is_verified_partner && (
                <Badge variant="verified" className="gap-1 text-xs">
                  <CheckCircle2 className="size-3" />
                  Verified Partner
                </Badge>
              )}
              {agency.care_types.map((ct) => (
                <Badge key={ct} variant="default" className="text-xs">{careTypeLabel(ct)}</Badge>
              ))}
            </div>
            <h2 className="font-fraunces text-xl font-semibold text-forest-800">{agency.name}</h2>
            {agency.dba_name && <p className="text-xs text-forest-400">dba {agency.dba_name}</p>}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-forest-600">
            <MapPin className="size-4 text-forest-400 shrink-0" />
            {agency.address_city}, PA {agency.address_zip}
          </div>
          {agency.phone && (
            <div className="flex items-center gap-2 text-forest-600">
              <Phone className="size-4 text-forest-400 shrink-0" />
              {agency.phone}
            </div>
          )}
          {agency.languages_spoken.length > 1 && (
            <div className="flex items-center gap-2 text-forest-600">
              <Languages className="size-4 text-forest-400 shrink-0" />
              {agency.languages_spoken.slice(0, 3).join(", ")}
              {agency.languages_spoken.length > 3 && ` +${agency.languages_spoken.length - 3}`}
            </div>
          )}
          {stars && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className={cn("size-3.5", i <= Math.round(stars) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200")} />
                ))}
              </div>
              <span className="text-forest-500">{stars.toFixed(1)} quality score</span>
            </div>
          )}
        </div>

        {/* Payers */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-forest-500 uppercase tracking-wider">Insurance accepted</p>
          <div className="flex flex-wrap gap-1.5">
            {agency.payers_accepted.map((p) => (
              <Badge key={p} variant="secondary" className="text-xs">{payerLabel(p)}</Badge>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-forest-500 uppercase tracking-wider">Services offered</p>
          <div className="flex flex-wrap gap-1.5">
            {agency.services_offered.slice(0, 6).map((s) => (
              <span key={s} className="text-xs bg-white border border-forest-200 text-forest-600 px-2 py-0.5 rounded-full">
                {s.replace(/_/g, " ")}
              </span>
            ))}
            {agency.services_offered.length > 6 && (
              <span className="text-xs text-forest-400">+{agency.services_offered.length - 6} more</span>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation checkbox */}
      <div className="rounded-xl border border-forest-200 bg-white p-5">
        <Checkbox
          label="Yes, I want to switch to this agency"
          description="I confirm this is my agency selection. I can change this before my request is processed."
          checked={confirmed}
          onCheckedChange={(v) => setValue("confirmed_agency", v === true, { shouldValidate: true })}
        />
        {errors.confirmed_agency && (
          <p className="text-sm text-red-500 mt-2">{errors.confirmed_agency.message}</p>
        )}
      </div>

      <StepNav isFirst />
    </form>
  );
}
