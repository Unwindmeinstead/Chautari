-- Block 5 migration: notifications table
-- Run in Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.notifications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type           TEXT NOT NULL DEFAULT 'system',
  title          TEXT NOT NULL,
  body           TEXT NOT NULL DEFAULT '',
  read_at        TIMESTAMPTZ,
  reference_id   UUID,
  reference_type TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
DROP POLICY IF EXISTS "user_own_notifications" ON public.notifications;
CREATE POLICY "user_own_notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx   ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_at_idx   ON public.notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);

-- Seed a welcome notification for existing users (optional)
-- INSERT INTO public.notifications (user_id, type, title, body)
-- SELECT id, 'system', 'Welcome to Chautari', 'Your account is ready. Complete your profile to start finding agencies.'
-- FROM auth.users;
