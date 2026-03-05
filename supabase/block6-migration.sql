-- Block 6 migration: Agency members table + portal RLS
-- Run in Supabase SQL editor

-- ── agency_members ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agency_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id   UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner','admin','staff')),
  title       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  joined_at   TIMESTAMPTZ DEFAULT now(),
  invited_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (agency_id, user_id)
);

ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;

-- Staff can see their own membership
DROP POLICY IF EXISTS "members_read_own" ON public.agency_members;
CREATE POLICY "members_read_own"
  ON public.agency_members FOR SELECT
  USING (auth.uid() = user_id);

-- Staff can see other members of their agency
DROP POLICY IF EXISTS "members_read_same_agency" ON public.agency_members;
CREATE POLICY "members_read_same_agency"
  ON public.agency_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = agency_members.agency_id
        AND am.user_id = auth.uid()
        AND am.is_active = true
    )
  );

-- Only admins/owners can insert new members
DROP POLICY IF EXISTS "admins_insert_members" ON public.agency_members;
CREATE POLICY "admins_insert_members"
  ON public.agency_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = agency_members.agency_id
        AND am.user_id = auth.uid()
        AND am.role IN ('admin','owner')
        AND am.is_active = true
    )
  );

-- Admins/owners can update members in their agency
DROP POLICY IF EXISTS "admins_update_members" ON public.agency_members;
CREATE POLICY "admins_update_members"
  ON public.agency_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = agency_members.agency_id
        AND am.user_id = auth.uid()
        AND am.role IN ('admin','owner')
        AND am.is_active = true
    )
  );

CREATE INDEX IF NOT EXISTS agency_members_user_idx   ON public.agency_members(user_id);
CREATE INDEX IF NOT EXISTS agency_members_agency_idx ON public.agency_members(agency_id, is_active);

-- ── Updated_at trigger for agency_members ──────────────────────
CREATE OR REPLACE FUNCTION update_agency_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS agency_members_updated_at ON public.agency_members;
CREATE TRIGGER agency_members_updated_at
  BEFORE UPDATE ON public.agency_members
  FOR EACH ROW EXECUTE FUNCTION update_agency_members_updated_at();

-- ── Allow agency staff to read switch_requests for their agency ─
-- (agencies can see requests directed at them)
DROP POLICY IF EXISTS "agency_staff_read_requests" ON public.switch_requests;
CREATE POLICY "agency_staff_read_requests"
  ON public.switch_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = switch_requests.new_agency_id
        AND am.user_id = auth.uid()
        AND am.is_active = true
    )
  );

-- Agency staff can update status on requests to their agency
DROP POLICY IF EXISTS "agency_staff_update_request_status" ON public.switch_requests;
CREATE POLICY "agency_staff_update_request_status"
  ON public.switch_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = switch_requests.new_agency_id
        AND am.user_id = auth.uid()
        AND am.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = switch_requests.new_agency_id
        AND am.user_id = auth.uid()
        AND am.is_active = true
    )
  );

-- ── Allow agency admins to update their own agency profile ──────
DROP POLICY IF EXISTS "agency_admins_update_profile" ON public.agencies;
CREATE POLICY "agency_admins_update_profile"
  ON public.agencies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = agencies.id
        AND am.user_id = auth.uid()
        AND am.role IN ('admin','owner')
        AND am.is_active = true
    )
  );

-- ── Seed: add yourself as agency owner for testing ──────────────
-- Replace the UUIDs below with your actual user ID and agency ID.
-- Get them from: SELECT id FROM auth.users; and SELECT id FROM agencies LIMIT 5;
--
-- INSERT INTO public.agency_members (agency_id, user_id, role, title)
-- VALUES (
--   'YOUR_AGENCY_ID_HERE',
--   'YOUR_USER_ID_HERE',
--   'owner',
--   'Administrator'
-- )
-- ON CONFLICT (agency_id, user_id) DO NOTHING;
