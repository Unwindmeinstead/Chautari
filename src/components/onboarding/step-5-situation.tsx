"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Calendar } from "lucide-react";
import { RadioCardGroup } from "@/components/ui/radio-card-group";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepNav } from "./onboarding-wizard";
import { step5Schema, type Step5Data, type OnboardingData } from "@/lib/onboarding-schema";
import { SWITCH_REASONS } from "@/data/pennsylvania";

interface Step5Props {
  defaultValues: Partial<OnboardingData>;
  onComplete: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  saving: boolean;
}

const CURRENT_AGENCY_OPTIONS = [
  {
    value: "yes",
    label: "Yes, I have an agency",
    description: "I want to switch to a different agency",
  },
  {
    value: "no",
    label: "No agency yet",
    description: "I need to find my first home care agency",
    badge: "New to home care",
  },
  {
    value: "unsure",
    label: "I'm not sure",
    description: "I may have one but I'm not certain",
  },
] as const;

export function Step5Situation({ defaultValues, onComplete, onBack, saving }: Step5Props) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      has_current_agency: defaultValues.has_current_agency as Step5Data["has_current_agency"] | undefined,
      current_agency_name: defaultValues.current_agency_name ?? "",
      switch_reason: defaultValues.switch_reason ?? "",
      preferred_start_date: defaultValues.preferred_start_date ?? "",
    },
  });

  const hasCurrentAgency = watch("has_current_agency");

  // Minimum date is today
  const today = new Date().toISOString().split("T")[0];

  function onSubmit(data: Step5Data) {
    onComplete(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest-400">Step 5 of 5</p>
        <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
          Your current situation
        </h1>
        <p className="text-forest-500">
          Tell us about where you are today so we can make the right match for you.
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
              options={CURRENT_AGENCY_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              columns={1}
            />
          )}
        />

        {/* Current agency name — only if they have one */}
        {hasCurrentAgency === "yes" && (
          <div className="animate-slide-up">
            <Input
              label="Current agency name"
              placeholder="e.g. Visiting Angels of Pittsburgh"
              autoComplete="off"
              startIcon={<Building2 className="size-4" />}
              hint="We'll only contact them after your new agency accepts your request."
              error={errors.current_agency_name?.message}
              {...register("current_agency_name")}
            />
          </div>
        )}

        {/* Reason for switching / looking */}
        <div className="space-y-1.5">
          <Controller
            name="switch_reason"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  label={
                    hasCurrentAgency === "no"
                      ? "Why are you looking for home care?"
                      : "Why do you want to switch agencies?"
                  }
                  aria-required
                  error={errors.switch_reason?.message}
                >
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {SWITCH_REASONS.filter((r) =>
                    hasCurrentAgency === "no"
                      ? r.value === "no_agency_yet" || r.value === "other"
                      : r.value !== "no_agency_yet"
                  ).map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                  {(hasCurrentAgency === "unsure" || !hasCurrentAgency) &&
                    SWITCH_REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Preferred start date */}
        <Input
          label="Preferred start date (optional)"
          type="date"
          min={today}
          startIcon={<Calendar className="size-4" />}
          hint="When would you like care to begin? We'll try to match this timeline."
          error={errors.preferred_start_date?.message}
          {...register("preferred_start_date")}
        />

        {/* Summary of what happens next */}
        <div className="rounded-xl bg-forest-600 p-5 space-y-3 text-white">
          <p className="font-fraunces text-lg font-semibold">What happens after this?</p>
          <ul className="space-y-2 text-sm text-forest-100">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold mt-0.5 shrink-0">01</span>
              We&apos;ll show you matched agencies based on your needs and insurance.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold mt-0.5 shrink-0">02</span>
              You select an agency and submit your switch request.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold mt-0.5 shrink-0">03</span>
              Chautari contacts the new agency and manages all the paperwork.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold mt-0.5 shrink-0">04</span>
              {hasCurrentAgency === "yes"
                ? "Your current agency is only notified after the new one accepts."
                : "Your new agency will confirm and schedule your first visit."}
            </li>
          </ul>
        </div>
      </div>

      <StepNav
        onBack={onBack}
        isLast
        loading={saving}
        nextLabel="Complete setup"
      />
    </form>
  );
}
