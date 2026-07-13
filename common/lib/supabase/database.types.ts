export type Json =
  | boolean
  | number
  | string
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type WorkspaceRole = "editor" | "owner" | "viewer";
type PresentationKind = "presentation" | "template";
type CommentStatus = "open" | "resolved";
type AssetKind = "file" | "image" | "video";

export type Database = {
  public: {
    Tables: {
      presentation_assets: {
        Row: {
          byte_size: number;
          created_at: string;
          id: string;
          kind: AssetKind;
          mime_type: string;
          original_name: string;
          presentation_id: string;
          preview_byte_size: number;
          preview_mime_type: string | null;
          preview_storage_path: string | null;
          storage_path: string;
          uploaded_by: string;
          workspace_id: string;
        };
        Insert: {
          byte_size?: number;
          created_at?: string;
          id?: string;
          kind?: AssetKind;
          mime_type: string;
          original_name: string;
          presentation_id: string;
          preview_byte_size?: number;
          preview_mime_type?: string | null;
          preview_storage_path?: string | null;
          storage_path: string;
          uploaded_by: string;
          workspace_id: string;
        };
        Update: Record<never, never>;
        Relationships: [];
      };
      presentation_user_state: {
        Row: {
          last_opened_at: string;
          presentation_id: string;
          user_id: string;
        };
        Insert: {
          last_opened_at?: string;
          presentation_id: string;
          user_id: string;
        };
        Update: { last_opened_at?: string };
        Relationships: [];
      };
      presentations: {
        Row: {
          created_at: string;
          id: string;
          kind: PresentationKind;
          owner_id: string;
          source: string;
          template_id: string | null;
          title: string;
          updated_at: string;
          workspace_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          kind?: PresentationKind;
          owner_id: string;
          source?: string;
          template_id?: string | null;
          title: string;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          source?: string;
          template_id?: string | null;
          title?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name: string;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          display_name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      slide_comments: {
        Row: {
          author_id: string;
          body: string;
          created_at: string;
          id: string;
          presentation_id: string;
          resolved_at: string | null;
          resolved_by: string | null;
          slide_index: number;
          status: CommentStatus;
          updated_at: string;
          version: number;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string;
          id?: string;
          presentation_id: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          slide_index: number;
          status?: CommentStatus;
          updated_at?: string;
          version?: number;
        };
        Update: Partial<Database["public"]["Tables"]["slide_comments"]["Insert"]>;
        Relationships: [];
      };
      user_workspace_preferences: {
        Row: {
          auto_save_enabled: boolean;
          onboarding_completed_at: string | null;
          reduced_motion_enabled: boolean;
          updated_at: string;
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          auto_save_enabled?: boolean;
          onboarding_completed_at?: string | null;
          reduced_motion_enabled?: boolean;
          updated_at?: string;
          user_id: string;
          workspace_id: string;
        };
        Update: {
          auto_save_enabled?: boolean;
          onboarding_completed_at?: string | null;
          reduced_motion_enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspace_memberships: {
        Row: {
          created_at: string;
          role: WorkspaceRole;
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          created_at?: string;
          role?: WorkspaceRole;
          user_id: string;
          workspace_id: string;
        };
        Update: { role?: WorkspaceRole };
        Relationships: [];
      };
      workspaces: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          owner_id: string;
          storage_quota_bytes: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          owner_id: string;
          storage_quota_bytes?: number;
          updated_at?: string;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      workspace_storage_usage: {
        Args: { target_workspace_id: string };
        Returns: Array<{ quota_bytes: number; used_bytes: number }>;
      };
    };
    Enums: {
      asset_kind: AssetKind;
      comment_status: CommentStatus;
      presentation_kind: PresentationKind;
      workspace_role: WorkspaceRole;
    };
    CompositeTypes: Record<never, never>;
  };
};
