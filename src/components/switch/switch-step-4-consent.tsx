"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, AlertCircle, Clock, Building2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { switchStep4Schema, type SwitchStep4Data } from "@/lib/switch-schema";
import { StepNav } from "./switch-wizard";

interface SwitchStep4Props {
  onComplete: (data: Partial<SwitchStep4Data>) => void;
  onBack: () => void;
  defaultValues: Partial<SwitchStep4Data>;
  agencyName: string;
  currentAgencyName?: string;
}

export function SwitchStep4Consent({
  onComplete,
  onBack,
  defaultValues,
  agencyName,
  currentAgencyName,
}: SwitchStep4Props) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<SwitchStep4Data>({
    resolver: zodResolver(switchStep4Schema),
    defaultValues: {
      consent_hipaa: defaultValues.consent_hipaa ?? false,
      consent_current_agency_notification: defaultValues.consent_current_agency_notification ?? false,
      consent_terms: defaultValues.consent_terms ?? false,
      understands_timeline: defaultValues.understands_timeline ?? false,
    },
  });

  const values = watch();
  const allChecked = values.consent_hipaa && values.consent_current_agency_notification && values.consent_terms && values.understands_timeline;

  function onSubmit(data: SwitchStep4Data) {
    onComplete(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest-400">Step 4 of 5</p>
        <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
          Authorization &amp; consent
        </h1>
        <p className="text-forest-500">
          Please read and agree to the following before we submit your request.
          These are legally required to process a Medicaid/Medicare agency switch.
        </p>
      </div>

      <div className="space-y-4">
        {/* HIPAA Authorization */}
        <div className={`rounded-xl border-2 p-5 space-y-4 transition-colors ${
          values.consent_hipaa ? "border-forest-400 bg-forest-50" : "border-forest-200 bg-white"
        }`}>
          <div className="flex items-start gap-3">
            <ShieldCheck className="size-5 text-forest-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-forest-800 text-sm">HIPAA Authorization for Release of Health Information</p>
              <p className="text-xs text-forest-500 leading-relaxed">
                I authorize Chautari to release relevant portions of my health information 
                (including care plans, diagnosis codes, and service history) to{" "}
                <strong className="text-forest-700">{agencyName}</strong> solely for the purpose 
                of evaluating and processing my home care agency switch request. This authorization 
                may be revoked at any time by contacting Chautari support.
              </p>
            </div>
          </div>
          <Checkbox
            label="I authorize the release of my health information as described above"
            checked={values.consent_hipaa}
            onCheckedChange={(v) => setValue("consent_hipaa", v === true, { shouldValidate: true })}
          />
          {isSubmitted && errors.consent_hipaa && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="size-3.5" />
              {errors.consent_hipaa.message}
            </p>
          )}
        </div>

        {/* Current agency notification */}
        <div className={`rounded-xl border-2 p-5 space-y-4 transition-colors ${
          values.consent_current_agency_notification ? "border-forest-400 bg-forest-50" : "border-forest-200 bg-white"
        }`}>
          <div className="flex items-start gap-3">
            <Building2 className="size-5 text-forest-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-forest-800 text-sm">Current Agency Notification</p>
              <p className="text-xs text-forest-500 leading-relaxed">
                I understand that {currentAgencyName ? (
                  <><strong className="text-forest-700">{currentAgencyName}</strong> (my current agency)</>
                ) : "my current agency"} will be formally notified of this transfer{" "}
                <strong className="text-forest-700">only after {agencyName} accepts my switch request</strong>.
                I will not lose any authorized care hours during the transition period.
              </p>
            </div>
          </div>
          <Checkbox
            label="I understand when and how my current agency will be notified"
            checked={values.consent_current_agency_notification}
            onCheckedChange={(v) => setValue("consent_current_agency_notification", v === true, { shouldValidate: true })}
          />
          {isSubmitted && errors.consent_current_agency_notification && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="size-3.5" />
              {errors.consent_current_agency_notification.message}
            </p>
          )}
        </div>

        {/* Timeline */}
        <div className={`rounded-xl border-2 p-5 space-y-4 transition-colors ${
          values.understands_timeline ? "border-forest-400 bg-forest-50" : "border-forest-200 bg-white"
        }`}>
          <div className="flex items-start gap-3">
            <Clock className="size-5 text-forest-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-forest-800 text-sm">Expected Timeline</p>
              <p className="text-xs text-forest-500 leading-relaxed">
                Agency switches in Pennsylvania typically take <strong className="text-forest-700">3–10 business days</strong> to complete.
                The new agency has 5 business days to respond to this request. Chautari will keep you updated 
                at every step via email and your dashboard notifications.
              </p>
            </div>
          </div>
          <Checkbox
            label="I understand the expected timeline for my switch"
            checked={values.understands_timeline}
            onCheckedChange={(v) => setValue("understands_timeline", v === true, { shouldValidate: true })}
          />
          {isSubmitted && errors.understands_timeline && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="size-3.5" />
              {errors.understands_timeline.message}
            </p>
          )}
        </div>

        {/* Terms */}
        <div className={`rounded-xl border-2 p-5 space-y-4 transition-colors ${
          values.consent_terms ? "border-forest-400 bg-forest-50" : "border-forest-200 bg-white"
        }`}>
          <Checkbox
            label="I agree to Chautari's Terms of Service and Privacy Policy"
            description="By agreeing, you confirm you are 18 or older, a PA resident, and have authority to make decisions about your home care."
            checked={values.consent_terms}
            onCheckedChange={(v) => setValue("consent_terms", v === true, { shouldValidate: true })}
          />
          {isSubmitted && errors.consent_terms && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="size-3.5" />
              {errors.consent_terms.message}
            </p>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      {!allChecked && (
        <p className="text-xs text-center text-forest-400">
          {[values.consent_hipaa, values.consent_current_agency_notification, values.understands_timeline, values.consent_terms].filter(Boolean).length} of 4 items agreed to
        </p>
      )}

      <StepNav onBack={onBack} />
    </form>
  );
}
