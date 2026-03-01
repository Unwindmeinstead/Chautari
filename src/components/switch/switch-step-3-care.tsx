"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Stethoscope, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioCardGroup } from "@/components/ui/radio-card-group";
import { Checkbox } from "@/components/ui/checkbox";
import { switchStep3Schema, type SwitchStep3Data } from "@/lib/switch-schema";
import { HOME_HEALTH_SERVICES, HOME_CARE_SERVICES } from "@/data/pennsylvania";
import { StepNav } from "./switch-wizard";

interface SwitchStep3Props {
  onComplete: (data: Partial<SwitchStep3Data>) => void;
  onBack: () => void;
  defaultValues: Partial<SwitchStep3Data>;
  agencyServices: string[];
}

const CARE_TYPE_OPTIONS = [
  { value: "home_health", label: "Home Health", description: "Skilled nursing, therapy — prescribed by a doctor", icon: <Stethoscope className="size-4" /> },
  { value: "home_care", label: "Home Care", description: "Personal care, companionship, homemaking", icon: <Heart className="size-4" /> },
  { value: "both", label: "Both", description: "Skilled care and personal care support" },
];

export function SwitchStep3Care({ onComplete, onBack, defaultValues, agencyServices }: SwitchStep3Props) {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const minDate = today.toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SwitchStep3Data>({
    resolver: zodResolver(switchStep3Schema),
    defaultValues: {
      care_type: defaultValues.care_type,
      services_requested: defaultValues.services_requested ?? [],
      requested_start_date: defaultValues.requested_start_date ?? "",
      special_instructions: defaultValues.special_instructions ?? "",
    },
  });

  const careType = watch("care_type");
  const servicesRequested = watch("services_requested");

  const showHealthServices = careType === "home_health" || careType === "both";
  const showCareServices = careType === "home_care" || careType === "both";

  // Only show services this specific agency offers
  const availableHealthServices = HOME_HEALTH_SERVICES.filter((s) =>
    agencyServices.includes(s.value)
  );
  const availableCareServices = HOME_CARE_SERVICES.filter((s) =>
    agencyServices.includes(s.value)
  );

  function toggleService(svc: string) {
    const current = servicesRequested ?? [];
    if (current.includes(svc)) {
      setValue("services_requested", current.filter((s) => s !== svc), { shouldValidate: true });
    } else {
      setValue("services_requested", [...current, svc], { shouldValidate: true });
    }
  }

  function onSubmit(data: SwitchStep3Data) {
    onComplete(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest-400">Step 3 of 5</p>
        <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
          Care details
        </h1>
        <p className="text-forest-500">
          Tell us what care you need from your new agency. Only services they offer are shown.
        </p>
      </div>

      <div className="space-y-7">
        {/* Care type */}
        <Controller
          name="care_type"
          control={control}
          render={({ field }) => (
            <RadioCardGroup
              name="care_type"
              label="Type of care"
              options={CARE_TYPE_OPTIONS}
              value={field.value}
              onChange={(v) => {
                field.onChange(v);
                setValue("services_requested", []);
              }}
              error={errors.care_type?.message}
              columns={3}
            />
          )}
        />

        {/* Services checklist */}
        {careType && (
          <div className="space-y-5 animate-slide-up">
            {showHealthServices && availableHealthServices.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-forest-700 flex items-center gap-2">
                  <Stethoscope className="size-4 text-forest-500" />
                  Skilled home health services
                </p>
                <div className="space-y-3 rounded-xl border border-forest-100 bg-white p-4">
                  {availableHealthServices.map((svc) => (
                    <Checkbox
                      key={svc.value}
                      label={svc.label}
                      description={svc.description}
                      checked={servicesRequested?.includes(svc.value) ?? false}
                      onCheckedChange={() => toggleService(svc.value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {showCareServices && availableCareServices.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-forest-700 flex items-center gap-2">
                  <Heart className="size-4 text-forest-500" />
                  Personal &amp; home care services
                </p>
                <div className="space-y-3 rounded-xl border border-forest-100 bg-white p-4">
                  {availableCareServices.map((svc) => (
                    <Checkbox
                      key={svc.value}
                      label={svc.label}
                      description={svc.description}
                      checked={servicesRequested?.includes(svc.value) ?? false}
                      onCheckedChange={() => toggleService(svc.value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {errors.services_requested && (
              <p className="text-sm text-red-500">{errors.services_requested.message}</p>
            )}

            {/* Requested start date */}
            <Input
              label="Requested start date"
              type="date"
              min={minDate}
              required
              startIcon={<Calendar className="size-4" />}
              hint="The date you'd like care to begin with the new agency. Subject to agency availability."
              error={errors.requested_start_date?.message}
              {...register("requested_start_date")}
            />

            {/* Special instructions */}
            <Textarea
              label="Special instructions or requirements (optional)"
              placeholder="e.g. I need a female aide, I require morning visits before 10am, I have a dog..."
              maxLength={1000}
              value={watch("special_instructions") ?? ""}
              onChange={(e) => setValue("special_instructions", e.target.value)}
              error={errors.special_instructions?.message}
            />
          </div>
        )}
      </div>

      <StepNav onBack={onBack} />
    </form>
  );
}
