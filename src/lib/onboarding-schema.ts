import { z } from "zod";

// Step 1 — Personal info
export const step1Schema = z.object({
  full_name: z.string().min(2, "Please enter your full name").max(100),
  phone: z
    .string()
    .regex(/^(\+1)?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, "Please enter a valid US phone number")
    .optional()
    .or(z.literal("")),
  preferred_lang: z.enum(["en", "ne", "hi"]).default("en"),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date")
    .refine((dob) => {
      const date = new Date(dob);
      const now = new Date();
      const age = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age >= 18 && age <= 120;
    }, "You must be 18 or older to use Chautari"),
});

// Step 2 — Address / Location
export const step2Schema = z.object({
  address_line1: z.string().min(5, "Please enter your street address").max(200),
  address_line2: z.string().max(100).optional().or(z.literal("")),
  address_city: z.string().min(2, "Please enter your city").max(100),
  address_state: z.literal("PA", { errorMap: () => ({ message: "We currently only serve Pennsylvania" }) }),
  address_zip: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code"),
  address_county: z.string().min(1, "Please select your county"),
});

// Step 3 — Insurance / Payer info
export const step3Schema = z.object({
  payer_type: z.enum(["medicaid", "medicare", "private", "self_pay", "waiver"], {
    errorMap: () => ({ message: "Please select your insurance type" }),
  }),
  medicaid_plan: z.string().optional(),
  medicaid_id: z
    .string()
    .max(20)
    .optional()
    .or(z.literal("")),
}).superRefine((data, ctx) => {
  if (data.payer_type === "medicaid" && !data.medicaid_plan) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select your Medicaid plan",
      path: ["medicaid_plan"],
    });
  }
});

// Step 4 — Care needs
export const step4Schema = z.object({
  care_type: z.enum(["home_health", "home_care", "both"], {
    errorMap: () => ({ message: "Please select the type of care you need" }),
  }),
  care_needs: z.array(z.string()).min(1, "Please select at least one service you need"),
  has_physician_order: z.boolean().optional(),
  additional_notes: z.string().max(500).optional().or(z.literal("")),
});

// Step 5 — Current agency situation
export const step5Schema = z.object({
  has_current_agency: z.enum(["yes", "no", "unsure"]),
  current_agency_name: z.string().max(200).optional().or(z.literal("")),
  switch_reason: z.string().min(1, "Please tell us why you're looking for a new agency"),
  preferred_start_date: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((d) => {
      if (!d) return true;
      const date = new Date(d);
      return date >= new Date();
    }, "Start date must be in the future"),
});

// Full onboarding state
export const onboardingSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema);

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type OnboardingData = z.infer<typeof onboardingSchema>;

export const ONBOARDING_STEPS = [
  { id: "personal", label: "Personal Info" },
  { id: "address", label: "Location" },
  { id: "insurance", label: "Insurance" },
  { id: "care", label: "Care Needs" },
  { id: "situation", label: "Your Situation" },
] as const;

export type OnboardingStep = typeof ONBOARDING_STEPS[number]["id"];
