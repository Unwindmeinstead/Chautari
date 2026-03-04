"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, CheckCircle2, Building2, Calendar, Stethoscope } from "lucide-react";
import { SignaturePad } from "./signature-pad";
import { switchStep5Schema, type SwitchStep5Data, SWITCH_REASONS_MAP } from "@/lib/switch-schema";
import { StepNav } from "./switch-wizard";
import { careTypeLabel } from "@/lib/utils";
import type { SwitchRequestData } from "@/lib/switch-schema";
import type { Agency } from "@/types/database";

interface SwitchStep5Props {
  onComplete: (data: Partial<SwitchStep5Data>) => void;
  onBack: () => void;
  defaultValues: Partial<SwitchStep5Data>;
  formData: Partial<SwitchRequestData>;
  agency: Agency;
  saving: boolean;
  userName?: string | null;
}

const SERVICE_LABELS: Record<string, string> = {
  skilled_nursing: "Skilled Nursing",
  physical_therapy: "Physical Therapy",
  occupational_therapy: "Occupational Therapy",
  speech_therapy: "Speech Therapy",
  medical_social_work: "Medical Social Work",
  home_health_aide: "Home Health Aide",
  personal_care: "Personal Care",
  companion_care: "Companion Care",
  homemaker: "Homemaker Services",
  respite_care: "Respite Care",
  medication_reminders: "Medication Reminders",
  transportation: "Transportation",
  meal_preparation: "Meal Preparation",
};

export function SwitchStep5Sign({
  onComplete,
  onBack,
  defaultValues,
  formData,
  agency,
  saving,
  userName,
}: SwitchStep5Props) {
  const today = new Date().toISOString().split("T")[0];

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SwitchStep5Data>({
    resolver: zodResolver(switchStep5Schema),
    defaultValues: {
      signature_name: defaultValues.signature_name ?? userName ?? "",
      signature_date: today,
      signature_data: "",
      signature_method: "typed",
    },
  });

  const signatureName = watch("signature_name");

  function onSubmit(data: SwitchStep5Data) {
    onComplete(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest-400">Step 5 of 5</p>
        <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
          Review &amp; sign
        </h1>
        <p className="text-forest-500">
          Review your request summary and sign to submit. You cannot undo this after submission.
        </p>
      </div>

      {/* Request summary */}
      <div className="rounded-2xl bg-white border border-forest-200 overflow-hidden shadow-card">
        <div className="bg-forest-600 px-6 py-4 flex items-center gap-3">
          <FileText className="size-5 text-cream" />
          <p className="font-fraunces text-lg font-semibold text-white">Switch Request Summary</p>
        </div>

        <div className="divide-y divide-forest-100">
          {/* New agency */}
          <div className="px-6 py-4 flex items-start gap-3">
            <Building2 className="size-4 text-forest-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-forest-400 font-medium uppercase tracking-wide mb-1">New Agency</p>
              <p className="text-sm font-semibold text-forest-800">{agency.name}</p>
              <p className="text-xs text-forest-500">{agency.address_city}, PA</p>
            </div>
          </div>

          {/* Current agency */}
          {formData.current_agency_name && (
            <div className="px-6 py-4 flex items-start gap-3">
              <Building2 className="size-4 text-forest-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-forest-400 font-medium uppercase tracking-wide mb-1">Current Agency</p>
                <p className="text-sm text-forest-700">{formData.current_agency_name}</p>
              </div>
            </div>
          )}

          {/* Switch reason */}
          {formData.switch_reason && (
            <div className="px-6 py-4 flex items-start gap-3">
              <CheckCircle2 className="size-4 text-forest-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-forest-400 font-medium uppercase tracking-wide mb-1">Reason for Switch</p>
                <p className="text-sm text-forest-700">
                  {SWITCH_REASONS_MAP[formData.switch_reason] ?? formData.switch_reason}
                </p>
              </div>
            </div>
          )}

          {/* Care type & services */}
          {formData.care_type && (
            <div className="px-6 py-4 flex items-start gap-3">
              <Stethoscope className="size-4 text-forest-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-forest-400 font-medium uppercase tracking-wide mb-1">Care Requested</p>
                <p className="text-sm font-medium text-forest-800">{careTypeLabel(formData.care_type)}</p>
                {formData.services_requested && formData.services_requested.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.services_requested.map((s) => (
                      <span key={s} className="text-xs bg-forest-50 border border-forest-200 text-forest-600 px-2 py-0.5 rounded-full">
                        {SERVICE_LABELS[s] ?? s.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Requested start date */}
          {formData.requested_start_date && (
            <div className="px-6 py-4 flex items-start gap-3">
              <Calendar className="size-4 text-forest-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-forest-400 font-medium uppercase tracking-wide mb-1">Requested Start Date</p>
                <p className="text-sm text-forest-700">
                  {new Date(formData.requested_start_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Special instructions */}
          {formData.special_instructions && (
            <div className="px-6 py-4">
              <p className="text-xs text-forest-400 font-medium uppercase tracking-wide mb-1">Special Instructions</p>
              <p className="text-sm text-forest-700 italic">{formData.special_instructions}</p>
            </div>
          )}
        </div>
      </div>

      {/* E-signature */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-forest-100" />
          <p className="text-xs font-semibold uppercase tracking-widest text-forest-400">Electronic Signature</p>
          <div className="h-px flex-1 bg-forest-100" />
        </div>

        <SignaturePad
          legalName={userName ?? ""}
          onSignatureChange={({ method, signatureName, signatureData }) => {
            setValue("signature_name", signatureName, { shouldValidate: true });
            setValue("signature_method", method);
            setValue("signature_data", signatureData ?? "");
          }}
          error={errors.signature_name?.message}
        />

        {/* Signed date */}
        <div className="flex items-center justify-between text-xs text-forest-400 px-1">
          <span>Date: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          {signatureName && <span>Signed by: {signatureName}</span>}
        </div>
      </div>

      <StepNav
        onBack={onBack}
        isLast
        loading={saving}
        nextLabel="Submit request"
      />
    </form>
  );
}
