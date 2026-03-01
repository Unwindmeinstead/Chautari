import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  label?: string;
  showValue?: boolean;
  color?: "forest" | "amber" | "green";
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, label, showValue = false, color = "forest", ...props }, ref) => {
  const trackColor = {
    forest: "bg-forest-100",
    amber: "bg-amber-100",
    green: "bg-green-100",
  }[color];

  const fillColor = {
    forest: "bg-forest-600",
    amber: "bg-amber-500",
    green: "bg-green-500",
  }[color];

  return (
    <div className="space-y-1">
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <p className="text-xs text-forest-500">{label}</p>}
          {showValue && <p className="text-xs font-medium text-forest-600">{value}%</p>}
        </div>
      )}
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full",
          trackColor,
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn("h-full w-full flex-1 transition-all duration-500 ease-out rounded-full", fillColor)}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
