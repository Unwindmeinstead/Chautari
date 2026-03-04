import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    error?: string;
    label?: string;
    hint?: string;
  }
>(({ className, children, error, label, hint, id, ...props }, ref) => {
  const triggerId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={triggerId} className="block text-sm font-medium text-forest-700">
          {label}
          {props["aria-required"] && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <SelectPrimitive.Trigger
        ref={ref}
        id={triggerId}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border bg-white px-4 py-2.5 text-sm text-forest-800 transition-colors",
          "placeholder:text-forest-300",
          "focus:outline-none focus:ring-2 focus:ring-forest-600 focus:ring-offset-0 focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-forest-50",
          error
            ? "border-red-400 focus:ring-red-400"
            : "border-forest-200 hover:border-forest-300",
          className
        )}
        {...props}
      >
        {children}
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 text-forest-400 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
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
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-72 min-w-[8rem] overflow-hidden rounded-xl border border-forest-200 bg-white shadow-card-hover",
        "data-[state=open]:animate-fade-in data-[state=closed]:opacity-0",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1.5",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-3 pr-2 text-xs font-semibold text-forest-400 uppercase tracking-wider", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm text-forest-700 outline-none",
      "focus:bg-forest-50 focus:text-forest-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "data-[state=checked]:bg-forest-50 data-[state=checked]:text-forest-800 data-[state=checked]:font-medium",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-forest-600" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-forest-100", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
