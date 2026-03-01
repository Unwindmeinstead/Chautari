export type UserRole = "patient" | "agency_staff" | "agency_admin" | "chautari_admin";
export type LanguageCode = "en" | "ne" | "hi";
export type PayerType = "medicaid" | "medicare" | "private" | "self_pay" | "waiver";
export type CareType = "home_health" | "home_care" | "both";
export type SwitchStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";
export type NotificationChannel = "email" | "sms" | "push";
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
  payer_type: PayerType;
  status: SwitchStatus;
  requested_start_date: string | null;
  reason_for_switch: string | null;
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
  document_id: string;
  signer_id: string;
  typed_name: string;
  signature_data: string;
  ip_address: string | null;
  user_agent: string | null;
  signed_at: string;
  checksum: string;
}

export interface Message {
  id: string;
  switch_request_id: string;
  sender_id: string;
  recipient_id: string;
  content_enc: string;
  status: MessageStatus;
  read_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  sent_at: string | null;
  read_at: string | null;
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
      };
      patient_details: {
        Row: PatientDetails;
        Insert: Partial<PatientDetails> & { patient_id: string };
        Update: Partial<PatientDetails>;
      };
      agencies: {
        Row: Agency;
        Insert: Partial<Agency> & { npi: string; name: string };
        Update: Partial<Agency>;
      };
      agency_members: {
        Row: AgencyMember;
        Insert: Omit<AgencyMember, "id" | "created_at">;
        Update: Partial<AgencyMember>;
      };
      switch_requests: {
        Row: SwitchRequest;
        Insert: Partial<SwitchRequest> & {
          patient_id: string;
          new_agency_id: string;
          care_type: CareType;
          payer_type: PayerType;
        };
        Update: Partial<SwitchRequest>;
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
      };
      e_signatures: {
        Row: ESignature;
        Insert: Omit<ESignature, "id">;
        Update: never;
      };
      messages: {
        Row: Message;
        Insert: Partial<Message> & {
          switch_request_id: string;
          sender_id: string;
          recipient_id: string;
          content_enc: string;
        };
        Update: Partial<Message>;
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification> & {
          user_id: string;
          channel: NotificationChannel;
          title: string;
          body: string;
        };
        Update: Partial<Notification>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Partial<AuditLog> & { action: string; resource: string };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      language_code: LanguageCode;
      payer_type: PayerType;
      care_type: CareType;
      switch_status: SwitchStatus;
      notification_channel: NotificationChannel;
      doc_type: DocType;
      message_status: MessageStatus;
    };
  };
};
