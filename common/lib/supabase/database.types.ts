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
          guest_import_id: string | null;
          id: string;
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
          guest_import_id?: string | null;
          id?: string;
          last_opened_at?: string;
          source?: string;
          source_revision?: number;
          template_id?: string | null;
          title: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          guest_import_id?: string | null;
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
      touch_presentation_opened: {
        Args: { target_presentation_id: string };
        Returns: string | null;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
