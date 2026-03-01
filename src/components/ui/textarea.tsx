import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const charCount = typeof props.value === "string" ? props.value.length : 0;
    const maxLength = props.maxLength;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-forest-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "flex min-h-[100px] w-full rounded-xl border bg-white px-4 py-3 text-sm text-forest-800 transition-colors resize-y",
            "placeholder:text-forest-300",
            "focus:outline-none focus:ring-2 focus:ring-forest-600 focus:ring-offset-0 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-forest-50",
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-forest-200 hover:border-forest-300",
            className
          )}
          {...props}
        />
        <div className="flex items-start justify-between gap-2">
          <div>
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <svg className="size-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                </svg>
                {error}
              </p>
            )}
            {hint && !error && <p className="text-xs text-forest-400">{hint}</p>}
          </div>
          {maxLength && (
            <p className={cn("text-xs shrink-0", charCount > maxLength * 0.9 ? "text-amber-500" : "text-forest-300")}>
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
