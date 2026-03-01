-- Block 8 migration: Document upload + e-signature management
-- Run in Supabase SQL editor

-- ── Documents table ────────────────────────────────────────────────────────────
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
  file_path          TEXT NOT NULL,           -- storage path: documents/{request_id}/{uuid}/{filename}
  file_size_bytes    BIGINT,
  mime_type          TEXT,
  requires_signature BOOLEAN NOT NULL DEFAULT false,
  is_signed          BOOLEAN NOT NULL DEFAULT false,
  signed_at          TIMESTAMPTZ,
  signed_by          UUID REFERENCES auth.users(id),
  typed_name         TEXT,                    -- printed name used in e-signature
  signature_checksum TEXT,                    -- SHA-256 of (doc_id + signer_id + typed_name + timestamp)
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Patients can see documents on their own requests
DROP POLICY IF EXISTS "patient_read_own_docs" ON public.documents;
CREATE POLICY "patient_read_own_docs"
  ON public.documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.switch_requests sr
      WHERE sr.id = documents.request_id
        AND sr.patient_id = auth.uid()
    )
  );

-- Patients can upload docs to their own requests
DROP POLICY IF EXISTS "patient_upload_docs" ON public.documents;
CREATE POLICY "patient_upload_docs"
  ON public.documents FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by
    AND uploader_role = 'patient'
    AND EXISTS (
      SELECT 1 FROM public.switch_requests sr
      WHERE sr.id = request_id
        AND sr.patient_id = auth.uid()
    )
  );

-- Patients can update (sign) docs on their own requests
DROP POLICY IF EXISTS "patient_sign_docs" ON public.documents;
CREATE POLICY "patient_sign_docs"
  ON public.documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.switch_requests sr
      WHERE sr.id = documents.request_id
        AND sr.patient_id = auth.uid()
    )
  );

-- Agency staff can read docs for requests at their agency
DROP POLICY IF EXISTS "agency_staff_read_docs" ON public.documents;
CREATE POLICY "agency_staff_read_docs"
  ON public.documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.switch_requests sr
      JOIN public.agency_members am ON am.agency_id = sr.new_agency_id
      WHERE sr.id = documents.request_id
        AND am.user_id = auth.uid()
        AND am.is_active = true
    )
  );

-- Agency staff can upload docs to requests at their agency
DROP POLICY IF EXISTS "agency_staff_upload_docs" ON public.documents;
CREATE POLICY "agency_staff_upload_docs"
  ON public.documents FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by
    AND uploader_role = 'agency_staff'
    AND EXISTS (
      SELECT 1
      FROM public.switch_requests sr
      JOIN public.agency_members am ON am.agency_id = sr.new_agency_id
      WHERE sr.id = request_id
        AND am.user_id = auth.uid()
        AND am.is_active = true
    )
  );

-- Agency staff can update (request signature, mark signed) docs
DROP POLICY IF EXISTS "agency_staff_update_docs" ON public.documents;
CREATE POLICY "agency_staff_update_docs"
  ON public.documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.switch_requests sr
      JOIN public.agency_members am ON am.agency_id = sr.new_agency_id
      WHERE sr.id = documents.request_id
        AND am.user_id = auth.uid()
        AND am.is_active = true
    )
  );

CREATE INDEX IF NOT EXISTS documents_request_id_idx  ON public.documents(request_id);
CREATE INDEX IF NOT EXISTS documents_uploaded_by_idx ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS documents_unsigned_idx    ON public.documents(request_id, is_signed) WHERE requires_signature = true;

-- Updated_at trigger
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

-- ── Supabase Storage bucket ────────────────────────────────────────────────────
-- Create this in the Supabase dashboard: Storage → New bucket
-- Name: "documents"
-- Public: FALSE (private, signed URLs only)
-- File size limit: 10MB
-- Allowed MIME types: application/pdf, image/jpeg, image/png, image/webp

-- Storage RLS policies (run after creating the bucket in dashboard):

-- Patients can upload to their own request folder
-- INSERT policy on storage.objects WHERE bucket = 'documents':
--   (auth.uid()::text = (storage.foldername(name))[2])
--   This checks the path structure: documents/{request_id}/{user_id}/{filename}

-- ── Storage policies (SQL form) ────────────────────────────────────────────────
-- Run AFTER creating the 'documents' bucket in the Supabase dashboard.

-- Allow authenticated users to upload
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760,  -- 10MB
  ARRAY['application/pdf','image/jpeg','image/png','image/webp','image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Patients upload: path must start with their user ID folder
DROP POLICY IF EXISTS "patient_upload_storage" ON storage.objects;
CREATE POLICY "patient_upload_storage"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
  );

-- Authenticated users can read their own documents
DROP POLICY IF EXISTS "auth_read_storage" ON storage.objects;
CREATE POLICY "auth_read_storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
  );

-- Users can delete their own uploads
DROP POLICY IF EXISTS "auth_delete_own_storage" ON storage.objects;
CREATE POLICY "auth_delete_own_storage"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
