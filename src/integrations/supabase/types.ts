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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      content_outputs: {
        Row: {
          analysis_feedback: Json | null
          analysis_score: number | null
          content: string | null
          content_type: string | null
          created_at: string | null
          id: string
          improved_content: string | null
          input_type: string | null
          original_input: string | null
          platform: string | null
          project_id: string | null
          rewrite_count: number | null
          updated_at: string | null
        }
        Insert: {
          analysis_feedback?: Json | null
          analysis_score?: number | null
          content?: string | null
          content_type?: string | null
          created_at?: string | null
          id?: string
          improved_content?: string | null
          input_type?: string | null
          original_input?: string | null
          platform?: string | null
          project_id?: string | null
          rewrite_count?: number | null
          updated_at?: string | null
        }
        Update: {
          analysis_feedback?: Json | null
          analysis_score?: number | null
          content?: string | null
          content_type?: string | null
          created_at?: string | null
          id?: string
          improved_content?: string | null
          input_type?: string | null
          original_input?: string | null
          platform?: string | null
          project_id?: string | null
          rewrite_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_outputs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_notes: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          text: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          text: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          archived: boolean | null
          created_at: string | null
          description: string | null
          goal: string | null
          id: string
          input_type: string | null
          platforms: string[] | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          archived?: boolean | null
          created_at?: string | null
          description?: string | null
          goal?: string | null
          id?: string
          input_type?: string | null
          platforms?: string[] | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          archived?: boolean | null
          created_at?: string | null
          description?: string | null
          goal?: string | null
          id?: string
          input_type?: string | null
          platforms?: string[] | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_logs: {
        Row: {
          action: string | null
          created_at: string | null
          id: string
          units: number | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          id?: string
          units?: number | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          id?: string
          units?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stripe_data: {
        Row: {
          created_at: string | null
          id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_provider: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          experience_level: string | null
          full_name: string | null
          generations_used_this_month: number
          id: string
          monthly_generation_limit: number | null
          monthly_video_limit: number | null
          onboarding_completed: boolean | null
          plan: string | null
          plan_expires_at: string | null
          plan_started_at: string | null
          platforms: string[] | null
          primary_goal: string | null
          role: string | null
          status: string | null
          updated_at: string | null
          usage_reset_month: number
          usage_reset_year: number
        }
        Insert: {
          auth_provider?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          experience_level?: string | null
          full_name?: string | null
          generations_used_this_month?: number
          id: string
          monthly_generation_limit?: number | null
          monthly_video_limit?: number | null
          onboarding_completed?: boolean | null
          plan?: string | null
          plan_expires_at?: string | null
          plan_started_at?: string | null
          platforms?: string[] | null
          primary_goal?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          usage_reset_month?: number
          usage_reset_year?: number
        }
        Update: {
          auth_provider?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          experience_level?: string | null
          full_name?: string | null
          generations_used_this_month?: number
          id?: string
          monthly_generation_limit?: number | null
          monthly_video_limit?: number | null
          onboarding_completed?: boolean | null
          plan?: string | null
          plan_expires_at?: string | null
          plan_started_at?: string | null
          platforms?: string[] | null
          primary_goal?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          usage_reset_month?: number
          usage_reset_year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin"
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
      app_role: ["user", "admin"],
    },
  },
} as const
