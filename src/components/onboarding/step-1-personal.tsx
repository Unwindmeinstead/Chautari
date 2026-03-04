"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Phone, Calendar, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InlineRadio } from "@/components/ui/radio-card-group";
import { StepNav } from "./onboarding-wizard";
import { step1Schema, type Step1Data, type OnboardingData } from "@/lib/onboarding-schema";

interface Step1Props {
  defaultValues: Partial<OnboardingData>;
  userName?: string | null;
  onComplete: (data: Partial<OnboardingData>) => void;
}

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ne", label: "नेपाली" },
  { value: "hi", label: "हिंदी" },
];

export function Step1Personal({ defaultValues, userName, onComplete }: Step1Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      full_name: defaultValues.full_name ?? userName ?? "",
      phone: defaultValues.phone ?? "",
      preferred_lang: defaultValues.preferred_lang ?? "en",
      date_of_birth: defaultValues.date_of_birth ?? "",
    },
  });

  const lang = watch("preferred_lang");

  function onSubmit(data: Step1Data) {
    onComplete(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Heading */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest-400">Step 1 of 5</p>
        <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
          Let&apos;s get to know you
        </h1>
        <p className="text-forest-500">
          This information helps us personalize your experience. Your data is protected by HIPAA.
        </p>
      </div>

      {/* Form fields */}
      <div className="space-y-5">
        <Input
          label="Full name"
          placeholder="Jane Smith"
          required
          autoComplete="name"
          startIcon={<User className="size-4" />}
          error={errors.full_name?.message}
          {...register("full_name")}
        />

        <Input
          label="Date of birth"
          type="date"
          required
          startIcon={<Calendar className="size-4" />}
          hint="We use this to verify your eligibility for home care services."
          error={errors.date_of_birth?.message}
          {...register("date_of_birth")}
        />

        <Input
          label="Phone number"
          type="tel"
          placeholder="(555) 555-5555"
          autoComplete="tel"
          startIcon={<Phone className="size-4" />}
          hint="Optional. Used for SMS updates about your switch request."
          error={errors.phone?.message}
          {...register("phone")}
        />

        {/* Language preference */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-forest-400" />
            <p className="text-sm font-medium text-forest-700">Preferred language</p>
          </div>
          <InlineRadio
            name="preferred_lang"
            options={LANGUAGE_OPTIONS}
            value={lang}
            onChange={(v) => setValue("preferred_lang", v as "en" | "ne" | "hi")}
          />
          {lang !== "en" && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              We&apos;re building full support for this language. Some parts may still appear in English.
            </p>
          )}
        </div>
      </div>

      <StepNav isFirst />
    </form>
  );
}
