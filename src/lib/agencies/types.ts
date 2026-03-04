export interface CMSAgencyRaw {
  cms_certification_number: string;
  provider_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone_number: string;
  type_of_ownership: string;
  offers_nursing_care_services: string;
  offers_physical_therapy_services: string;
  offers_occupational_therapy_services: string;
  offers_speech_pathology_services: string;
  offers_medical_social_services: string;
  offers_home_health_aide_services: string;
  how_often_the_home_health_team_began_their_patients_care_in_a_timely_manner: string;
  quality_of_patient_care_star_rating: string;
  how_often_patients_got_better_at_walking_or_moving_around: string;
  how_often_patients_got_better_at_getting_in_and_out_of_bed: string;
  how_often_patients_got_better_at_bathing: string;
  how_often_patients_breathing_improved: string;
  how_often_patients_wounds_improved_or_healed_after_an_operation: string;
  how_often_patients_got_better_at_taking_their_drugs_correctly_by_mouth: string;
  how_often_the_home_health_team_checked_patients_risk_of_falling: string;
  how_often_the_home_health_team_checked_patients_for_depression: string;
  how_often_the_home_health_team_made_sure_that_their_patients_have_received_a_flu_shot_for_the_current_flu_season: string;
  how_often_the_home_health_team_talked_with_patients_and_caregivers_about_all_the_prescription_and_over_the_counter_medicines_the_patient_was_taking: string;
  how_often_home_health_patients_had_to_be_admitted_to_the_hospital: string;
  how_often_patients_receiving_home_health_care_needed_urgent_unplanned_care_in_the_er_without_being_admitted: string;
  footnote_for_quality_of_patient_care_star_rating: string;
  patient_survey_star_rating: string;
  date_certified: string;
}

export interface NPIRaw {
  number: string;
  enumeration_type: string;
  basic: {
    organization_name: string;
    status: string;
    enumeration_date: string;
    last_updated: string;
  };
  taxonomies: Array<{
    code: string;
    desc: string;
    primary: boolean;
    state: string | null;
    license: string | null;
  }>;
  addresses: Array<{
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postal_code: string;
    telephone_number?: string;
    fax_number?: string;
    address_purpose: "LOCATION" | "MAILING";
  }>;
  identifiers: Array<{
    code: string;
    identifier: string;
    issuer: string | null;
    state: string;
    desc: string;
  }>;
}

export interface AgencyListing {
  id: string;
  npi: string | null;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  type_of_ownership: string;
  date_certified: string;
  is_medicare_certified: boolean;
  is_medicaid_certified: boolean;
  offers_nursing: boolean;
  offers_physical_therapy: boolean;
  offers_occupational_therapy: boolean;
  offers_speech_pathology: boolean;
  offers_medical_social: boolean;
  offers_home_health_aide: boolean;
  cms_star_rating: number | null;
  patient_survey_star_rating: number | null;
  accepting_patients: boolean;
  accepting_updated_at: string | null;
  hha_pay_min: number | null;
  hha_pay_max: number | null;
  pay_updated_at: string | null;
  languages: string[];
  data_source: "cms_pdcatalog";
  last_synced_at: string;
  cms_refresh_quarter: string;
}

export type AgencyRow = AgencyListing;

export interface AgenciesAPIResponse {
  agencies: AgencyListing[];
  total: number;
  source: string;
  cached_at: string | null;
  cms_refresh_quarter: string;
}

export interface AgenciesQueryParams {
  zip?: string;
  city?: string;
  county?: string;
  min_stars?: number;
  accepting?: boolean;
  service?: string;
  language?: string;
  payer?: string;
  limit?: number;
  offset?: number;
  sort?: "stars" | "name" | "pay_rate";
}
