-- Block 9 migration: Chautari admin dashboard
-- Run in Supabase SQL editor

-- ── Ensure audit_logs table exists ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role  TEXT,
  action      TEXT NOT NULL,
  resource    TEXT NOT NULL,
  resource_id TEXT,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only chautari_admin can read audit logs
DROP POLICY IF EXISTS "admin_read_audit_logs" ON public.audit_logs;
CREATE POLICY "admin_read_audit_logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'chautari_admin'
    )
  );

-- Service role can insert (via server actions)
DROP POLICY IF EXISTS "service_insert_audit_logs" ON public.audit_logs;
CREATE POLICY "service_insert_audit_logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_id_idx   ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS audit_logs_resource_idx   ON public.audit_logs(resource, resource_id);

-- ── Add is_approved column to agencies if not present ─────────────────────────
ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false;

-- ── Admin RLS policies on existing tables ─────────────────────────────────────

-- Admins can read all profiles
DROP POLICY IF EXISTS "admin_read_all_profiles" ON public.profiles;
CREATE POLICY "admin_read_all_profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'chautari_admin'
    )
  );

-- Admins can update any profile (e.g., change role, deactivate)
DROP POLICY IF EXISTS "admin_update_profiles" ON public.profiles;
CREATE POLICY "admin_update_profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'chautari_admin'
    )
  );

-- Admins can read all agencies
DROP POLICY IF EXISTS "admin_read_all_agencies" ON public.agencies;
CREATE POLICY "admin_read_all_agencies"
  ON public.agencies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'chautari_admin'
    )
  );

-- Admins can update any agency
DROP POLICY IF EXISTS "admin_update_agencies" ON public.agencies;
CREATE POLICY "admin_update_agencies"
  ON public.agencies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'chautari_admin'
    )
  );

-- Admins can read all switch requests
DROP POLICY IF EXISTS "admin_read_all_requests" ON public.switch_requests;
CREATE POLICY "admin_read_all_requests"
  ON public.switch_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'chautari_admin'
    )
  );

-- Admins can update switch requests (assign case manager, add notes)
DROP POLICY IF EXISTS "admin_update_requests" ON public.switch_requests;
CREATE POLICY "admin_update_requests"
  ON public.switch_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'chautari_admin'
    )
  );

-- Admins can read all documents
DROP POLICY IF EXISTS "admin_read_all_documents" ON public.documents;
CREATE POLICY "admin_read_all_documents"
  ON public.documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'chautari_admin'
    )
  );

-- Admins can read all conversations
DROP POLICY IF EXISTS "admin_read_all_conversations" ON public.conversations;
CREATE POLICY "admin_read_all_conversations"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'chautari_admin'
    )
  );

-- ── Helper function: is_chautari_admin ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_chautari_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'chautari_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Promote a user to chautari_admin (run manually) ───────────────────────────
-- UPDATE public.profiles SET role = 'chautari_admin' WHERE id = '<your-user-id>';
