"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/ui/logo";
import { Stepper } from "@/components/ui/stepper";
import type { SwitchRequestData } from "@/lib/switch-schema";
import { SWITCH_STEPS } from "@/lib/switch-schema";
import type { Agency } from "@/types/database";

import { SwitchStep1Agency } from "./switch-step-1-agency";
import { SwitchStep2Situation } from "./switch-step-2-situation";
import { SwitchStep3Care } from "./switch-step-3-care";
import { SwitchStep4Consent } from "./switch-step-4-consent";
import { SwitchStep5Sign } from "./switch-step-5-sign";

interface SwitchWizardProps {
  agency: Agency;
  userName?: string | null;
}

const TOTAL_STEPS = 5;

export function SwitchWizard({ agency, userName }: SwitchWizardProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [redirecting, setRedirecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<Partial<SwitchRequestData>>({
    new_agency_id: agency.id,
  });

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  function handleStepComplete(stepData: Partial<SwitchRequestData>) {
    const newData = { ...formData, ...stepData };
    setFormData(newData);
    if (isLastStep) {
      handleCheckout(newData as SwitchRequestData);
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

  async function handleCheckout(data: SwitchRequestData) {
    setRedirecting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyId: agency.id,
          agencyName: agency.dba_name ?? agency.name,
          switchData: data,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? "Failed to start checkout");
      }
      // Redirect to Stripe Checkout
      window.location.href = json.url;
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
      setRedirecting(false);
    }
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
          <Link
            href="/agencies"
            className="text-xs text-forest-400 hover:text-forest-600 transition-colors shrink-0"
          >
            Back to search
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Step indicator */}
        <div className="hidden sm:block">
          <Stepper steps={SWITCH_STEPS} currentStep={currentStep} />
        </div>
        <div className="sm:hidden text-sm text-forest-400 text-center">
          Step {currentStep + 1} of {TOTAL_STEPS} — {SWITCH_STEPS[currentStep].label}
        </div>

        {/* Fee notice on last step */}
        {isLastStep && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">💳</span>
            <div>
              <p className="text-sm font-semibold text-amber-800">$97 coordination fee</p>
              <p className="text-xs text-amber-700">
                Clicking &quot;Submit &amp; Pay&quot; takes you to a secure Stripe checkout. Your switch request is created after payment completes.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Redirecting overlay */}
        {redirecting && (
          <div className="rounded-xl bg-forest-50 border border-forest-200 px-4 py-4 flex items-center gap-3">
            <Loader2 className="size-5 text-forest-600 animate-spin shrink-0" />
            <p className="text-sm text-forest-700">Redirecting to secure checkout…</p>
          </div>
        )}

        {/* Step content */}
        <div className="animate-slide-up">
          {currentStep === 0 && (
            <SwitchStep1Agency
              agency={agency}
              defaultValues={formData}
              onComplete={handleStepComplete}
            />
          )}
          {currentStep === 1 && (
            <SwitchStep2Situation
              defaultValues={formData}
              onComplete={handleStepComplete}
              onBack={handleBack}
            />
          )}
          {currentStep === 2 && (
            <SwitchStep3Care
              defaultValues={formData}
              onComplete={handleStepComplete}
              onBack={handleBack}
              agencyServices={agency.services_offered}
            />
          )}
          {currentStep === 3 && (
            <SwitchStep4Consent
              defaultValues={formData}
              onComplete={handleStepComplete}
              onBack={handleBack}
              agencyName={agency.name}
              currentAgencyName={formData.current_agency_name}
            />
          )}
          {currentStep === 4 && (
            <SwitchStep5Sign
              defaultValues={formData}
              formData={formData}
              onComplete={handleStepComplete}
              onBack={handleBack}
              agency={agency}
              saving={redirecting}
              userName={userName}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Shared step nav — exported for use by all step components
interface StepNavProps {
  onBack?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  loading?: boolean;
  nextLabel?: string;
  disabled?: boolean;
}

export function StepNav({ onBack, isFirst, isLast, loading, nextLabel, disabled }: StepNavProps) {
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
      <Button type="submit" size="lg" disabled={disabled || loading} className="min-w-[160px]">
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            {nextLabel ?? (isLast ? "Submit & Pay $97" : "Continue")}
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </div>
  );
}
