-- ============================================================
-- Phase 1, Sprint 7: Post-Switch Surveys + Data Foundation
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Post-switch surveys
CREATE TABLE IF NOT EXISTS public.post_switch_surveys (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  switch_request_id     uuid NOT NULL REFERENCES public.switch_requests(id) ON DELETE CASCADE,
  patient_id            uuid NOT NULL REFERENCES auth.users(id),
  origin_agency_id      uuid REFERENCES public.agencies(id),
  destination_agency_id uuid NOT NULL REFERENCES public.agencies(id),
  q1_better             boolean,        -- "Is your new agency better?"
  q2_recommend          boolean,        -- "Would you recommend them?"
  q3_comment            text CHECK (char_length(q3_comment) <= 1000),
  q4_leave_reason       text CHECK (q4_leave_reason IN (
    'poor_communication', 'missed_visits', 'caregiver_quality',
    'scheduling_issues', 'billing_problems', 'moved',
    'insurance_change', 'care_needs_changed', 'agency_closed',
    'other'
  )),
  status                text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'sent', 'completed', 'expired')),
  sent_at               timestamptz,
  responded_at          timestamptz,
  token                 text UNIQUE,    -- Unique token for public survey URL
  created_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.post_switch_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_read_own_surveys"
  ON public.post_switch_surveys FOR SELECT TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "anon_respond_via_token"
  ON public.post_switch_surveys FOR UPDATE TO anon
  USING (token IS NOT NULL)
  WITH CHECK (true);

CREATE POLICY "service_role_surveys"
  ON public.post_switch_surveys FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 2. Switch reason taxonomy (structured data from switch wizard)
CREATE TABLE IF NOT EXISTS public.switch_reason_data (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  switch_request_id     uuid NOT NULL REFERENCES public.switch_requests(id) ON DELETE CASCADE,
  origin_agency_id      uuid REFERENCES public.agencies(id),
  primary_reason        text NOT NULL CHECK (primary_reason IN (
    'poor_communication', 'missed_visits', 'caregiver_quality',
    'scheduling_issues', 'billing_problems', 'moved',
    'insurance_change', 'care_needs_changed', 'agency_closed',
    'response_time', 'safety_concern', 'other'
  )),
  secondary_reason      text,
  free_text             text CHECK (char_length(free_text) <= 500),
  created_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.switch_reason_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_insert_switch_reasons"
  ON public.switch_reason_data FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "service_role_switch_reasons"
  ON public.switch_reason_data FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 3. Data freshness tracking (for The Data Brain)
CREATE TABLE IF NOT EXISTS public.data_freshness_log (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id             uuid NOT NULL REFERENCES public.agencies(id),
  field_name            text NOT NULL,
  last_confirmed_at     timestamptz NOT NULL DEFAULT now(),
  source                text NOT NULL CHECK (source IN (
    'npi_registry', 'cms_star_rating', 'google_places',
    'caregiver_submission', 'agency_self_report', 'admin_manual',
    'pa_doh_license', 'post_switch_survey', 'indeed_scrape'
  )),
  confidence_score      numeric(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  previous_value        text,
  new_value             text,
  created_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.data_freshness_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_freshness"
  ON public.data_freshness_log FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'chautari_admin'
    )
  );

CREATE POLICY "service_role_freshness"
  ON public.data_freshness_log FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_freshness_agency ON public.data_freshness_log(agency_id);
CREATE INDEX IF NOT EXISTS idx_freshness_stale ON public.data_freshness_log(agency_id, field_name, last_confirmed_at);

-- 4. Data alerts (triggered when data quality drops)
CREATE TABLE IF NOT EXISTS public.data_alerts (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id             uuid NOT NULL REFERENCES public.agencies(id),
  alert_type            text NOT NULL CHECK (alert_type IN (
    'npi_expired', 'license_lapsed', 'cms_score_drop',
    'google_rating_drop', 'negative_survey_spike', 'data_stale',
    'caregiver_pay_outlier', 'missed_visit_report'
  )),
  severity              text NOT NULL DEFAULT 'info'
                        CHECK (severity IN ('info', 'warning', 'critical')),
  trigger_data_json     jsonb DEFAULT '{}',
  triggered_at          timestamptz NOT NULL DEFAULT now(),
  resolved_at           timestamptz,
  resolved_by           uuid REFERENCES auth.users(id),
  resolution_notes      text
);

ALTER TABLE public.data_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_alerts"
  ON public.data_alerts FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'chautari_admin'
    )
  );

CREATE POLICY "service_role_alerts"
  ON public.data_alerts FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_alerts_agency ON public.data_alerts(agency_id);
CREATE INDEX IF NOT EXISTS idx_alerts_unresolved ON public.data_alerts(agency_id) WHERE resolved_at IS NULL;
