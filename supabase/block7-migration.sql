-- Block 7 migration: Secure messaging between patients and agency staff
-- Run in Supabase SQL editor

-- ── Conversations ──────────────────────────────────────────────────────────────
-- One conversation per switch_request (automatically created on request submit)
CREATE TABLE IF NOT EXISTS public.conversations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id       UUID NOT NULL UNIQUE REFERENCES public.switch_requests(id) ON DELETE CASCADE,
  patient_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id        UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),
  last_message_at  TIMESTAMPTZ,
  patient_unread   INT NOT NULL DEFAULT 0,
  agency_unread    INT NOT NULL DEFAULT 0
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Patient can read/write their own conversations
DROP POLICY IF EXISTS "patient_own_conversations" ON public.conversations;
CREATE POLICY "patient_own_conversations"
  ON public.conversations FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Agency staff can read conversations for their agency
DROP POLICY IF EXISTS "agency_staff_read_conversations" ON public.conversations;
CREATE POLICY "agency_staff_read_conversations"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = conversations.agency_id
        AND am.user_id = auth.uid()
        AND am.is_active = true
    )
  );

-- Agency staff can update (mark read / update unread counts)
DROP POLICY IF EXISTS "agency_staff_update_conversations" ON public.conversations;
CREATE POLICY "agency_staff_update_conversations"
  ON public.conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = conversations.agency_id
        AND am.user_id = auth.uid()
        AND am.is_active = true
    )
  );

CREATE INDEX IF NOT EXISTS conversations_request_id_idx  ON public.conversations(request_id);
CREATE INDEX IF NOT EXISTS conversations_patient_id_idx  ON public.conversations(patient_id);
CREATE INDEX IF NOT EXISTS conversations_agency_id_idx   ON public.conversations(agency_id);
CREATE INDEX IF NOT EXISTS conversations_last_message_idx ON public.conversations(last_message_at DESC NULLS LAST);

-- ── Messages ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role      TEXT NOT NULL CHECK (sender_role IN ('patient', 'agency_staff')),
  body             TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 4000),
  is_read          BOOLEAN NOT NULL DEFAULT false,
  read_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Patients can read messages in their conversations
DROP POLICY IF EXISTS "patient_read_own_messages" ON public.messages;
CREATE POLICY "patient_read_own_messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND c.patient_id = auth.uid()
    )
  );

-- Patients can send messages in their conversations
DROP POLICY IF EXISTS "patient_send_messages" ON public.messages;
CREATE POLICY "patient_send_messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND sender_role = 'patient'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND c.patient_id = auth.uid()
    )
  );

-- Agency staff can read messages in their agency's conversations
DROP POLICY IF EXISTS "agency_staff_read_messages" ON public.messages;
CREATE POLICY "agency_staff_read_messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      JOIN public.agency_members am ON am.agency_id = c.agency_id
      WHERE c.id = messages.conversation_id
        AND am.user_id = auth.uid()
        AND am.is_active = true
    )
  );

-- Agency staff can send messages
DROP POLICY IF EXISTS "agency_staff_send_messages" ON public.messages;
CREATE POLICY "agency_staff_send_messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND sender_role = 'agency_staff'
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      JOIN public.agency_members am ON am.agency_id = c.agency_id
      WHERE c.id = conversation_id
        AND am.user_id = auth.uid()
        AND am.is_active = true
    )
  );

-- Anyone in the conversation can mark messages as read
DROP POLICY IF EXISTS "mark_messages_read" ON public.messages;
CREATE POLICY "mark_messages_read"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (
          c.patient_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.agency_members am
            WHERE am.agency_id = c.agency_id
              AND am.user_id = auth.uid()
              AND am.is_active = true
          )
        )
    )
  );

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx       ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_unread_idx          ON public.messages(conversation_id, is_read) WHERE is_read = false;

-- ── Enable Realtime ────────────────────────────────────────────────────────────
-- Run these in the Supabase dashboard under Database > Replication > Tables
-- Or run these SQL commands:
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- ── Auto-create conversation on switch request submit ──────────────────────────
CREATE OR REPLACE FUNCTION create_conversation_for_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create when status moves to 'submitted'
  IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status = 'draft') THEN
    INSERT INTO public.conversations (request_id, patient_id, agency_id)
    VALUES (NEW.id, NEW.patient_id, NEW.new_agency_id)
    ON CONFLICT (request_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_request_submitted ON public.switch_requests;
CREATE TRIGGER on_request_submitted
  AFTER INSERT OR UPDATE ON public.switch_requests
  FOR EACH ROW EXECUTE FUNCTION create_conversation_for_request();

-- ── Auto-update conversation.last_message_at + unread counts ──────────────────
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
DECLARE
  v_patient_id UUID;
BEGIN
  SELECT patient_id INTO v_patient_id
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  IF NEW.sender_role = 'agency_staff' THEN
    -- Agency sent → increment patient's unread
    UPDATE public.conversations
    SET
      last_message_at = NEW.created_at,
      updated_at = now(),
      patient_unread = patient_unread + 1
    WHERE id = NEW.conversation_id;
  ELSE
    -- Patient sent → increment agency's unread
    UPDATE public.conversations
    SET
      last_message_at = NEW.created_at,
      updated_at = now(),
      agency_unread = agency_unread + 1
    WHERE id = NEW.conversation_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_sent ON public.messages;
CREATE TRIGGER on_message_sent
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();
