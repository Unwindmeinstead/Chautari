// All 67 Pennsylvania counties
export const PA_COUNTIES = [
  "Adams", "Allegheny", "Armstrong", "Beaver", "Bedford",
  "Berks", "Blair", "Bradford", "Bucks", "Butler",
  "Cambria", "Cameron", "Carbon", "Centre", "Chester",
  "Clarion", "Clearfield", "Clinton", "Columbia", "Crawford",
  "Cumberland", "Dauphin", "Delaware", "Elk", "Erie",
  "Fayette", "Forest", "Franklin", "Fulton", "Greene",
  "Huntingdon", "Indiana", "Jefferson", "Juniata", "Lackawanna",
  "Lancaster", "Lawrence", "Lebanon", "Lehigh", "Luzerne",
  "Lycoming", "McKean", "Mercer", "Mifflin", "Monroe",
  "Montgomery", "Montour", "Northampton", "Northumberland", "Perry",
  "Philadelphia", "Pike", "Potter", "Schuylkill", "Snyder",
  "Somerset", "Sullivan", "Susquehanna", "Tioga", "Union",
  "Venango", "Warren", "Washington", "Wayne", "Westmoreland",
  "Wyoming", "York",
] as const;

export type PACounty = typeof PA_COUNTIES[number];

// PA Medicaid (MA) managed care plans
export const PA_MEDICAID_PLANS = [
  { value: "amerihealth_caritas", label: "AmeriHealth Caritas PA" },
  { value: "geisinger_chn", label: "Geisinger Community Health Plan" },
  { value: "health_partners", label: "Health Partners Plans" },
  { value: "highmark_wholecare", label: "Highmark Wholecare" },
  { value: "molina", label: "Molina Healthcare of PA" },
  { value: "pa_health_wellness", label: "PA Health & Wellness" },
  { value: "united_community", label: "United Healthcare Community Plan" },
  { value: "upmc_for_you", label: "UPMC for You" },
  { value: "ffs", label: "Fee-for-Service (FFS / Traditional)" },
  { value: "unknown", label: "I'm not sure" },
] as const;

export const PA_WAIVER_PROGRAMS = [
  { value: "act_150", label: "Act 150" },
  { value: "attendant_care", label: "Attendant Care" },
  { value: "commcare", label: "CommCare Waiver" },
  { value: "obra", label: "OBRA Waiver" },
  { value: "pda", label: "PDA Waiver (Aging)" },
  { value: "pfds", label: "PFDS Waiver (Disability)" },
  { value: "lifc", label: "LIFC Waiver" },
  { value: "unknown", label: "I'm not sure which waiver" },
] as const;

// Home health services (skilled / Medicare/Medicaid)
export const HOME_HEALTH_SERVICES = [
  { value: "skilled_nursing", label: "Skilled Nursing", description: "Wound care, injections, medication management" },
  { value: "physical_therapy", label: "Physical Therapy", description: "Mobility, strength, balance" },
  { value: "occupational_therapy", label: "Occupational Therapy", description: "Daily living activities" },
  { value: "speech_therapy", label: "Speech Therapy", description: "Communication, swallowing" },
  { value: "medical_social_work", label: "Medical Social Work", description: "Community resources and counseling" },
  { value: "home_health_aide", label: "Home Health Aide (HHA)", description: "Personal care under nursing supervision" },
] as const;

// Home care / personal care services (non-skilled)
export const HOME_CARE_SERVICES = [
  { value: "personal_care", label: "Personal Care", description: "Bathing, dressing, grooming" },
  { value: "companion_care", label: "Companion Care", description: "Supervision, social interaction" },
  { value: "homemaker", label: "Homemaker Services", description: "Light housekeeping, laundry, meals" },
  { value: "respite_care", label: "Respite Care", description: "Temporary relief for family caregivers" },
  { value: "medication_reminders", label: "Medication Reminders", description: "Non-medical medication prompting" },
  { value: "transportation", label: "Transportation Assistance", description: "Appointments and errands" },
  { value: "meal_preparation", label: "Meal Preparation", description: "Planning and cooking meals" },
] as const;

// Reasons a patient may want to switch agencies
export const SWITCH_REASONS = [
  { value: "poor_quality", label: "Unsatisfied with care quality" },
  { value: "staff_consistency", label: "Inconsistent or unreliable staff" },
  { value: "communication", label: "Poor communication from agency" },
  { value: "scheduling", label: "Scheduling problems" },
  { value: "language", label: "Need care in my language" },
  { value: "moved", label: "I moved to a new area" },
  { value: "insurance_change", label: "My insurance changed" },
  { value: "no_agency_yet", label: "I don't have an agency yet" },
  { value: "other", label: "Other reason" },
] as const;

export type SwitchReasonValue = typeof SWITCH_REASONS[number]["value"];
