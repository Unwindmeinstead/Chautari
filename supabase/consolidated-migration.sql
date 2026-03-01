-- ============================================================
-- CHAUTARI — Consolidated Migration (Blocks 4–9)
-- Run this ONCE in Supabase SQL Editor.
-- Safe to re-run (all statements are idempotent).
-- ============================================================


-- ── 1. SWITCH REQUESTS ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.switch_requests (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  new_agency_id             UUID NOT NULL REFERENCES public.agencies(id),
  current_agency_id         UUID REFERENCES public.agencies(id),
  current_agency_name       TEXT,
  care_type                 TEXT NOT NULL,
  payer_type                TEXT,
  services_requested        TEXT[] NOT NULL DEFAULT '{}',
  reason_for_switch         TEXT,
  switch_reason             TEXT,            -- legacy alias kept for compatibility
  requested_start_date      DATE,
  special_instructions      TEXT,
  internal_notes            TEXT,
  chautari_case_manager_id  UUID REFERENCES auth.users(id),
  status                    TEXT NOT NULL DEFAULT 'submitted'
                              CHECK (status IN ('submitted','under_review','accepted','denied','completed','cancelled')),
  submitted_at              TIMESTAMPTZ DEFAULT now(),
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now()
);

-- Add any missing columns safely
ALTER TABLE public.switch_requests
  ADD COLUMN IF NOT EXISTS current_agency_name      TEXT,
  ADD COLUMN IF NOT EXISTS payer_type               TEXT,
  ADD COLUMN IF NOT EXISTS reason_for_switch        TEXT,
  ADD COLUMN IF NOT EXISTS switch_reason            TEXT,
  ADD COLUMN IF NOT EXISTS internal_notes           TEXT,
  ADD COLUMN IF NOT EXISTS chautari_case_manager_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS submitted_at             TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.switch_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patient_own_switch_requests" ON public.switch_requests;
CREATE POLICY "patient_own_switch_requests"
  ON public.switch_requests FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE INDEX IF NOT EXISTS switch_requests_patient_id_idx ON public.switch_requests(patient_id);
CREATE INDEX IF NOT EXISTS switch_requests_agency_id_idx  ON public.switch_requests(new_agency_id);
CREATE INDEX IF NOT EXISTS switch_requests_status_idx     ON public.switch_requests(status);

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


