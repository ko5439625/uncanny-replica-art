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
      announcement: {
        Row: {
          id: number
          text: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          id?: number
          text?: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          id?: number
          text?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      anonymous_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: number
          user_id: number
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: number
          user_id: number
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "anonymous_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anonymous_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_posts: {
        Row: {
          author_id: number
          content: string
          created_at: string
          id: number
        }
        Insert: {
          author_id: number
          content: string
          created_at?: string
          id?: number
        }
        Update: {
          author_id?: number
          content?: string
          created_at?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          created_at: string
          date: string
          id: string
          user_id: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          user_id: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "availability_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      balance_games: {
        Row: {
          created_at: string
          ended_at: string | null
          id: number
          is_active: boolean
          option_a: string
          option_b: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: number
          is_active?: boolean
          option_a: string
          option_b: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: number
          is_active?: boolean
          option_a?: string
          option_b?: string
        }
        Relationships: []
      }
      balance_votes: {
        Row: {
          created_at: string
          game_id: number
          id: string
          user_id: number
          vote: string
        }
        Insert: {
          created_at?: string
          game_id: number
          id?: string
          user_id: number
          vote: string
        }
        Update: {
          created_at?: string
          game_id?: number
          id?: string
          user_id?: number
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "balance_votes_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "balance_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balance_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rules: {
        Row: {
          created_at: string
          id: number
          order_num: number
          text: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          id?: number
          order_num?: number
          text: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          id?: number
          order_num?: number
          text?: string
          visible?: boolean
        }
        Relationships: []
      }
      user_post_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          post_id: number
          user_id: number
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          post_id: number
          user_id: number
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          post_id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "user_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_post_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_posts: {
        Row: {
          content: string
          created_at: string
          date: string
          id: number
          user_id: number
        }
        Insert: {
          content: string
          created_at?: string
          date: string
          id?: number
          user_id: number
        }
        Update: {
          content?: string
          created_at?: string
          date?: string
          id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          emoji: string
          id: number
          is_admin: boolean
          name: string
          nickname: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          id?: number
          is_admin?: boolean
          name: string
          nickname: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: number
          is_admin?: boolean
          name?: string
          nickname?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
