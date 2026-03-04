"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/ui/logo";
import { Stepper } from "@/components/ui/stepper";
import { saveOnboardingData } from "@/lib/onboarding-actions";
import type { OnboardingData } from "@/lib/onboarding-schema";
import { ONBOARDING_STEPS } from "@/lib/onboarding-schema";

import { Step1Personal } from "./step-1-personal";
import { Step2Address } from "./step-2-address";
import { Step3Insurance } from "./step-3-insurance";
import { Step4CareNeeds } from "./step-4-care-needs";
import { Step5Situation } from "./step-5-situation";
import { OnboardingComplete } from "./onboarding-complete";

const TOTAL_STEPS = 5;

interface OnboardingWizardProps {
  userName?: string | null;
}

export function OnboardingWizard({ userName }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [completed, setCompleted] = React.useState(false);

  // Accumulated form data across steps
  const [formData, setFormData] = React.useState<Partial<OnboardingData>>({
    preferred_lang: "en",
    address_state: "PA",
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

  if (completed) {
    return <OnboardingComplete userName={userName} data={formData} />;
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-forest-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex-1 max-w-xs">
            <Progress value={progress} />
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="text-xs text-forest-400 hover:text-forest-600 transition-colors shrink-0"
          >
            Save & exit
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Step indicator */}
        <div className="hidden sm:block">
          <Stepper steps={ONBOARDING_STEPS} currentStep={currentStep} />
        </div>
        <div className="sm:hidden text-sm text-forest-400 text-center">
          Step {currentStep + 1} of {TOTAL_STEPS} — {ONBOARDING_STEPS[currentStep].label}
        </div>

        {/* Save error */}
        {saveError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {saveError}
          </div>
        )}

        {/* Step content */}
        <div className="animate-slide-up">
          {currentStep === 0 && (
            <Step1Personal
              defaultValues={formData}
              userName={userName}
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
      </div>
    </div>
  );
}

// Shared nav buttons used by each step
interface StepNavProps {
  onBack?: () => void;
  onNext?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  loading?: boolean;
  nextLabel?: string;
  disabled?: boolean;
}

export function StepNav({
  onBack,
  onNext,
  isFirst = false,
  isLast = false,
  loading = false,
  nextLabel,
  disabled = false,
}: StepNavProps) {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-forest-100 mt-6">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        disabled={isFirst}
        className={isFirst ? "invisible" : ""}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <Button
        type="submit"
        size="lg"
        disabled={disabled || loading}
        className="min-w-[140px]"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            {nextLabel ?? (isLast ? "Complete setup" : "Continue")}
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </div>
  );
}
