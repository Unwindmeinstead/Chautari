import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center",
                index < steps.length - 1 && "flex-1"
              )}
            >
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 text-sm font-semibold",
                    isCompleted && "border-forest-600 bg-forest-600 text-white",
                    isCurrent && "border-forest-600 bg-white text-forest-600 shadow-[0_0_0_3px_rgba(26,61,43,0.15)]",
                    isUpcoming && "border-forest-200 bg-white text-forest-300"
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isCurrent && "text-forest-700",
                    isCompleted && "text-forest-500",
                    isUpcoming && "text-forest-300"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 mb-4 transition-all duration-300",
                    isCompleted ? "bg-forest-600" : "bg-forest-100"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
