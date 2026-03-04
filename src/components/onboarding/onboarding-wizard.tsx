"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/ui/logo";
import { Stepper } from "@/components/ui/stepper";
import { saveOnboardingData, saveOnboardingDraft } from "@/lib/onboarding-actions";
import type { OnboardingData } from "@/lib/onboarding-schema";
import { ONBOARDING_STEPS } from "@/lib/onboarding-schema";

import { Step1Personal } from "./step-1-personal";
import { Step2Address } from "./step-2-address";
import { Step3Insurance } from "./step-3-insurance";
import { Step4CareNeeds } from "./step-4-care-needs";
import { Step5Situation } from "./step-5-situation";
import { OnboardingComplete } from "./onboarding-complete";

const TOTAL_STEPS = 5;


interface StepNavProps {
  onBack?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  loading?: boolean;
  nextLabel?: string;
}

export function StepNav({ onBack, isFirst = false, isLast = false, loading = false, nextLabel }: StepNavProps) {
  return (
    <div className="flex items-center justify-between pt-3">
      <Button type="button" variant="ghost" onClick={onBack} disabled={isFirst || loading} className="gap-1.5">
        <ArrowLeft className="size-4" /> Back
      </Button>
      <Button type="submit" disabled={loading} className="gap-1.5">
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        {nextLabel ?? (isLast ? "Finish" : "Continue")}
        {!loading ? <ArrowRight className="size-4" /> : null}
      </Button>
    </div>
  );
}

interface OnboardingWizardProps {
  userName?: string | null;
  initialData?: Partial<OnboardingData>;
}

export function OnboardingWizard({ userName, initialData }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [completed, setCompleted] = React.useState(false);

  const [formData, setFormData] = React.useState<Partial<OnboardingData>>({
    preferred_lang: "en",
    address_state: "PA",
    ...initialData,
  });

  const progress = ((currentStep) / TOTAL_STEPS) * 100;
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  function handleStepComplete(stepData: Partial<OnboardingData>) {
    const newData = { ...formData, ...stepData };
    setFormData(newData);

    if (isLastStep) {
      handleSubmit(newData as OnboardingData);
    } else {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSubmit(data: OnboardingData) {
    setSaving(true);
    setSaveError(null);
    const result = await saveOnboardingData(data);
    setSaving(false);

    if (result?.error) {
      setSaveError(result.error);
    } else {
      setCompleted(true);
    }
  }

  async function handleSaveExit() {
    setSaving(true);
    setSaveError(null);
    const result = await saveOnboardingDraft(formData);
    setSaving(false);

    if (result?.error) {
      setSaveError(result.error);
      return;
    }

    router.push("/dashboard");
  }

  if (completed) {
    return <OnboardingComplete userName={userName} data={formData} />;
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-forest-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex-1 max-w-xs">
            <Progress value={progress} />
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveExit}
            className="text-xs text-forest-400 hover:text-forest-600 transition-colors shrink-0 disabled:opacity-50"
          >
            Save & exit
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className="hidden sm:block">
          <Stepper steps={ONBOARDING_STEPS} currentStep={currentStep} />
        </div>
        <div className="sm:hidden text-sm text-forest-400 text-center">
          Step {currentStep + 1} of {TOTAL_STEPS} — {ONBOARDING_STEPS[currentStep].label}
        </div>

        {saveError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {saveError}
          </div>
        )}

        <div className="animate-slide-up">
          {currentStep === 0 && (
            <Step1Personal
              defaultValues={formData}
              onComplete={handleStepComplete}
            />
          )}

          {currentStep === 1 && (
            <Step2Address
              defaultValues={formData}
              onComplete={handleStepComplete}
              onBack={handleBack}
            />
          )}

          {currentStep === 2 && (
            <Step3Insurance
              defaultValues={formData}
              onComplete={handleStepComplete}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <Step4CareNeeds
              defaultValues={formData}
              onComplete={handleStepComplete}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <Step5Situation
              defaultValues={formData}
              onComplete={handleStepComplete}
              onBack={handleBack}
              saving={saving}
            />
          )}
        </div>

        <div className="sm:hidden flex items-center justify-between pt-2 border-t border-forest-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={currentStep === 0 || saving}
            className="gap-1"
          >
            <ArrowLeft className="size-4" /> Back
          </Button>

          <div className="text-xs text-forest-400">{currentStep + 1}/{TOTAL_STEPS}</div>

          <Button size="sm" disabled className="opacity-0 pointer-events-none gap-1">
            Next <ArrowRight className="size-4" />
          </Button>
        </div>

        {saving && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="rounded-2xl bg-white p-6 shadow-2xl flex items-center gap-3">
              <Loader2 className="size-5 animate-spin text-forest-600" />
              <span className="text-sm font-medium text-forest-700">Saving your information...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
