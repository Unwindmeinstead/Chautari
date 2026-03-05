-- ============================================================
-- Phase 1, Sprint 6: Caregiver Wage Submissions
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Create caregiver_submissions table
CREATE TABLE IF NOT EXISTS public.caregiver_submissions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id             uuid NOT NULL REFERENCES public.agencies(id),
  role                  text NOT NULL CHECK (role IN ('HHA','CNA','LPN','RN','PT','OT','SLP','MSW','PCA')),
  employment_type       text CHECK (employment_type IN ('full_time','part_time','prn')),
  actual_hourly_rate    numeric(5,2) NOT NULL
                        CHECK (actual_hourly_rate >= 7.25 AND actual_hourly_rate <= 75.00),
  years_at_agency       numeric(3,1),
  benefits_json         jsonb DEFAULT '{}',
  management_score      int CHECK (management_score BETWEEN 1 AND 5),
  training_score        int CHECK (training_score BETWEEN 1 AND 5),
  scheduling_score      int CHECK (scheduling_score BETWEEN 1 AND 5),
  comment_text          text CHECK (char_length(comment_text) <= 500),
  submitter_hash        text NOT NULL,
  moderation_status     text NOT NULL DEFAULT 'pending'
                        CHECK (moderation_status IN ('pending','approved','rejected','flagged')),
  rejection_reason      text,
  time_on_page_seconds  int,
  is_verified           boolean DEFAULT false,
  submitted_at          timestamptz NOT NULL DEFAULT now(),
  moderated_at          timestamptz,
  moderated_by          uuid REFERENCES auth.users(id)
);

-- 2. Add a week column for rate limiting (immutable derivation)
ALTER TABLE public.caregiver_submissions
  ADD COLUMN submission_week text
  GENERATED ALWAYS AS (to_char(submitted_at AT TIME ZONE 'UTC', 'IYYY-IW')) STORED;

-- Rate limiting: max 1 pending/approved submission per hash per agency per week
CREATE UNIQUE INDEX IF NOT EXISTS idx_caregiver_sub_rate_limit
  ON public.caregiver_submissions (submitter_hash, agency_id, submission_week)
  WHERE moderation_status IN ('approved', 'pending');

-- 3. RLS
ALTER TABLE public.caregiver_submissions ENABLE ROW LEVEL SECURITY;

-- Anon users can INSERT (submit wages)
CREATE POLICY "anon_submit_wages"
  ON public.caregiver_submissions
  FOR INSERT TO anon
  WITH CHECK (true);

-- Authenticated users can also INSERT
CREATE POLICY "auth_submit_wages"
  ON public.caregiver_submissions
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Only admins can read individual submissions (for moderation)
CREATE POLICY "admin_read_submissions"
  ON public.caregiver_submissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'chautari_admin'
    )
  );

-- Admins can update (moderate)
CREATE POLICY "admin_moderate_submissions"
  ON public.caregiver_submissions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'chautari_admin'
    )
  );

-- No deletes allowed
CREATE POLICY "submissions_no_delete"
  ON public.caregiver_submissions
  FOR DELETE TO authenticated
  USING (false);

-- 4. Aggregate view: safe for public consumption (k-anonymity, min 3 submissions)
CREATE OR REPLACE VIEW public.agency_wage_summary AS
SELECT
  agency_id,
  role,
  COUNT(*) AS submission_count,
  CASE WHEN COUNT(*) >= 3 THEN ROUND(AVG(actual_hourly_rate), 2) ELSE NULL END AS avg_hourly,
  CASE WHEN COUNT(*) >= 3 THEN MIN(actual_hourly_rate) ELSE NULL END AS min_hourly,
  CASE WHEN COUNT(*) >= 3 THEN MAX(actual_hourly_rate) ELSE NULL END AS max_hourly,
  CASE WHEN COUNT(*) >= 3 THEN ROUND(AVG(management_score), 1) ELSE NULL END AS avg_mgmt_score
FROM public.caregiver_submissions
WHERE moderation_status = 'approved'
GROUP BY agency_id, role;

-- 5. Index for fast agency lookups
CREATE INDEX IF NOT EXISTS idx_caregiver_sub_agency
  ON public.caregiver_submissions (agency_id, moderation_status);