-- ── 2. E-SIGNATURES ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.e_signatures (
  id                                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id                           UUID NOT NULL REFERENCES public.switch_requests(id) ON DELETE CASCADE,
  signer_id                            UUID NOT NULL REFERENCES auth.users(id),
  signer_role                          TEXT NOT NULL DEFAULT 'patient'
                                         CHECK (signer_role IN ('patient','agency','admin')),
  full_name                            TEXT NOT NULL,
  signed_at                            TIMESTAMPTZ NOT NULL DEFAULT now(),
  signature_method                     TEXT NOT NULL DEFAULT 'typed'
                                         CHECK (signature_method IN ('typed','drawn')),
  signature_data                       TEXT,
  consent_hipaa                        BOOLEAN NOT NULL DEFAULT false,
  consent_current_agency_notification  BOOLEAN NOT NULL DEFAULT false,
  consent_terms                        BOOLEAN NOT NULL DEFAULT false,
  ip_address                           INET,
  created_at                           TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.e_signatures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patient_own_e_signatures" ON public.e_signatures;
CREATE POLICY "patient_own_e_signatures"
  ON public.e_signatures FOR ALL
  USING (auth.uid() = signer_id)
  WITH CHECK (auth.uid() = signer_id);

CREATE INDEX IF NOT EXISTS e_signatures_request_id_idx ON public.e_signatures(request_id);


-- ── 3. NOTIFICATIONS ────────────────────────────────────────────────────────────

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

DROP POLICY IF EXISTS "user_own_notifications" ON public.notifications;
CREATE POLICY "user_own_notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx    ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_at_idx    ON public.notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);


-- ── 4. AGENCY MEMBERS ───────────────────────────────────────────────────────────

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

DROP POLICY IF EXISTS "members_read_own" ON public.agency_members;
CREATE POLICY "members_read_own"
  ON public.agency_members FOR SELECT
  USING (auth.uid() = user_id);

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

-- Agency staff can read switch requests directed at their agency
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


-- ── 5. CONVERSATIONS + MESSAGES ─────────────────────────────────────────────────

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

DROP POLICY IF EXISTS "patient_own_conversations" ON public.conversations;
CREATE POLICY "patient_own_conversations"
  ON public.conversations FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

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

CREATE INDEX IF NOT EXISTS conversations_request_id_idx   ON public.conversations(request_id);
CREATE INDEX IF NOT EXISTS conversations_patient_id_idx   ON public.conversations(patient_id);
CREATE INDEX IF NOT EXISTS conversations_agency_id_idx    ON public.conversations(agency_id);
CREATE INDEX IF NOT EXISTS conversations_last_message_idx ON public.conversations(last_message_at DESC NULLS LAST);

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

-- Enable Realtime for messaging
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Auto-create conversation when a request is submitted
CREATE OR REPLACE FUNCTION create_conversation_for_request()
RETURNS TRIGGER AS $$
BEGIN
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

-- Auto-update last_message_at and unread counts
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sender_role = 'agency_staff' THEN
    UPDATE public.conversations
    SET last_message_at = NEW.created_at, updated_at = now(), patient_unread = patient_unread + 1
    WHERE id = NEW.conversation_id;
  ELSE
    UPDATE public.conversations
    SET last_message_at = NEW.created_at, updated_at = now(), agency_unread = agency_unread + 1
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_sent ON public.messages;
CREATE TRIGGER on_message_sent
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();


-- ── 6. DOCUMENTS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.documents (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id         UUID NOT NULL REFERENCES public.switch_requests(id) ON DELETE CASCADE,
  uploaded_by        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  uploader_role      TEXT NOT NULL CHECK (uploader_role IN ('patient', 'agency_staff')),
  doc_type           TEXT NOT NULL CHECK (doc_type IN (
                       'insurance_card','id_document','prior_auth',
                       'physician_order','discharge_summary','care_plan','other'
                     )),
  display_name       TEXT NOT NULL,
  file_name          TEXT NOT NULL,
  file_path          TEXT NOT NULL,
  file_size_bytes    BIGINT,
  mime_type          TEXT,
  requires_signature BOOLEAN NOT NULL DEFAULT false,
  is_signed          BOOLEAN NOT NULL DEFAULT false,
  signed_at          TIMESTAMPTZ,
  signed_by          UUID REFERENCES auth.users(id),
  typed_name         TEXT,
  signature_checksum TEXT,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patient_read_own_docs" ON public.documents;
CREATE POLICY "patient_read_own_docs"
  ON public.documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.switch_requests sr
      WHERE sr.id = documents.request_id AND sr.patient_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "patient_upload_docs" ON public.documents;
CREATE POLICY "patient_upload_docs"
  ON public.documents FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by AND uploader_role = 'patient'
    AND EXISTS (
      SELECT 1 FROM public.switch_requests sr
      WHERE sr.id = request_id AND sr.patient_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "patient_sign_docs" ON public.documents;
CREATE POLICY "patient_sign_docs"
  ON public.documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.switch_requests sr
      WHERE sr.id = documents.request_id AND sr.patient_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "agency_staff_read_docs" ON public.documents;
CREATE POLICY "agency_staff_read_docs"
  ON public.documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.switch_requests sr
      JOIN public.agency_members am ON am.agency_id = sr.new_agency_id
      WHERE sr.id = documents.request_id AND am.user_id = auth.uid() AND am.is_active = true
    )
  );

DROP POLICY IF EXISTS "agency_staff_upload_docs" ON public.documents;
CREATE POLICY "agency_staff_upload_docs"
  ON public.documents FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by AND uploader_role = 'agency_staff'
    AND EXISTS (
      SELECT 1
      FROM public.switch_requests sr
      JOIN public.agency_members am ON am.agency_id = sr.new_agency_id
      WHERE sr.id = request_id AND am.user_id = auth.uid() AND am.is_active = true
    )
  );

