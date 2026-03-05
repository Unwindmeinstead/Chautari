"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, HelpCircle } from "lucide-react";
import { RadioCardGroup } from "@/components/ui/radio-card-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StepNav } from "./onboarding-wizard";
import { step3Schema, type Step3Data, type OnboardingData } from "@/lib/onboarding-schema";
import { PA_MEDICAID_PLANS, PA_WAIVER_PROGRAMS } from "@/data/pennsylvania";

interface Step3Props {
  defaultValues: Partial<OnboardingData>;
  onComplete: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

const PAYER_OPTIONS = [
  {
    value: "medicaid",
    label: "Medicaid (MA)",
    description: "Pennsylvania Medical Assistance, including managed care plans",
    badge: "Most common",
  },
  {
    value: "medicare",
    label: "Medicare",
    description: "Federal health insurance for people 65+ or with disabilities",
  },
  {
    value: "waiver",
    label: "Waiver Program",
    description: "OBRA, PDA, CommCare, or other PA waiver services",
  },
  {
    value: "private",
    label: "Private Insurance",
    description: "Employer-sponsored or individual health insurance plan",
  },
  {
    value: "self_pay",
    label: "Self-Pay",
    description: "Paying out of pocket, no insurance coverage",
  },
] as const;

export function Step3Insurance({ defaultValues, onComplete, onBack }: Step3Props) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      payer_type: defaultValues.payer_type as Step3Data["payer_type"] | undefined,
      medicaid_plan: defaultValues.medicaid_plan ?? "",
      medicaid_id: "",
    },
  });

  const payerType = watch("payer_type");

  function onSubmit(data: Step3Data) {
    onComplete(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest-400">Step 3 of 5</p>
        <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
          What&apos;s your insurance?
        </h1>
        <p className="text-forest-500">
          We&apos;ll only show agencies that accept your coverage, so you won&apos;t get any surprise bills.
        </p>
      </div>

      <div className="space-y-6">
        {/* Payer type selection */}
        <Controller
          name="payer_type"
          control={control}
          render={({ field }) => (
            <RadioCardGroup
              name="payer_type"
              options={PAYER_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.payer_type?.message}
              columns={2}
            />
          )}
        />

        {/* Conditional: Medicaid plan */}
        {payerType === "medicaid" && (
          <div className="rounded-xl border border-forest-200 bg-forest-50 p-5 space-y-4 animate-slide-up">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-forest-600" />
              <p className="text-sm font-semibold text-forest-700">Medicaid plan details</p>
            </div>

            <Controller
              name="medicaid_plan"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    label="Medicaid managed care plan"
                    aria-required
                    error={errors.medicaid_plan?.message}
                  >
                    <SelectValue placeholder="Select your plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {PA_MEDICAID_PLANS.map((plan) => (
                      <SelectItem key={plan.value} value={plan.value}>
                        {plan.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            <Input
              label="Medicaid ID / Member ID"
              placeholder="e.g. 123456789A"
              hint="Optional — helps us verify your eligibility faster."
              maxLength={20}
              error={errors.medicaid_id?.message}
              {...register("medicaid_id")}
            />

            <div className="flex items-start gap-2 text-xs text-forest-500 bg-white rounded-lg p-3 border border-forest-100">
              <HelpCircle className="size-3.5 text-forest-400 mt-0.5 shrink-0" />
              <p>Your Medicaid ID is on your ACCESS card or plan member card. 
                 We encrypt and protect this information under HIPAA.</p>
            </div>
          </div>
        )}

        {/* Conditional: Waiver program */}
        {payerType === "waiver" && (
          <div className="rounded-xl border border-forest-200 bg-forest-50 p-5 space-y-4 animate-slide-up">
            <p className="text-sm font-semibold text-forest-700">Which waiver program?</p>
            <Controller
              name="medicaid_plan"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger label="Waiver program">
                    <SelectValue placeholder="Select your waiver" />
                  </SelectTrigger>
                  <SelectContent>
                    {PA_WAIVER_PROGRAMS.map((w) => (
                      <SelectItem key={w.value} value={w.value}>
                        {w.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        {/* Medicare note */}
        {payerType === "medicare" && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 animate-slide-up">
            <strong>Note:</strong> Medicare covers short-term home <em>health</em> services (skilled nursing, therapy) 
            but not ongoing personal care. We&apos;ll help you find Medicare-certified agencies.
          </div>
        )}

        {/* Self-pay note */}
        {payerType === "self_pay" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 animate-slide-up">
            We&apos;ll show agencies that offer private-pay rates and may offer sliding-scale fees 
            based on income.
          </div>
        )}
      </div>

      <StepNav onBack={onBack} />
    </form>
  );
}
