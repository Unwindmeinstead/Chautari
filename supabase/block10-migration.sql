-- ============================================================
-- CHAUTARI — Migration Block 10
-- Adding rich data fields for Real Data Integration (Pittsburgh)
-- ============================================================

ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS pay_rates JSONB,
  ADD COLUMN IF NOT EXISTS benefits TEXT[],
  ADD COLUMN IF NOT EXISTS google_rating NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS google_reviews_count INTEGER;