DROP POLICY IF EXISTS "agency_staff_update_docs" ON public.documents;
CREATE POLICY "agency_staff_update_docs"
  ON public.documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.switch_requests sr
      JOIN public.agency_members am ON am.agency_id = sr.new_agency_id
      WHERE sr.id = documents.request_id AND am.user_id = auth.uid() AND am.is_active = true
    )
  );

CREATE INDEX IF NOT EXISTS documents_request_id_idx  ON public.documents(request_id);
CREATE INDEX IF NOT EXISTS documents_uploaded_by_idx ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS documents_unsigned_idx    ON public.documents(request_id, is_signed) WHERE requires_signature = true;

CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS documents_updated_at ON public.documents;
CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_documents_updated_at();

-- Storage bucket for documents (private, 10MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 'documents', false, 10485760,
  ARRAY['application/pdf','image/jpeg','image/png','image/webp','image/heic']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "patient_upload_storage" ON storage.objects;
CREATE POLICY "patient_upload_storage"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "auth_read_storage" ON storage.objects;
CREATE POLICY "auth_read_storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "auth_delete_own_storage" ON storage.objects;
CREATE POLICY "auth_delete_own_storage"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ── 7. AUDIT LOGS + ADMIN ───────────────────────────────────────────────────────

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

DROP POLICY IF EXISTS "admin_read_audit_logs" ON public.audit_logs;
CREATE POLICY "admin_read_audit_logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'chautari_admin'
    )
  );

DROP POLICY IF EXISTS "service_insert_audit_logs" ON public.audit_logs;
CREATE POLICY "service_insert_audit_logs"
  ON public.audit_logs FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_id_idx   ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS audit_logs_resource_idx   ON public.audit_logs(resource, resource_id);

-- Add is_approved to agencies
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false;

-- Admin policies
DROP POLICY IF EXISTS "admin_read_all_profiles" ON public.profiles;
CREATE POLICY "admin_read_all_profiles"
  ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'chautari_admin'));

DROP POLICY IF EXISTS "admin_update_profiles" ON public.profiles;
CREATE POLICY "admin_update_profiles"
  ON public.profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'chautari_admin'));

DROP POLICY IF EXISTS "admin_read_all_agencies" ON public.agencies;
CREATE POLICY "admin_read_all_agencies"
  ON public.agencies FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'chautari_admin'));

DROP POLICY IF EXISTS "admin_update_agencies" ON public.agencies;
CREATE POLICY "admin_update_agencies"
  ON public.agencies FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'chautari_admin'));

DROP POLICY IF EXISTS "admin_read_all_requests" ON public.switch_requests;
CREATE POLICY "admin_read_all_requests"
  ON public.switch_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'chautari_admin'));

DROP POLICY IF EXISTS "admin_update_requests" ON public.switch_requests;
CREATE POLICY "admin_update_requests"
  ON public.switch_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'chautari_admin'));

DROP POLICY IF EXISTS "admin_read_all_documents" ON public.documents;
CREATE POLICY "admin_read_all_documents"
  ON public.documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'chautari_admin'));

DROP POLICY IF EXISTS "admin_read_all_conversations" ON public.conversations;
CREATE POLICY "admin_read_all_conversations"
  ON public.conversations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'chautari_admin'));

CREATE OR REPLACE FUNCTION public.is_chautari_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'chautari_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ── DONE ────────────────────────────────────────────────────────────────────────
-- After this succeeds:
-- 1. Go to Supabase Dashboard → Authentication → URL Configuration
--    Set Site URL and add your Vercel URL to Redirect URLs
-- 2. Promote yourself to admin:
--    UPDATE public.profiles SET role = 'chautari_admin' WHERE id = 'your-uuid';
