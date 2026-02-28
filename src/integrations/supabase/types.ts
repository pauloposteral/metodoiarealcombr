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
      badges: {
        Row: {
          category: string
          color: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          points_required: number
        }
        Insert: {
          category?: string
          color?: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          name: string
          points_required?: number
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          points_required?: number
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_code: string
          completed_at: string
          course_name: string
          created_at: string
          id: string
          student_name: string
          total_hours: number
          user_id: string
        }
        Insert: {
          certificate_code: string
          completed_at?: string
          course_name?: string
          created_at?: string
          id?: string
          student_name: string
          total_hours: number
          user_id: string
        }
        Update: {
          certificate_code?: string
          completed_at?: string
          course_name?: string
          created_at?: string
          id?: string
          student_name?: string
          total_hours?: number
          user_id?: string
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          community_comment_id: string | null
          created_at: string
          id: string
          lesson_comment_id: string | null
          user_id: string
        }
        Insert: {
          community_comment_id?: string | null
          created_at?: string
          id?: string
          lesson_comment_id?: string | null
          user_id: string
        }
        Update: {
          community_comment_id?: string | null
          created_at?: string
          id?: string
          lesson_comment_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_community_comment_id_fkey"
            columns: ["community_comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_lesson_comment_id_fkey"
            columns: ["lesson_comment_id"]
            isOneToOne: false
            referencedRelation: "lesson_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          parent_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          parent_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          category: Database["public"]["Enums"]["community_category"]
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["community_category"]
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["community_category"]
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          admin_user_id: string | null
          created_at: string | null
          email: string
          id: string
          max_users: number
          name: string
          phone: string | null
          plan: Database["public"]["Enums"]["company_plan"]
          slug: string
          status: Database["public"]["Enums"]["company_status"]
          updated_at: string | null
        }
        Insert: {
          admin_user_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          max_users?: number
          name: string
          phone?: string | null
          plan?: Database["public"]["Enums"]["company_plan"]
          slug: string
          status?: Database["public"]["Enums"]["company_status"]
          updated_at?: string | null
        }
        Update: {
          admin_user_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          max_users?: number
          name?: string
          phone?: string | null
          plan?: Database["public"]["Enums"]["company_plan"]
          slug?: string
          status?: Database["public"]["Enums"]["company_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      company_leads: {
        Row: {
          company_name: string
          contact_name: string
          converted_company_id: string | null
          created_at: string | null
          email: string
          employees_count: string | null
          id: string
          industry: string | null
          message: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_name: string
          contact_name: string
          converted_company_id?: string | null
          created_at?: string | null
          email: string
          employees_count?: string | null
          id?: string
          industry?: string | null
          message?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string
          contact_name?: string
          converted_company_id?: string | null
          created_at?: string | null
          email?: string
          employees_count?: string | null
          id?: string
          industry?: string | null
          message?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_leads_converted_company_id_fkey"
            columns: ["converted_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_users: {
        Row: {
          company_id: string
          id: string
          invited_by: string | null
          joined_at: string | null
          role: Database["public"]["Enums"]["company_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: Database["public"]["Enums"]["company_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: Database["public"]["Enums"]["company_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          lesson_id: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          lesson_id: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          lesson_id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_comments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "lesson_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          module_id: string
          order_index: number
          prompts: string[] | null
          title: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          module_id: string
          order_index?: number
          prompts?: string[] | null
          title: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          module_id?: string
          order_index?: number
          prompts?: string[] | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          title: string
          type: string
          url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          type?: string
          url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          type?: string
          url?: string | null
        }
        Relationships: []
      }
      modules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          order_index: number
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number
          title?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          access_status: string | null
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          access_status?: string | null
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          access_status?: string | null
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      prompts: {
        Row: {
          category: Database["public"]["Enums"]["prompt_category"]
          content: string
          created_at: string | null
          description: string | null
          id: string
          is_premium: boolean | null
          order_index: number | null
          subcategory: string | null
          title: string
          updated_at: string | null
          usage_count: number | null
          variables: Json | null
        }
        Insert: {
          category: Database["public"]["Enums"]["prompt_category"]
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_premium?: boolean | null
          order_index?: number | null
          subcategory?: string | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Update: {
          category?: Database["public"]["Enums"]["prompt_category"]
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_premium?: boolean | null
          order_index?: number | null
          subcategory?: string | null
          title?: string
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          client_document: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string | null
          greenn_client_id: number | null
          greenn_sale_id: number
          id: string
          payment_method: string | null
          product_id: number | null
          product_name: string
          raw_payload: Json | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          client_document?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          greenn_client_id?: number | null
          greenn_sale_id: number
          id?: string
          payment_method?: string | null
          product_id?: number | null
          product_name: string
          raw_payload?: Json | null
          status: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          client_document?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          greenn_client_id?: number | null
          greenn_sale_id?: number
          id?: string
          payment_method?: string | null
          product_id?: number | null
          product_name?: string
          raw_payload?: Json | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      saved_carousels: {
        Row: {
          alternative_title: string | null
          caption: string | null
          config: Json | null
          created_at: string
          first_comment: string | null
          hashtags: string[] | null
          id: string
          quality_score: Json | null
          slides: Json
          theme: Json | null
          thumbnail_url: string | null
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alternative_title?: string | null
          caption?: string | null
          config?: Json | null
          created_at?: string
          first_comment?: string | null
          hashtags?: string[] | null
          id?: string
          quality_score?: Json | null
          slides?: Json
          theme?: Json | null
          thumbnail_url?: string | null
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alternative_title?: string | null
          caption?: string | null
          config?: Json | null
          created_at?: string
          first_comment?: string | null
          hashtags?: string[] | null
          id?: string
          quality_score?: Json | null
          slides?: Json
          theme?: Json | null
          thumbnail_url?: string | null
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_hooks: {
        Row: {
          category: string | null
          created_at: string
          hook_type: string
          id: string
          is_favorite: boolean | null
          score: number | null
          text: string
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          hook_type?: string
          id?: string
          is_favorite?: boolean | null
          score?: number | null
          text: string
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          hook_type?: string
          id?: string
          is_favorite?: boolean | null
          score?: number | null
          text?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          comments_count: number
          created_at: string
          id: string
          lessons_completed: number
          level: number
          likes_received: number
          points: number
          posts_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          created_at?: string
          id?: string
          lessons_completed?: number
          level?: number
          likes_received?: number
          points?: number
          posts_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          created_at?: string
          id?: string
          lessons_completed?: number
          level?: number
          likes_received?: number
          points?: number
          posts_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_saved_prompts: {
        Row: {
          created_at: string | null
          custom_content: string | null
          custom_title: string | null
          id: string
          is_favorite: boolean | null
          prompt_id: string | null
          updated_at: string | null
          user_id: string
          variables_values: Json | null
        }
        Insert: {
          created_at?: string | null
          custom_content?: string | null
          custom_title?: string | null
          id?: string
          is_favorite?: boolean | null
          prompt_id?: string | null
          updated_at?: string | null
          user_id: string
          variables_values?: Json | null
        }
        Update: {
          created_at?: string | null
          custom_content?: string | null
          custom_title?: string | null
          id?: string
          is_favorite?: boolean | null
          prompt_id?: string | null
          updated_at?: string | null
          user_id?: string
          variables_values?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "user_saved_prompts_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      has_active_company: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_company_admin: { Args: { _user_id: string }; Returns: boolean }
      is_moderator: { Args: { _user_id: string }; Returns: boolean }
      validate_certificate: {
        Args: { cert_code: string }
        Returns: {
          certificate_code: string
          completed_at: string
          course_name: string
          student_name: string
          total_hours: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      community_category:
        | "discussoes"
        | "duvidas"
        | "resultados"
        | "sugestoes"
        | "avisos"
      company_plan: "starter" | "pro" | "business"
      company_role: "admin" | "user"
      company_status: "pending" | "active" | "suspended"
      prompt_category:
        | "marketing"
        | "conteudo"
        | "atendimento"
        | "gestao"
        | "vendas"
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
      app_role: ["admin", "moderator", "user"],
      community_category: [
        "discussoes",
        "duvidas",
        "resultados",
        "sugestoes",
        "avisos",
      ],
      company_plan: ["starter", "pro", "business"],
      company_role: ["admin", "user"],
      company_status: ["pending", "active", "suspended"],
      prompt_category: [
        "marketing",
        "conteudo",
        "atendimento",
        "gestao",
        "vendas",
      ],
    },
  },
} as const
