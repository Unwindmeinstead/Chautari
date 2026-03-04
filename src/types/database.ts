export type UserRole = "patient" | "agency_staff" | "agency_admin" | "chautari_admin";
export type LanguageCode = "en" | "ne" | "hi";
export type PayerType = "medicaid" | "medicare" | "private" | "self_pay" | "waiver";
export type CareType = "home_health" | "home_care" | "both";
export type SwitchStatus =
  | "draft"
  | "pending_payment"
  | "submitted"
  | "under_review"
  | "accepted"
  | "denied"
  | "rejected"
  | "completed"
  | "cancelled";
export type DocType =
  | "insurance_card"
  | "id_document"
  | "prior_auth"
  | "physician_order"
  | "discharge_summary"
  | "other";
export type MessageStatus = "sent" | "delivered" | "read";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  preferred_lang: LanguageCode;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientDetails {
  id: string;
  patient_id: string;
  medicaid_id_enc: string | null;
  dob_enc: string | null;
  address_line1: string | null;
  address_line2: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  address_county: string | null;
  payer_type: PayerType | null;
  medicaid_plan: string | null;
  care_needs: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Agency {
  id: string;
  npi: string;
  name: string;
  dba_name: string | null;
  address_line1: string;
  address_line2: string | null;
  address_city: string;
  address_state: string;
  address_zip: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  care_types: CareType[];
  payers_accepted: PayerType[];
  services_offered: string[];
  languages_spoken: string[];
  service_counties: string[];
  is_verified_partner: boolean;
  is_active: boolean;
  is_approved: boolean;
  medicare_quality_score: number | null;
  avg_response_hours: number | null;
  pa_license_number: string | null;
  npi_last_synced_at: string | null;
  pay_rates: Record<string, string> | null;
  benefits: string[] | null;
  google_rating: number | null;
  google_reviews_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface AgencyMember {
  id: string;
  agency_id: string;
  user_id: string;
  profile_id?: string;
  role: "owner" | "admin" | "staff";
  title: string | null;
  is_active: boolean;
  joined_at: string | null;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SwitchRequest {
  id: string;
  patient_id: string;
  current_agency_id: string | null;
  new_agency_id: string;
  care_type: CareType;
  payer_type: PayerType | null;
  status: SwitchStatus;
  requested_start_date: string | null;
  services_requested: string[];
  reason_for_switch: string | null;
  switch_reason: string | null;
  current_agency_name: string | null;
  special_instructions: string | null;
  internal_notes: string | null;
  chautari_case_manager_id: string | null;
  current_agency_notified_at: string | null;
  submitted_at: string | null;
  accepted_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  switch_request_id: string;
  patient_id: string;
  doc_type: DocType;
  file_path: string;
  file_name: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  is_signed: boolean;
  signed_at: string | null;
  signer_ip: string | null;
  signer_user_agent: string | null;
  created_at: string;
}

export interface ESignature {
  id: string;
  request_id: string;
  signer_id: string;
  signer_role: "patient" | "agency" | "admin";
  full_name: string;
  signature_method: "typed" | "drawn";
  signature_data: string | null;
  consent_hipaa: boolean;
  consent_current_agency_notification: boolean;
  consent_terms: boolean;
  ip_address: string | null;
  signed_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: "patient" | "agency_staff";
  body: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  reference_id: string | null;
  reference_type: string | null;
  read_at: string | null;
  created_at: string;
}

export interface SwitchPayment {
  id: string;
  switch_request_id: string;
  patient_id: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded" | "cancelled";
  paid_at: string | null;
  refunded_at: string | null;
  refund_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  request_id: string;
  patient_id: string;
  agency_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  patient_unread: number;
  agency_unread: number;
}

export interface CaregiverSubmission {
  id: string;
  agency_id: string;
  role: string;
  employment_type: string | null;
  actual_hourly_rate: number;
  years_at_agency: number | null;
  benefits_json: Record<string, unknown>;
  management_score: number | null;
  training_score: number | null;
  scheduling_score: number | null;
  comment_text: string | null;
  submitter_hash: string;
  moderation_status: "pending" | "approved" | "rejected" | "flagged";
  rejection_reason: string | null;
  time_on_page_seconds: number | null;
  is_verified: boolean;
  submitted_at: string;
  moderated_at: string | null;
  moderated_by: string | null;
  submission_week: string;
}

export interface PostSwitchSurvey {
  id: string;
  switch_request_id: string;
  patient_id: string;
  origin_agency_id: string | null;
  destination_agency_id: string | null;
  token: string;
  status: "pending" | "sent" | "completed";
  q1_better: boolean | null;
  q2_recommend: boolean | null;
  q3_comment: string | null;
  q4_leave_reason: string | null;
  sent_at: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_role: UserRole | null;
  action: string;
  resource: string;
  resource_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Supabase Database type for typed client
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      patient_details: {
        Row: PatientDetails;
        Insert: Partial<PatientDetails> & { patient_id: string };
        Update: Partial<PatientDetails>;
        Relationships: [];
      };
      agencies: {
        Row: Agency;
        Insert: Partial<Agency> & { npi: string; name: string };
        Update: Partial<Agency>;
        Relationships: [];
      };
      agency_members: {
        Row: AgencyMember;
        Insert: Omit<AgencyMember, "id" | "created_at">;
        Update: Partial<AgencyMember>;
        Relationships: [];
      };
      switch_requests: {
        Row: SwitchRequest;
        Insert: Partial<SwitchRequest> & {
          patient_id: string;
          new_agency_id: string;
          care_type: CareType;
        };
        Update: Partial<SwitchRequest>;
        Relationships: [];
      };
      documents: {
        Row: Document;
        Insert: Partial<Document> & {
          switch_request_id: string;
          patient_id: string;
          doc_type: DocType;
          file_path: string;
          file_name: string;
        };
        Update: Partial<Document>;
        Relationships: [];
      };
      e_signatures: {
        Row: ESignature;
        Insert: Omit<ESignature, "id">;
        Update: never;
        Relationships: [];
      };
      messages: {
        Row: Message;
        Insert: Partial<Message> & {
          conversation_id: string;
          sender_id: string;
          sender_role: "patient" | "agency_staff";
          body: string;
        };
        Update: Partial<Message>;
        Relationships: [];
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification> & {
          user_id: string;
          type: string;
          title: string;
          body: string;
        };
        Update: Partial<Notification>;
        Relationships: [];
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Partial<AuditLog> & { action: string; resource: string };
        Update: never;
        Relationships: [];
      };
      switch_payments: {
        Row: SwitchPayment;
        Insert: Partial<SwitchPayment> & {
          switch_request_id: string;
          patient_id: string;
        };
        Update: Partial<SwitchPayment>;
        Relationships: [];
      };
      conversations: {
        Row: Conversation;
        Insert: Partial<Conversation> & {
          request_id: string;
          patient_id: string;
          agency_id: string;
        };
        Update: Partial<Conversation>;
        Relationships: [];
      };
      caregiver_submissions: {
        Row: CaregiverSubmission;
        Insert: Partial<CaregiverSubmission> & {
          agency_id: string;
          role: string;
          actual_hourly_rate: number;
          submitter_hash: string;
        };
        Update: Partial<CaregiverSubmission>;
        Relationships: [];
      };
      post_switch_surveys: {
        Row: PostSwitchSurvey;
        Insert: Partial<PostSwitchSurvey> & {
          switch_request_id: string;
          patient_id: string;
          token: string;
        };
        Update: Partial<PostSwitchSurvey>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      user_role: UserRole;
      language_code: LanguageCode;
      payer_type: PayerType;
      care_type: CareType;
      switch_status: SwitchStatus;
      doc_type: DocType;
      message_status: MessageStatus;
    };
  };
};
