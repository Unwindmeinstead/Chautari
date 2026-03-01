"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepNav } from "./onboarding-wizard";
import { step2Schema, type Step2Data, type OnboardingData } from "@/lib/onboarding-schema";
import { PA_COUNTIES } from "@/data/pennsylvania";

interface Step2Props {
  defaultValues: Partial<OnboardingData>;
  onComplete: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export function Step2Address({ defaultValues, onComplete, onBack }: Step2Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      address_line1: defaultValues.address_line1 ?? "",
      address_line2: defaultValues.address_line2 ?? "",
      address_city: defaultValues.address_city ?? "",
      address_state: "PA",
      address_zip: defaultValues.address_zip ?? "",
      address_county: defaultValues.address_county ?? "",
    },
  });

  const county = watch("address_county");

  function onSubmit(data: Step2Data) {
    onComplete(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest-400">Step 2 of 5</p>
        <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
          Where do you live?
        </h1>
        <p className="text-forest-500">
          We use your address to find home care agencies that serve your area in Pennsylvania.
        </p>
      </div>

      {/* PA-only notice */}
      <div className="flex items-start gap-3 rounded-xl bg-forest-50 border border-forest-100 p-4">
        <MapPin className="size-4 text-forest-600 mt-0.5 shrink-0" />
        <p className="text-sm text-forest-600">
          Chautari currently serves <strong>Pennsylvania residents only</strong>. 
          We&apos;re expanding to more states soon.
        </p>
      </div>

      <div className="space-y-5">
        <Input
          label="Street address"
          placeholder="123 Main Street"
          required
          autoComplete="street-address"
          error={errors.address_line1?.message}
          {...register("address_line1")}
        />

        <Input
          label="Apartment, suite, unit (optional)"
          placeholder="Apt 2B"
          autoComplete="address-line2"
          error={errors.address_line2?.message}
          {...register("address_line2")}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            placeholder="Pittsburgh"
            required
            autoComplete="address-level2"
            error={errors.address_city?.message}
            {...register("address_city")}
          />

          <Input
            label="State"
            value="Pennsylvania"
            readOnly
            disabled
            hint="PA only"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="ZIP code"
            placeholder="15213"
            required
            autoComplete="postal-code"
            maxLength={10}
            error={errors.address_zip?.message}
            {...register("address_zip")}
          />

          {/* County select */}
          <Select
            value={county}
            onValueChange={(v) => setValue("address_county", v, { shouldValidate: true })}
          >
            <SelectTrigger
              label="County"
              aria-required
              error={errors.address_county?.message}
            >
              <SelectValue placeholder="Select county" />
            </SelectTrigger>
            <SelectContent>
              {PA_COUNTIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Hidden state field */}
        <input type="hidden" {...register("address_state")} value="PA" />
      </div>

      <StepNav onBack={onBack} />
    </form>
  );
}
