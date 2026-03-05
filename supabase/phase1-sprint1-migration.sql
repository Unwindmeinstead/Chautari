-- ============================================================
-- Phase 1, Sprint 1: Payment Processing
-- Adds switch_payments table + pending_payment status
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Add pending_payment to switch status enum
ALTER TYPE public.switch_status ADD VALUE IF NOT EXISTS 'pending_payment' BEFORE 'submitted';

-- 2. Create switch_payments table
CREATE TABLE IF NOT EXISTS public.switch_payments (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  switch_request_id       uuid NOT NULL REFERENCES public.switch_requests(id) ON DELETE CASCADE,
  patient_id              uuid NOT NULL REFERENCES auth.users(id),
  stripe_checkout_session_id text,
  stripe_payment_intent_id   text,
  amount_cents            integer NOT NULL DEFAULT 9700,
  currency                text NOT NULL DEFAULT 'usd',
  status                  text NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'cancelled')),
  paid_at                 timestamptz,
  refunded_at             timestamptz,
  refund_reason           text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_payment_per_switch UNIQUE (switch_request_id)
);

-- 3. RLS: patients can only read their own payments
ALTER TABLE public.switch_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_read_own_payments"
  ON public.switch_payments
  FOR SELECT TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "service_role_full_access_payments"
  ON public.switch_payments
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_switch_payments_session
  ON public.switch_payments (stripe_checkout_session_id);

CREATE INDEX IF NOT EXISTS idx_switch_payments_patient
  ON public.switch_payments (patient_id);

-- 5. Ensure agencies table allows public read for anon users (Sprint 4)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'anon_read_active_agencies' AND tablename = 'agencies'
  ) THEN
    CREATE POLICY "anon_read_active_agencies"
      ON public.agencies
      FOR SELECT TO anon
      USING (is_active = true AND is_approved = true);
  END IF;
END $$;
