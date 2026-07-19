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
          id?: string;
          redirect_uri?: string | null;
          resource: string;
          revoked_at?: string | null;
          scopes?: string[];
          user_id: string;
        };
        Update: {
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
