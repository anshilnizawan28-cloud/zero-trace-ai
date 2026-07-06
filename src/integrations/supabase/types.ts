export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analysis_findings: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          document_id: string
          id: string
          org_id: string
          severity: string | null
          title: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          document_id: string
          id?: string
          org_id: string
          severity?: string | null
          title?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          document_id?: string
          id?: string
          org_id?: string
          severity?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_findings_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_findings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          disabled: boolean
          hashed_key: string
          id: string
          last_used_at: string | null
          name: string
          org_id: string
          prefix: string
          rate_limit_per_min: number
          rotated_at: string | null
          scopes: string[]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          disabled?: boolean
          hashed_key: string
          id?: string
          last_used_at?: string | null
          name: string
          org_id: string
          prefix: string
          rate_limit_per_min?: number
          rotated_at?: string | null
          scopes?: string[]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          disabled?: boolean
          hashed_key?: string
          id?: string
          last_used_at?: string | null
          name?: string
          org_id?: string
          prefix?: string
          rate_limit_per_min?: number
          rotated_at?: string | null
          scopes?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          ip: string | null
          metadata: Json
          org_id: string | null
          resource: string | null
          resource_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          metadata?: Json
          org_id?: string | null
          resource?: string | null
          resource_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          metadata?: Json
          org_id?: string | null
          resource?: string | null
          resource_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_revocation_cache: {
        Row: {
          checked_at: string
          source: string | null
          status: string
          thumbprint_sha256: string
        }
        Insert: {
          checked_at?: string
          source?: string | null
          status: string
          thumbprint_sha256: string
        }
        Update: {
          checked_at?: string
          source?: string | null
          status?: string
          thumbprint_sha256?: string
        }
        Relationships: []
      }
      digital_certificates: {
        Row: {
          first_seen_at: string
          id: string
          issuer: string | null
          public_key_algorithm: string | null
          raw: Json
          serial_number: string | null
          signature_algorithm: string | null
          subject: string | null
          thumbprint_sha256: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          first_seen_at?: string
          id?: string
          issuer?: string | null
          public_key_algorithm?: string | null
          raw?: Json
          serial_number?: string | null
          signature_algorithm?: string | null
          subject?: string | null
          thumbprint_sha256: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          first_seen_at?: string
          id?: string
          issuer?: string | null
          public_key_algorithm?: string | null
          raw?: Json
          serial_number?: string | null
          signature_algorithm?: string | null
          subject?: string | null
          thumbprint_sha256?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      digital_signatures: {
        Row: {
          certificate_id: string | null
          created_at: string
          cryptographic_valid: boolean | null
          document_modified_after_signing: boolean | null
          hash_algorithm: string | null
          id: string
          org_id: string
          raw: Json
          report_id: string | null
          revocation_status: string | null
          signature_algorithm: string | null
          signer_email: string | null
          signer_name: string | null
          signer_org: string | null
          signing_time: string | null
          timestamp_authority: string | null
          trust_chain_status: string | null
          trust_score: number | null
        }
        Insert: {
          certificate_id?: string | null
          created_at?: string
          cryptographic_valid?: boolean | null
          document_modified_after_signing?: boolean | null
          hash_algorithm?: string | null
          id?: string
          org_id: string
          raw?: Json
          report_id?: string | null
          revocation_status?: string | null
          signature_algorithm?: string | null
          signer_email?: string | null
          signer_name?: string | null
          signer_org?: string | null
          signing_time?: string | null
          timestamp_authority?: string | null
          trust_chain_status?: string | null
          trust_score?: number | null
        }
        Update: {
          certificate_id?: string | null
          created_at?: string
          cryptographic_valid?: boolean | null
          document_modified_after_signing?: boolean | null
          hash_algorithm?: string | null
          id?: string
          org_id?: string
          raw?: Json
          report_id?: string | null
          revocation_status?: string | null
          signature_algorithm?: string | null
          signer_email?: string | null
          signer_name?: string | null
          signer_org?: string | null
          signing_time?: string | null
          timestamp_authority?: string | null
          trust_chain_status?: string | null
          trust_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_signatures_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "digital_certificates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_signatures_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_signatures_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      document_analysis: {
        Row: {
          ai_summary: string | null
          created_at: string
          credits_consumed: number
          file_name: string
          file_size: number
          forensic_report: Json | null
          id: string
          md5_hash: string | null
          metadata: Json | null
          mime_type: string | null
          ocr_used: boolean
          org_id: string
          processing_time_ms: number | null
          risk_score: number | null
          sha256_hash: string | null
          signature_verified: boolean
          status: string
          tampering_detected: boolean
          trust_score: number | null
          user_id: string
          watermark_detected: boolean
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          credits_consumed?: number
          file_name: string
          file_size: number
          forensic_report?: Json | null
          id?: string
          md5_hash?: string | null
          metadata?: Json | null
          mime_type?: string | null
          ocr_used?: boolean
          org_id: string
          processing_time_ms?: number | null
          risk_score?: number | null
          sha256_hash?: string | null
          signature_verified?: boolean
          status?: string
          tampering_detected?: boolean
          trust_score?: number | null
          user_id: string
          watermark_detected?: boolean
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          credits_consumed?: number
          file_name?: string
          file_size?: number
          forensic_report?: Json | null
          id?: string
          md5_hash?: string | null
          metadata?: Json | null
          mime_type?: string | null
          ocr_used?: boolean
          org_id?: string
          processing_time_ms?: number | null
          risk_score?: number | null
          sha256_hash?: string | null
          signature_verified?: boolean
          status?: string
          tampering_detected?: boolean
          trust_score?: number | null
          user_id?: string
          watermark_detected?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "document_analysis_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_inr: number
          gst_number: string | null
          id: string
          issued_at: string
          number: string | null
          org_id: string
          paid_at: string | null
          pdf_url: string | null
          status: string
          tax_inr: number
        }
        Insert: {
          amount_inr: number
          gst_number?: string | null
          id?: string
          issued_at?: string
          number?: string | null
          org_id: string
          paid_at?: string | null
          pdf_url?: string | null
          status?: string
          tax_inr?: number
        }
        Update: {
          amount_inr?: number
          gst_number?: string | null
          id?: string
          issued_at?: string
          number?: string | null
          org_id?: string
          paid_at?: string | null
          pdf_url?: string | null
          status?: string
          tax_inr?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          suspended: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["app_role"]
          suspended?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          suspended?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_settings: {
        Row: {
          email_otp_enabled: boolean
          recovery_codes_generated_at: string | null
          totp_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          email_otp_enabled?: boolean
          recovery_codes_generated_at?: string | null
          totp_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          email_otp_enabled?: boolean
          recovery_codes_generated_at?: string | null
          totp_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          slug: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          slug?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_inr: number
          created_at: string
          id: string
          invoice_id: string | null
          org_id: string
          provider: string | null
          provider_payment_id: string | null
          status: string
        }
        Insert: {
          amount_inr: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          org_id: string
          provider?: string | null
          provider_payment_id?: string | null
          status?: string
        }
        Update: {
          amount_inr?: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          org_id?: string
          provider?: string | null
          provider_payment_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          is_active: boolean
          max_file_size_mb: number
          monthly_analyses: number
          name: string
          price_inr_monthly: number
          tier: Database["public"]["Enums"]["plan_tier"]
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          max_file_size_mb?: number
          monthly_analyses?: number
          name: string
          price_inr_monthly?: number
          tier: Database["public"]["Enums"]["plan_tier"]
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          max_file_size_mb?: number
          monthly_analyses?: number
          name?: string
          price_inr_monthly?: number
          tier?: Database["public"]["Enums"]["plan_tier"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          job_title: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          job_title?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          has_signatures: boolean | null
          id: string
          md5: string | null
          mime_type: string | null
          org_id: string
          report: Json
          risk_label: string | null
          risk_score: number | null
          sha256: string | null
          sha512: string | null
          signature_trust_score: number | null
          tampering_confidence: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          has_signatures?: boolean | null
          id?: string
          md5?: string | null
          mime_type?: string | null
          org_id: string
          report: Json
          risk_label?: string | null
          risk_score?: number | null
          sha256?: string | null
          sha512?: string | null
          signature_trust_score?: number | null
          tampering_confidence?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          has_signatures?: boolean | null
          id?: string
          md5?: string | null
          mime_type?: string | null
          org_id?: string
          report?: Json
          risk_label?: string | null
          risk_score?: number | null
          sha256?: string | null
          sha512?: string | null
          signature_trust_score?: number | null
          tampering_confidence?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string
          current_period_start: string
          external_id: string | null
          external_provider: string | null
          id: string
          org_id: string
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          external_id?: string | null
          external_provider?: string | null
          id?: string
          org_id: string
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          external_id?: string | null
          external_provider?: string | null
          id?: string
          org_id?: string
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_chains: {
        Row: {
          id: string
          issuer: string | null
          position: number
          serial_number: string | null
          signature_id: string
          subject: string | null
          thumbprint_sha256: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          id?: string
          issuer?: string | null
          position: number
          serial_number?: string | null
          signature_id: string
          subject?: string | null
          thumbprint_sha256?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          id?: string
          issuer?: string | null
          position?: number
          serial_number?: string | null
          signature_id?: string
          subject?: string | null
          thumbprint_sha256?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trust_chains_signature_id_fkey"
            columns: ["signature_id"]
            isOneToOne: false
            referencedRelation: "digital_signatures"
            referencedColumns: ["id"]
          },
        ]
      }
      usage: {
        Row: {
          created_at: string
          id: string
          kind: string
          metadata: Json
          org_id: string
          quantity: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          metadata?: Json
          org_id: string
          quantity?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          metadata?: Json
          org_id?: string
          quantity?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          created_at: string
          credits_remaining: number
          credits_used: number
          documents_analyzed: number
          id: string
          monthly_limit: number
          org_id: string
          period_start: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits_remaining?: number
          credits_used?: number
          documents_analyzed?: number
          id?: string
          monthly_limit?: number
          org_id: string
          period_start: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits_remaining?: number
          credits_used?: number
          documents_analyzed?: number
          id?: string
          monthly_limit?: number
          org_id?: string
          period_start?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          device_label: string | null
          id: string
          ip: string | null
          last_seen_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_label?: string | null
          id?: string
          ip?: string | null
          last_seen_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_label?: string | null
          id?: string
          ip?: string | null
          last_seen_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_usage_snapshot: {
        Args: { _org: string }
        Returns: {
          credits_remaining: number
          credits_used: number
          documents_analyzed: number
          monthly_limit: number
        }[]
      }
      has_any_org_role: {
        Args: {
          _org: string
          _roles: Database["public"]["Enums"]["app_role"][]
          _user: string
        }
        Returns: boolean
      }
      has_org_role: {
        Args: {
          _org: string
          _role: Database["public"]["Enums"]["app_role"]
          _user: string
        }
        Returns: boolean
      }
      is_org_member: { Args: { _org: string; _user: string }; Returns: boolean }
      persist_analysis: { Args: { p_payload: Json }; Returns: string }
    }
    Enums: {
      app_role: "owner" | "admin" | "auditor" | "analyst" | "viewer"
      invitation_status: "pending" | "accepted" | "revoked" | "expired"
      plan_tier: "free" | "starter" | "professional" | "business" | "enterprise"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete"
        | "paused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin", "auditor", "analyst", "viewer"],
      invitation_status: ["pending", "accepted", "revoked", "expired"],
      plan_tier: ["free", "starter", "professional", "business", "enterprise"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "incomplete",
        "paused",
      ],
    },
  },
} as const
