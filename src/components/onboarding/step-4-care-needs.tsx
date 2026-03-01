"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stethoscope, Heart, HelpCircle } from "lucide-react";
import { RadioCardGroup } from "@/components/ui/radio-card-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { StepNav } from "./onboarding-wizard";
import { step4Schema, type Step4Data, type OnboardingData } from "@/lib/onboarding-schema";
import { HOME_HEALTH_SERVICES, HOME_CARE_SERVICES } from "@/data/pennsylvania";

interface Step4Props {
  defaultValues: Partial<OnboardingData>;
  onComplete: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

const CARE_TYPE_OPTIONS = [
  {
    value: "home_health",
    label: "Home Health",
    description: "Skilled nursing, physical therapy, wound care — prescribed by a doctor",
    icon: <Stethoscope className="size-5" />,
  },
  {
    value: "home_care",
    label: "Home Care",
    description: "Personal care, companionship, light housekeeping — non-medical assistance",
    icon: <Heart className="size-5" />,
  },
  {
    value: "both",
    label: "Both",
    description: "I need skilled medical care and personal care support",
    badge: "Common with Medicaid",
  },
] as const;

export function Step4CareNeeds({ defaultValues, onComplete, onBack }: Step4Props) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      care_type: defaultValues.care_type as Step4Data["care_type"] | undefined,
      care_needs: defaultValues.care_needs ?? [],
      has_physician_order: false,
      additional_notes: defaultValues.additional_notes ?? "",
    },
  });

  const careType = watch("care_type");
  const careNeeds = watch("care_needs");

  const showHealthServices = careType === "home_health" || careType === "both";
  const showCareServices = careType === "home_care" || careType === "both";

  function toggleCareNeed(service: string) {
    const current = careNeeds ?? [];
    if (current.includes(service)) {
      setValue("care_needs", current.filter((s) => s !== service), { shouldValidate: true });
    } else {
      setValue("care_needs", [...current, service], { shouldValidate: true });
    }
  }

  function onSubmit(data: Step4Data) {
    onComplete(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest-400">Step 4 of 5</p>
        <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
          What care do you need?
        </h1>
        <p className="text-forest-500">
          Select everything that applies. We&apos;ll use this to filter agencies that offer exactly these services.
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
                // Reset care needs when type changes
                setValue("care_needs", []);
              }}
              error={errors.care_type?.message}
              columns={3}
            />
          )}
        />

        {/* Service checklist — shows after care type is selected */}
        {careType && (
          <div className="space-y-5 animate-slide-up">
            {/* Home health services */}
            {showHealthServices && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-forest-700 flex items-center gap-2">
                  <Stethoscope className="size-4 text-forest-500" />
                  Skilled home health services
                </p>
                <div className="space-y-3 rounded-xl border border-forest-100 bg-white p-4">
                  {HOME_HEALTH_SERVICES.map((svc) => (
                    <Checkbox
                      key={svc.value}
                      label={svc.label}
                      description={svc.description}
                      checked={careNeeds?.includes(svc.value) ?? false}
                      onCheckedChange={() => toggleCareNeed(svc.value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Home care services */}
            {showCareServices && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-forest-700 flex items-center gap-2">
                  <Heart className="size-4 text-forest-500" />
                  Personal & home care services
                </p>
                <div className="space-y-3 rounded-xl border border-forest-100 bg-white p-4">
                  {HOME_CARE_SERVICES.map((svc) => (
                    <Checkbox
                      key={svc.value}
                      label={svc.label}
                      description={svc.description}
                      checked={careNeeds?.includes(svc.value) ?? false}
                      onCheckedChange={() => toggleCareNeed(svc.value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {errors.care_needs && (
              <p className="text-sm text-red-500">{errors.care_needs.message}</p>
            )}

            {/* Physician order */}
            {showHealthServices && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <HelpCircle className="size-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-700">
                    Home health services require a physician&apos;s order. Do you have one?
                  </p>
                </div>
                <Checkbox
                  label="Yes, I have (or can get) a physician's order"
                  checked={watch("has_physician_order") ?? false}
                  onCheckedChange={(checked) => setValue("has_physician_order", checked === true)}
                />
              </div>
            )}

            {/* Additional notes */}
            <Textarea
              label="Any other care needs or special requirements?"
              placeholder="e.g. I need a Nepali-speaking aide, or I require 24-hour care..."
              maxLength={500}
              hint="Optional — helps agencies prepare for your needs."
              error={errors.additional_notes?.message}
              value={watch("additional_notes") ?? ""}
              onChange={(e) => setValue("additional_notes", e.target.value)}
            />
          </div>
        )}
      </div>

      <StepNav onBack={onBack} />
    </form>
  );
}
