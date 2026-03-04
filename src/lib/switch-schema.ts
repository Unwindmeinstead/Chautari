import { z } from "zod";

// Step 1 — Confirm agency
export const switchStep1Schema = z.object({
  new_agency_id: z.string().uuid("Invalid agency"),
  // Confirmed by the user explicitly
  confirmed_agency: z.boolean().refine((v) => v === true, {
    message: "Please confirm your agency selection",
  }),
});

// Step 2 — Current situation
export const switchStep2Schema = z.object({
  has_current_agency: z.enum(["yes", "no", "unsure"]),
  current_agency_id: z.string().uuid().optional().or(z.literal("")),
  current_agency_name: z.string().max(200).optional().or(z.literal("")),
  switch_reason: z.string().min(1, "Please select a reason for switching"),
  switch_reason_detail: z.string().max(500).optional().or(z.literal("")),
});

// Step 3 — Care details & effective date
export const switchStep3Schema = z
  .object({
    care_type: z.enum(["home_health", "home_care", "both"], {
      errorMap: () => ({ message: "Please select care type" }),
    }),
    services_requested: z
      .array(z.string())
      .min(1, "Please select at least one service"),
    requested_start_date: z
      .string()
      .min(1, "Please select a start date")
      .refine((d) => new Date(d) >= new Date(), "Start date must be in the future"),
    special_instructions: z.string().max(1000).optional().or(z.literal("")),
  });

// Step 4 — HIPAA authorization & consents
export const switchStep4Schema = z.object({
  consent_hipaa: z.boolean().refine((v) => v === true, {
    message: "You must authorize release of your health information",
  }),
  consent_current_agency_notification: z.boolean().refine((v) => v === true, {
    message: "You must acknowledge that your current agency will be notified",
  }),
  consent_terms: z.boolean().refine((v) => v === true, {
    message: "You must accept the terms of service",
  }),
  understands_timeline: z.boolean().refine((v) => v === true, {
    message: "Please acknowledge the expected timeline",
  }),
});

// Step 5 — E-signature
export const switchStep5Schema = z.object({
  signature_name: z
    .string()
    .min(2, "Please type your full legal name as your signature")
    .max(100),
  signature_date: z.string(), // auto-filled to today
  // Base64 SVG string from the canvas — optional if typed sig is provided
  signature_data: z.string().optional().or(z.literal("")),
  signature_method: z.enum(["typed", "drawn"]),
});

// Combined type for the whole wizard
export const switchRequestSchema = switchStep1Schema
  .merge(switchStep2Schema)
  .merge(switchStep3Schema)
  .merge(switchStep4Schema)
  .merge(switchStep5Schema);

export type SwitchStep1Data = z.infer<typeof switchStep1Schema>;
export type SwitchStep2Data = z.infer<typeof switchStep2Schema>;
export type SwitchStep3Data = z.infer<typeof switchStep3Schema>;
export type SwitchStep4Data = z.infer<typeof switchStep4Schema>;
export type SwitchStep5Data = z.infer<typeof switchStep5Schema>;
export type SwitchRequestData = z.infer<typeof switchRequestSchema>;

export const SWITCH_STEPS = [
  { id: "agency", label: "Agency" },
  { id: "situation", label: "Situation" },
  { id: "care", label: "Care Details" },
  { id: "consent", label: "Consent" },
  { id: "sign", label: "Sign" },
] as const;

export const SWITCH_REASONS_MAP: Record<string, string> = {
  poor_quality: "Unsatisfied with care quality",
  staff_consistency: "Inconsistent or unreliable staff",
  communication: "Poor communication from agency",
  scheduling: "Scheduling problems",
  language: "Need care in my language",
  moved: "I moved to a new area",
  insurance_change: "My insurance changed",
  no_agency_yet: "I don't have an agency yet",
  other: "Other reason",
};
