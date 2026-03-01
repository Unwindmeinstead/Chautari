import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface RadioCardGroupProps {
  options: RadioOption[];
  value?: string;
  onChange: (value: string) => void;
  name: string;
  label?: string;
  error?: string;
  columns?: 1 | 2 | 3;
}

export function RadioCardGroup({
  options,
  value,
  onChange,
  name,
  label,
  error,
  columns = 2,
}: RadioCardGroupProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
  };

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-medium text-forest-700">{label}</p>
      )}
      <div className={cn("grid gap-3", gridCols[columns])}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-200",
                "hover:border-forest-400 hover:bg-forest-50",
                isSelected
                  ? "border-forest-600 bg-forest-50 shadow-sm"
                  : "border-forest-200 bg-white"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />

              {/* Selected indicator */}
              <div
                className={cn(
                  "absolute right-3 top-3 h-5 w-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center",
                  isSelected
                    ? "border-forest-600 bg-forest-600"
                    : "border-forest-200 bg-white"
                )}
              >
                {isSelected && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>

              <div className="flex-1 pr-6 space-y-1">
                <div className="flex items-center gap-2">
                  {option.icon && (
                    <span className="text-forest-500">{option.icon}</span>
                  )}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-forest-800" : "text-forest-700"
                    )}
                  >
                    {option.label}
                  </span>
                  {option.badge && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                      {option.badge}
                    </span>
                  )}
                </div>
                {option.description && (
                  <p className="text-xs text-forest-400 leading-relaxed">
                    {option.description}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <svg className="size-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// Smaller inline radio buttons
interface InlineRadioProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (value: string) => void;
  name: string;
  label?: string;
}

export function InlineRadio({ options, value, onChange, name, label }: InlineRadioProps) {
  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-forest-700">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm border-2 transition-all duration-200",
                isSelected
                  ? "border-forest-600 bg-forest-600 text-white font-medium"
                  : "border-forest-200 bg-white text-forest-600 hover:border-forest-400"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}
