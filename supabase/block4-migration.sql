-- Block 4 migration: Ensure switch_requests & e_signatures tables exist with correct columns
-- Run this in Supabase SQL editor if these tables weren't created in Block 1

-- =====================
-- switch_requests table
-- =====================
CREATE TABLE IF NOT EXISTS public.switch_requests (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  new_agency_id        UUID NOT NULL REFERENCES public.agencies(id),
  current_agency_id    UUID REFERENCES public.agencies(id),
  current_agency_name  TEXT,
  switch_reason        TEXT NOT NULL,
  care_type            TEXT NOT NULL,
  services_requested   TEXT[] NOT NULL DEFAULT '{}',
  requested_start_date DATE,
  special_instructions TEXT,
  status               TEXT NOT NULL DEFAULT 'submitted'
                         CHECK (status IN ('submitted','under_review','accepted','denied','completed','cancelled')),
  submitted_at         TIMESTAMPTZ DEFAULT now(),
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

-- Add columns if they don't exist (safe for existing tables)
ALTER TABLE public.switch_requests
  ADD COLUMN IF NOT EXISTS current_agency_name TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT now();

-- =====================
-- e_signatures table
-- =====================
CREATE TABLE IF NOT EXISTS public.e_signatures (
  id                               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id                       UUID NOT NULL REFERENCES public.switch_requests(id) ON DELETE CASCADE,
  signer_id                        UUID NOT NULL REFERENCES auth.users(id),
  signer_role                      TEXT NOT NULL DEFAULT 'patient'
                                     CHECK (signer_role IN ('patient','agency','admin')),
  full_name                        TEXT NOT NULL,
  signed_at                        TIMESTAMPTZ NOT NULL DEFAULT now(),
  signature_method                 TEXT NOT NULL DEFAULT 'typed'
                                     CHECK (signature_method IN ('typed','drawn')),
  signature_data                   TEXT,          -- base64 PNG for drawn
  consent_hipaa                    BOOLEAN NOT NULL DEFAULT false,
  consent_current_agency_notification BOOLEAN NOT NULL DEFAULT false,
  consent_terms                    BOOLEAN NOT NULL DEFAULT false,
  ip_address                       INET,
  created_at                       TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- RLS policies
-- =====================
ALTER TABLE public.switch_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.e_signatures    ENABLE ROW LEVEL SECURITY;

-- Patients can see their own requests
DROP POLICY IF EXISTS "patient_own_switch_requests" ON public.switch_requests;
CREATE POLICY "patient_own_switch_requests"
  ON public.switch_requests FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Patients can see their own signatures
DROP POLICY IF EXISTS "patient_own_e_signatures" ON public.e_signatures;
CREATE POLICY "patient_own_e_signatures"
  ON public.e_signatures FOR ALL
  USING (auth.uid() = signer_id)
  WITH CHECK (auth.uid() = signer_id);

-- =====================
-- Indexes
-- =====================
CREATE INDEX IF NOT EXISTS switch_requests_patient_id_idx ON public.switch_requests(patient_id);
CREATE INDEX IF NOT EXISTS switch_requests_agency_id_idx  ON public.switch_requests(new_agency_id);
CREATE INDEX IF NOT EXISTS switch_requests_status_idx     ON public.switch_requests(status);
CREATE INDEX IF NOT EXISTS e_signatures_request_id_idx    ON public.e_signatures(request_id);

-- =====================
-- updated_at trigger
-- =====================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_switch_requests_updated_at ON public.switch_requests;
CREATE TRIGGER set_switch_requests_updated_at
  BEFORE UPDATE ON public.switch_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
