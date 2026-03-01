"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioCardGroup } from "@/components/ui/radio-card-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { switchStep2Schema, type SwitchStep2Data, SWITCH_REASONS_MAP } from "@/lib/switch-schema";
import { StepNav } from "./switch-wizard";

interface SwitchStep2Props {
  onComplete: (data: Partial<SwitchStep2Data>) => void;
  onBack: () => void;
  defaultValues: Partial<SwitchStep2Data>;
}

const HAS_AGENCY_OPTIONS = [
  { value: "yes", label: "Yes, I have a current agency", description: "I want to switch to a different one" },
  { value: "no", label: "No, I don't have one yet", description: "I'm looking for my first home care agency", badge: "New patient" },
  { value: "unsure", label: "I'm not sure", description: "I may have had one but I'm uncertain" },
];

export function SwitchStep2Situation({ onComplete, onBack, defaultValues }: SwitchStep2Props) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SwitchStep2Data>({
    resolver: zodResolver(switchStep2Schema),
    defaultValues: {
      has_current_agency: defaultValues.has_current_agency,
      current_agency_name: defaultValues.current_agency_name ?? "",
      switch_reason: defaultValues.switch_reason ?? "",
      switch_reason_detail: defaultValues.switch_reason_detail ?? "",
    },
  });

  const hasCurrentAgency = watch("has_current_agency");
  const switchReason = watch("switch_reason");

  // Filter reasons based on current agency status
  const reasonEntries = Object.entries(SWITCH_REASONS_MAP).filter(([key]) => {
    if (hasCurrentAgency === "no") return key === "no_agency_yet" || key === "other";
    if (hasCurrentAgency === "yes") return key !== "no_agency_yet";
    return true;
  });

  function onSubmit(data: SwitchStep2Data) {
    onComplete(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest-400">Step 2 of 5</p>
        <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
          Your current situation
        </h1>
        <p className="text-forest-500">
          Tell us about your current home care setup so we can make this transition as smooth as possible.
        </p>
      </div>

      <div className="space-y-6">
        {/* Do you have a current agency? */}
        <Controller
          name="has_current_agency"
          control={control}
          render={({ field }) => (
            <RadioCardGroup
              name="has_current_agency"
              label="Do you currently have a home care agency?"
              options={HAS_AGENCY_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              columns={1}
            />
          )}
        />

        {/* Current agency name (if yes) */}
        {hasCurrentAgency === "yes" && (
          <div className="animate-slide-up">
            <Input
              label="Current agency name"
              placeholder="e.g. Visiting Angels of Pittsburgh"
              startIcon={<Building2 className="size-4" />}
              hint="We'll notify them only after your new agency formally accepts the transfer."
              error={errors.current_agency_name?.message}
              {...register("current_agency_name")}
            />
          </div>
        )}

        {/* Reason for switching */}
        {hasCurrentAgency && (
          <div className="animate-slide-up">
            <Controller
              name="switch_reason"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    label={hasCurrentAgency === "no" ? "Why are you looking for home care?" : "Why do you want to switch?"}
                    aria-required
                    error={errors.switch_reason?.message}
                  >
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasonEntries.map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        {/* Free-text detail */}
        {switchReason && switchReason !== "no_agency_yet" && (
          <div className="animate-slide-up">
            <Textarea
              label="Can you share more detail? (optional)"
              placeholder="For example: my aide hasn't been showing up consistently for the past month..."
              maxLength={500}
              value={watch("switch_reason_detail") ?? ""}
              onChange={(e) => setValue("switch_reason_detail", e.target.value)}
            />
          </div>
        )}

        {/* Notice about current agency */}
        {hasCurrentAgency === "yes" && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
            <strong>Important:</strong> Your current agency will only be contacted after your new agency 
            formally accepts the switch request. You will not lose any care during the transition.
          </div>
        )}
      </div>

      <StepNav onBack={onBack} />
    </form>
  );
}
