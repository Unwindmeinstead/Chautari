CREATE TABLE IF NOT EXISTS agencies (
  id                          TEXT PRIMARY KEY,
  npi                         TEXT UNIQUE,
  name                        TEXT NOT NULL,
  address                     TEXT,
  city                        TEXT,
  state                       TEXT DEFAULT 'PA',
  zip                         TEXT,
  phone                       TEXT,
  type_of_ownership           TEXT,
  date_certified              DATE,
  is_medicare_certified       BOOLEAN DEFAULT FALSE,
  is_medicaid_certified       BOOLEAN DEFAULT FALSE,
  offers_nursing              BOOLEAN DEFAULT FALSE,
  offers_physical_therapy     BOOLEAN DEFAULT FALSE,
  offers_occupational_therapy BOOLEAN DEFAULT FALSE,
  offers_speech_pathology     BOOLEAN DEFAULT FALSE,
  offers_medical_social       BOOLEAN DEFAULT FALSE,
  offers_home_health_aide     BOOLEAN DEFAULT FALSE,
  cms_star_rating             NUMERIC(2,1) CHECK (cms_star_rating BETWEEN 1.0 AND 5.0),
  patient_survey_star_rating  NUMERIC(2,1) CHECK (patient_survey_star_rating BETWEEN 1.0 AND 5.0),
  accepting_patients          BOOLEAN DEFAULT TRUE,
  accepting_updated_at        TIMESTAMPTZ,
  hha_pay_min                 NUMERIC(5,2),
  hha_pay_max                 NUMERIC(5,2),
  pay_updated_at              TIMESTAMPTZ,
  languages                   TEXT[] DEFAULT '{}',
  payers_accepted             TEXT[] DEFAULT '{}',
  data_source                 TEXT DEFAULT 'cms_pdcatalog',
  last_synced_at              TIMESTAMPTZ DEFAULT NOW(),
  cms_refresh_quarter         TEXT,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agencies_zip ON agencies (zip);
CREATE INDEX IF NOT EXISTS idx_agencies_city ON agencies USING gin (to_tsvector('english', city));
CREATE INDEX IF NOT EXISTS idx_agencies_stars ON agencies (cms_star_rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_agencies_accepting ON agencies (accepting_patients) WHERE accepting_patients = TRUE;
CREATE INDEX IF NOT EXISTS idx_agencies_languages ON agencies USING gin (languages);
CREATE INDEX IF NOT EXISTS idx_agencies_synced ON agencies (last_synced_at DESC);

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agencies are publicly readable"
  ON agencies FOR SELECT
  USING (TRUE);

CREATE POLICY "Only service role can upsert agencies"
  ON agencies FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Only service role can update agencies"
  ON agencies FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS agencies_updated_at ON agencies;
CREATE TRIGGER agencies_updated_at
  BEFORE UPDATE ON agencies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE VIEW pittsburgh_agencies_view AS
SELECT
  id,
  npi,
  name,
  address || ', ' || city || ', ' || state || ' ' || zip AS full_address,
  phone,
  cms_star_rating,
  patient_survey_star_rating,
  CASE
    WHEN cms_star_rating IS NOT NULL AND patient_survey_star_rating IS NOT NULL
      THEN ROUND((cms_star_rating * 0.6 + patient_survey_star_rating * 0.4)::NUMERIC, 1)
    WHEN cms_star_rating IS NOT NULL
      THEN cms_star_rating
    WHEN patient_survey_star_rating IS NOT NULL
      THEN patient_survey_star_rating
    ELSE NULL
  END AS composite_score,
  accepting_patients,
  hha_pay_min,
  hha_pay_max,
  CASE
    WHEN hha_pay_min IS NOT NULL AND hha_pay_max IS NOT NULL
      THEN '$' || hha_pay_min::TEXT || '–$' || hha_pay_max::TEXT || '/hr'
    ELSE NULL
  END AS pay_range_display,
  is_medicare_certified,
  is_medicaid_certified,
  offers_nursing,
  offers_physical_therapy,
  offers_home_health_aide,
  languages,
  payers_accepted,
  last_synced_at,
  cms_refresh_quarter
FROM agencies
WHERE zip LIKE '15%'
  AND state = 'PA';
