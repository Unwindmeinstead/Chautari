import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
  description?: string;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, description, id, ...props }, ref) => {
  const checkId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex items-start gap-3">
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkId}
        className={cn(
          "peer h-5 w-5 shrink-0 rounded-md border-2 border-forest-300 bg-white transition-all duration-150 mt-0.5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:bg-forest-600 data-[state=checked]:border-forest-600",
          "hover:border-forest-500",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-white")}>
          <Check className="h-3 w-3 stroke-[3]" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {(label || description) && (
        <div className="space-y-0.5 cursor-pointer" onClick={() => {
          const el = document.getElementById(checkId ?? "");
          if (el) el.click();
        }}>
          {label && (
            <label htmlFor={checkId} className="text-sm font-medium text-forest-700 cursor-pointer leading-tight">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-forest-400 leading-relaxed">{description}</p>
          )}
        </div>
      )}
    </div>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
