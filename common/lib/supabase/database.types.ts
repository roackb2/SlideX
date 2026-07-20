export type Json =
  | boolean
  | number
  | string
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      agent_sessions: {
        Row: {
          created_at: string;
          id: string;
          message_count: number;
          presentation_id: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          message_count?: number;
          presentation_id: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          message_count?: number;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_sessions_presentation_id_fkey";
            columns: ["presentation_id"];
            isOneToOne: false;
            referencedRelation: "presentations";
            referencedColumns: ["id"];
          }
        ];
      };
      mcp_image_upload_intents: {
        Row: {
          actual_size: number | null;
          claimed_at: string | null;
          completed_at: string | null;
          created_at: string;
          expected_mime_type: "image/jpeg" | "image/png" | "image/webp";
          expected_size: number;
          expires_at: string;
          id: string;
          presentation_id: string;
          status: "prepared" | "claimed" | "completed" | "rejected" | "expired";
          storage_path: string;
          token_hash: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          actual_size?: number | null;
          claimed_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          expected_mime_type: "image/jpeg" | "image/png" | "image/webp";
          expected_size: number;
          expires_at: string;
          id?: string;
          presentation_id: string;
          status?: "prepared" | "claimed" | "completed" | "rejected" | "expired";
          storage_path: string;
          token_hash: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          actual_size?: number | null;
          claimed_at?: string | null;
          completed_at?: string | null;
          status?: "prepared" | "claimed" | "completed" | "rejected" | "expired";
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mcp_image_upload_intents_presentation_id_fkey";
            columns: ["presentation_id"];
            isOneToOne: false;
            referencedRelation: "presentations";
            referencedColumns: ["id"];
          }
        ];
      };
      mcp_image_upload_rate_limits: {
        Row: {
          last_refilled_at: string;
          tokens: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          last_refilled_at?: string;
          tokens?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          last_refilled_at?: string;
          tokens?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      mcp_oauth_clients: {
        Row: {
          client_id: string;
          client_name: string;
          created_at: string;
          grant_types: string[];
          redirect_uris: string[];
          response_types: string[];
          token_endpoint_auth_method: string;
        };
        Insert: {
          client_id: string;
          client_name: string;
          created_at?: string;
          grant_types?: string[];
          redirect_uris: string[];
          response_types?: string[];
          token_endpoint_auth_method?: string;
        };
        Update: {
          client_name?: string;
          grant_types?: string[];
          redirect_uris?: string[];
          response_types?: string[];
          token_endpoint_auth_method?: string;
        };
        Relationships: [];
      };
      mcp_oauth_credentials: {
        Row: {
          client_id: string;
          code_challenge: string | null;
          created_at: string;
          credential_hash: string;
          credential_type: "authorization_code" | "access_token" | "refresh_token";
          expires_at: string;
          grant_id: string;
          id: string;
          redirect_uri: string | null;
          resource: string;
          revoked_at: string | null;
          scopes: string[];
          user_id: string;
        };
        Insert: {
          client_id: string;
          code_challenge?: string | null;
          created_at?: string;
          credential_hash: string;
          credential_type: "authorization_code" | "access_token" | "refresh_token";
          expires_at: string;
          grant_id?: string;
          id?: string;
          redirect_uri?: string | null;
          resource: string;
          revoked_at?: string | null;
          scopes?: string[];
          user_id: string;
        };
        Update: {
          grant_id?: string;
          revoked_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "mcp_oauth_credentials_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "mcp_oauth_clients";
            referencedColumns: ["client_id"];
          }
        ];
      };
      mcp_oauth_consent_requests: {
        Row: {
          client_id: string;
          consumed_at: string | null;
          created_at: string;
          expires_at: string;
          id: string;
          nonce_hash: string;
          request_hash: string;
          user_id: string;
        };
        Insert: {
          client_id: string;
          consumed_at?: string | null;
          created_at?: string;
          expires_at: string;
          id?: string;
          nonce_hash: string;
          request_hash: string;
          user_id: string;
        };
        Update: {
          consumed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "mcp_oauth_consent_requests_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "mcp_oauth_clients";
            referencedColumns: ["client_id"];
          }
        ];
      };
      mcp_oauth_rate_limits: {
        Row: {
          bucket_hash: string;
          last_refilled_at: string;
          tokens: number;
          updated_at: string;
        };
        Insert: {
          bucket_hash: string;
          last_refilled_at?: string;
          tokens: number;
          updated_at?: string;
        };
        Update: {
          last_refilled_at?: string;
          tokens?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      mcp_oauth_security_events: {
        Row: {
          client_hash: string | null;
          created_at: string;
          error_code: string | null;
          event_type:
            | "refresh_replay"
            | "invalid_grant"
            | "invalid_grant_burst"
            | "pkce_failure"
            | "redirect_mismatch"
            | "rate_limit_triggered"
            | "rate_limit_burst"
            | "account_ip_anomaly"
            | "sensitive_environment_misconfiguration";
          expires_at: string;
          grant_hash: string | null;
          id: string;
          ip_hash: string | null;
          request_id: string | null;
          route: string;
          severity: "low" | "medium" | "high" | "critical";
          user_hash: string | null;
        };
        Insert: {
          client_hash?: string | null;
          created_at?: string;
          error_code?: string | null;
          event_type:
            | "refresh_replay"
            | "invalid_grant"
            | "invalid_grant_burst"
            | "pkce_failure"
            | "redirect_mismatch"
            | "rate_limit_triggered"
            | "rate_limit_burst"
            | "account_ip_anomaly"
            | "sensitive_environment_misconfiguration";
          expires_at?: string;
          grant_hash?: string | null;
          id?: string;
          ip_hash?: string | null;
          request_id?: string | null;
          route: string;
          severity: "low" | "medium" | "high" | "critical";
          user_hash?: string | null;
        };
        Update: {
          expires_at?: string;
        };
        Relationships: [];
      };
      mcp_operation_events: {
        Row: {
          client_id: string;
          client_name: string;
          completed_at: string | null;
          completed_revision: number | null;
          created_at: string;
          error_code: string | null;
          expires_at: string;
          id: string;
          node_id: string | null;
          presentation_id: string;
          slide_index: number | null;
          status: "running" | "completed" | "failed";
          target_kind: "presentation" | "slide" | "block";
          tool_name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          client_id: string;
          client_name: string;
          completed_at?: string | null;
          completed_revision?: number | null;
          created_at?: string;
          error_code?: string | null;
          id?: string;
          node_id?: string | null;
          presentation_id: string;
          slide_index?: number | null;
          status?: "running" | "completed" | "failed";
          target_kind: "presentation" | "slide" | "block";
          tool_name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          completed_revision?: number | null;
          error_code?: string | null;
          node_id?: string | null;
          slide_index?: number | null;
          status?: "running" | "completed" | "failed";
          target_kind?: "presentation" | "slide" | "block";
        };
        Relationships: [
          {
            foreignKeyName: "mcp_operation_events_presentation_id_fkey";
            columns: ["presentation_id"];
            isOneToOne: false;
            referencedRelation: "presentations";
            referencedColumns: ["id"];
          }
        ];
      };
      official_templates: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          is_active: boolean;
          name: string;
          sort_order: number;
          thumbnail_url: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string;
          id: string;
          is_active?: boolean;
          name: string;
          sort_order?: number;
          thumbnail_url?: string | null;
        };
        Update: {
          description?: string;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
          thumbnail_url?: string | null;
        };
        Relationships: [];
      };
      presentations: {
        Row: {
          created_at: string;
          editor_template_id: string | null;
          guest_import_id: string | null;
          id: string;
          kind: "presentation" | "template";
          last_opened_at: string;
          source: string;
          source_revision: number;
          template_id: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          editor_template_id?: string | null;
          guest_import_id?: string | null;
          id?: string;
          kind?: "presentation" | "template";
          last_opened_at?: string;
          source?: string;
          source_revision?: number;
          template_id?: string | null;
          title: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          editor_template_id?: string | null;
          guest_import_id?: string | null;
          kind?: "presentation" | "template";
          last_opened_at?: string;
          source?: string;
          source_revision?: number;
          template_id?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "presentations_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "official_templates";
            referencedColumns: ["id"];
          }
        ];
      };
      slide_comments: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          is_resolved: boolean;
          presentation_id: string;
          slide_index: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          is_resolved?: boolean;
          presentation_id: string;
          slide_index: number;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          body?: string;
          is_resolved?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "slide_comments_presentation_id_fkey";
            columns: ["presentation_id"];
            isOneToOne: false;
            referencedRelation: "presentations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      compare_and_swap_presentation_document: {
        Args: {
          expected_source_revision: number;
          next_editor_template_id?: string | null;
          next_source: string;
          next_title?: string | null;
          target_presentation_id: string;
        };
        Returns: Array<{
          editor_template_id: string | null;
          presentation_id: string;
          source_revision: number;
          updated_at: string;
        }>;
      };
      compare_and_swap_presentation_source: {
        Args: {
          expected_source_revision: number;
          next_source: string;
          next_title?: string | null;
          target_presentation_id: string;
        };
        Returns: Array<{
          presentation_id: string;
          source_revision: number;
          updated_at: string;
        }>;
      };
      mcp_compare_and_swap_presentation_document: {
        Args: {
          actor_user_id: string;
          expected_source_revision: number;
          next_source: string;
          target_presentation_id: string;
        };
        Returns: Array<{
          presentation_id: string;
          result_status: "conflict" | "inaccessible" | "saved";
          source_revision: number | null;
          title: string | null;
          updated_at: string | null;
        }>;
      };
      mcp_consume_oauth_consent_request: {
        Args: {
          actor_user_id: string;
          authorization_request_hash: string;
          consent_nonce_hash: string;
          oauth_client_id: string;
        };
        Returns: boolean;
      };
      mcp_consume_oauth_rate_limit: {
        Args: {
          bucket_capacity: number;
          refill_interval_seconds: number;
          target_bucket_hash: string;
        };
        Returns: Array<{
          allowed: boolean;
          retry_after_seconds: number;
          tokens_remaining: number;
        }>;
      };
      mcp_exchange_oauth_authorization_code: {
        Args: {
          issued_access_expires_at: string;
          issued_access_hash: string;
          issued_refresh_expires_at: string;
          issued_refresh_hash: string;
          oauth_client_id: string;
          oauth_redirect_uri: string;
          oauth_resource: string;
          presented_code_challenge: string;
          presented_code_hash: string;
        };
        Returns: Array<{
          granted_scopes: string[] | null;
          result_status: "exchanged" | "invalid_grant" | "pkce_failure" | "redirect_mismatch";
          security_grant_id: string | null;
          security_user_id: string | null;
        }>;
      };
      mcp_issue_oauth_consent_request: {
        Args: {
          actor_user_id: string;
          authorization_request_hash: string;
          consent_expires_at: string;
          consent_nonce_hash: string;
          oauth_client_id: string;
        };
        Returns: boolean;
      };
      mcp_record_oauth_security_event: {
        Args: {
          security_client_hash: string | null;
          security_error_code: string | null;
          security_event_type: Database["public"]["Tables"]["mcp_oauth_security_events"]["Row"]["event_type"];
          security_grant_hash: string | null;
          security_ip_hash: string | null;
          security_request_id: string | null;
          security_route: string;
          security_severity: Database["public"]["Tables"]["mcp_oauth_security_events"]["Row"]["severity"];
          security_user_hash: string | null;
        };
        Returns: string;
      };
      mcp_revoke_oauth_grant_family: {
        Args: {
          presented_credential_hash: string;
        };
        Returns: boolean;
      };
      mcp_rotate_oauth_refresh_token: {
        Args: {
          issued_access_expires_at: string;
          issued_access_hash: string;
          issued_refresh_expires_at: string;
          issued_refresh_hash: string;
          oauth_client_id: string;
          oauth_resource: string;
          presented_refresh_hash: string;
          requested_scopes: string[] | null;
        };
        Returns: Array<{
          granted_scopes: string[] | null;
          result_status: "invalid_grant" | "invalid_scope" | "refresh_replay" | "rotated";
          security_grant_id: string | null;
          security_user_id: string | null;
        }>;
      };
      mcp_claim_presentation_image_upload: {
        Args: {
          credential_hash: string;
          target_upload_id: string;
        };
        Returns: Array<{
          expected_mime_type: string | null;
          expected_size: number | null;
          presentation_id: string | null;
          result_status: "claimed" | "invalid";
          storage_path: string | null;
          upload_id: string | null;
          user_id: string | null;
        }>;
      };
      mcp_complete_presentation_image_upload: {
        Args: {
          stored_size: number;
          target_upload_id: string;
        };
        Returns: boolean;
      };
      mcp_prepare_presentation_image_upload: {
        Args: {
          actor_user_id: string;
          credential_hash: string;
          requested_mime_type: string;
          requested_size: number;
          target_presentation_id: string;
        };
        Returns: Array<{
          expires_at: string | null;
          result_status: "inaccessible" | "prepared" | "quota_exceeded" | "rate_limited";
          retry_after_seconds: number | null;
          storage_path: string | null;
          tokens_remaining: number | null;
          upload_id: string | null;
        }>;
      };
      mcp_reject_presentation_image_upload: {
        Args: { target_upload_id: string };
        Returns: boolean;
      };
      touch_presentation_opened: {
        Args: { target_presentation_id: string };
        Returns: string | null;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
