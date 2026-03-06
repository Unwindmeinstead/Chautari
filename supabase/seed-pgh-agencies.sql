-- ============================================================
-- CHAUTARI — Pittsburgh Agencies Data Seed
-- Run this in your Supabase SQL Editor
-- ============================================================

-- First add any missing columns to agencies table
ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS dba_name TEXT,
  ADD COLUMN IF NOT EXISTS pay_rates JSONB,
  ADD COLUMN IF NOT EXISTS benefits TEXT[],
  ADD COLUMN IF NOT EXISTS google_rating NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS google_review_count INTEGER,
  ADD COLUMN IF NOT EXISTS care_types TEXT[],
  ADD COLUMN IF NOT EXISTS payers_accepted TEXT[],
  ADD COLUMN IF NOT EXISTS services_offered TEXT[],
  ADD COLUMN IF NOT EXISTS languages_spoken TEXT[],
  ADD COLUMN IF NOT EXISTS service_counties TEXT[],
  ADD COLUMN IF NOT EXISTS is_verified_partner BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS medicare_quality_score NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS avg_response_hours NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT;

-- Now insert the agency data
INSERT INTO public.agencies (
  id, npi, name, dba_name, address, city, state, zip,
  phone, email, website, care_types, payers_accepted, services_offered, languages_spoken,
  service_counties, is_verified_partner, is_active, is_approved, medicare_quality_score,
  avg_response_hours, pay_rates, benefits, google_rating, google_review_count
) VALUES
(
  gen_random_uuid(), '1861498321', 'Bayada Home Health Care', 'Bayada', '150 North Radnor Chester Road', 'Pittsburgh', 'PA', '15222',
  '412-555-0101', 'pittsburgh@bayada.com', 'https://www.bayada.com', ARRAY['home_health', 'home_care'], ARRAY['medicare', 'medicaid', 'private', 'self_pay'], ARRAY['Skilled Nursing', 'Physical Therapy', 'Personal Care', 'Companion Care'], ARRAY['en'],
  ARRAY['Allegheny', 'Washington', 'Westmoreland'], true, true, true, 4.5,
  1, '{"HHA": "$16 - $20/hr", "RN": "$35 - $45/hr", "LPN": "$28 - $32/hr"}'::jsonb, ARRAY['Health, Dental & Vision', '401(k) Match', 'Paid Time Off', 'Tuition Reimbursement'], 4.6, 342
),
(
  gen_random_uuid(), '1922091811', 'Maxim Healthcare Services', 'Maxim', '300 Corporate Center Drive', 'Pittsburgh', 'PA', '15231',
  '412-555-0102', 'info@maximhealthcare.com', 'https://www.maximhealthcare.com', ARRAY['home_health', 'home_care'], ARRAY['medicare', 'medicaid', 'private', 'waiver'], ARRAY['Pediatric Care', 'Skilled Nursing', 'Respite Care', 'Behavioral Care'], ARRAY['en', 'hi'],
  ARRAY['Allegheny', 'Butler', 'Beaver'], true, true, true, 4.2,
  2, '{"HHA": "$15 - $19/hr", "RN": "$34 - $42/hr", "LPN": "$27 - $31/hr"}'::jsonb, ARRAY['Medical Insurance', 'Weekly Pay', 'Flexible Scheduling', 'Award Programs'], 4.4, 215
),
(
  gen_random_uuid(), '1427189923', 'Home Instead', NULL, '2112 East Carson Street', 'Pittsburgh', 'PA', '15203',
  '412-555-0103', 'care@homeinsteadpgh.com', 'https://www.homeinstead.com', ARRAY['home_care'], ARRAY['private', 'self_pay', 'waiver'], ARRAY['Personal Care', 'Alzheimers Care', 'Hospice Support', 'Light Housekeeping'], ARRAY['en'],
  ARRAY['Allegheny', 'Westmoreland'], true, true, true, NULL,
  1, '{"Caregiver": "$16 - $18/hr", "Weekend Premium": "+$2/hr"}'::jsonb, ARRAY['Paid Training', 'Mileage Reimbursement', 'Sign-on Bonus', '24/7 Support'], 4.8, 512
),
(
  gen_random_uuid(), '1740398271', 'Right at Home', NULL, '5423 Penn Avenue', 'Pittsburgh', 'PA', '15206',
  '412-555-0104', 'info@rightathomepgh.com', 'https://www.rightathome.net', ARRAY['home_care'], ARRAY['private', 'self_pay', 'waiver', 'medicaid'], ARRAY['Companion Care', 'Personal Care', 'Transitional Care', 'Respite Care'], ARRAY['en', 'hi'],
  ARRAY['Allegheny'], true, true, true, NULL,
  2, '{"Caregiver": "$15.50 - $18.50/hr", "HHA": "$17 - $20/hr"}'::jsonb, ARRAY['Caregiver Recognition', 'Paid Time Off', 'Health Plan', 'Career Advancement'], 4.7, 189
),
(
  gen_random_uuid(), '1356782910', 'Concordia Visiting Nurses', 'Concordia', '134 Marwood Road', 'Cabot', 'PA', '16023',
  '724-555-0105', 'admissions@concordiavn.org', 'https://www.concordiavn.org', ARRAY['home_health', 'both'], ARRAY['medicare', 'medicaid', 'private'], ARRAY['Skilled Nursing', 'Physical Therapy', 'Occupational Therapy', 'Speech Therapy'], ARRAY['en'],
  ARRAY['Allegheny', 'Butler', 'Armstrong'], false, true, true, 4.8,
  3, '{"HHA": "$16 - $21/hr", "RN": "$36 - $48/hr", "PT": "$45 - $55/hr"}'::jsonb, ARRAY['Retirement Plan', 'Christian Working Environment', 'Continuing Education', 'Excellent PTO'], 4.9, 87
),
(
  gen_random_uuid(), '1098472615', 'Visiting Angels', NULL, '1105 Washington Pike', 'Bridgeville', 'PA', '15017',
  '412-555-0106', 'care@visitingangelspgh.com', 'https://www.visitingangels.com', ARRAY['home_care'], ARRAY['private', 'self_pay'], ARRAY['Dementia Care', 'Palliative Care', 'End of Life Care', 'Social Care'], ARRAY['en'],
  ARRAY['Allegheny', 'Washington'], false, true, true, NULL,
  1, '{"Caregiver": "$16 - $19/hr"}'::jsonb, ARRAY['Bonus Programs', 'Paid Training', 'Flexible Hours'], 4.5, 142
),
(
  gen_random_uuid(), '1184937265', 'Gallagher Home Health Services', 'Gallagher', '1370 Washington Pike', 'Bridgeville', 'PA', '15017',
  '412-555-0107', 'intake@gallagherhhs.com', 'https://www.gallagherhhs.com', ARRAY['home_health', 'both'], ARRAY['medicare', 'medicaid', 'private', 'waiver'], ARRAY['Skilled Nursing', 'Therapy Services', 'Medical Social Work', 'Wound Care'], ARRAY['en'],
  ARRAY['Allegheny', 'Washington', 'Westmoreland', 'Fayette'], true, true, true, 4.6,
  2, '{"HHA": "$17 - $22/hr", "RN": "$35 - $46/hr"}'::jsonb, ARRAY['Comprehensive Benefits', '401k', 'PTO', 'Life Insurance'], 4.7, 104
),
(
  gen_random_uuid(), '1568472910', 'Interim HealthCare', 'Interim', '1789 South Braddock Ave', 'Pittsburgh', 'PA', '15218',
  '412-555-0108', 'info@interimpgh.com', 'https://www.interimhealthcare.com', ARRAY['home_health', 'home_care', 'both'], ARRAY['medicare', 'medicaid', 'private', 'self_pay', 'waiver'], ARRAY['Personal Care', 'Skilled Nursing', 'Therapy', 'Hospice'], ARRAY['en'],
  ARRAY['Allegheny', 'Westmoreland', 'Butler'], false, true, true, 4.1,
  3, '{"HHA": "$15.50 - $18.50/hr", "RN": "$33 - $42/hr"}'::jsonb, ARRAY['Health Insurance', 'Dental/Vision', 'Referral Bonuses'], 4.3, 165
),
(
  gen_random_uuid(), '1932847561', 'AHN Healthcare@Home', 'AHN', '500 Commonwealth Dr', 'Warrendale', 'PA', '15086',
  '800-555-0109', 'homehealth@ahn.org', 'https://www.ahn.org', ARRAY['home_health'], ARRAY['medicare', 'medicaid', 'private'], ARRAY['Skilled Nursing', 'Post-Surgical Care', 'Chronic Disease Management'], ARRAY['en', 'ne'],
  ARRAY['Allegheny', 'Butler', 'Washington', 'Westmoreland', 'Beaver'], true, true, true, 4.7,
  1, '{"HHA": "$17 - $23/hr", "RN": "$38 - $52/hr"}'::jsonb, ARRAY['Highmark Health Insurance', 'Retirement', 'Generous PTO', 'Tuition Asst.'], 4.8, 520
),
(
  gen_random_uuid(), '1841392847', 'UPMC Home Healthcare', 'UPMC', '200 Lothrop St', 'Pittsburgh', 'PA', '15213',
  '888-555-0110', 'homecare@upmc.edu', 'https://www.upmc.com', ARRAY['home_health'], ARRAY['medicare', 'medicaid', 'private'], ARRAY['Skilled Nursing', 'Disease Management', 'Rehab Therapies'], ARRAY['en'],
  ARRAY['Allegheny', 'Washington', 'Westmoreland', 'Butler', 'Fayette'], true, true, true, 4.6,
  1, '{"HHA": "$17.50 - $24/hr", "RN": "$39 - $55/hr"}'::jsonb, ARRAY['UPMC Health Plan', 'Defined Contribution Plan', 'Sign-on Bonus', 'PTO'], 4.7, 630
),
(
  gen_random_uuid(), '1258493021', 'Aurora Home Care', 'Aurora', '11520 Perry Hwy', 'Wexford', 'PA', '15090',
  '724-555-0111', 'info@aurorahomecare.com', 'https://www.aurorahomecare.com', ARRAY['home_care', 'home_health'], ARRAY['medicaid', 'waiver', 'private'], ARRAY['Personal Care', 'Skilled Nursing', 'Pediatric Care'], ARRAY['en'],
  ARRAY['Allegheny', 'Butler'], false, true, true, 4.0,
  2, '{"HHA": "$16 - $20/hr", "Caregiver": "$15 - $18/hr"}'::jsonb, ARRAY['Health Insurance', '401k', 'Paid Holidays', 'Weekly Pay'], 4.5, 120
);
