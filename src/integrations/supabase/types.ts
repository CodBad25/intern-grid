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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      commentaires: {
        Row: {
          content: string
          created_at: string
          id: string
          tuteur_id: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          tuteur_id: string
          type: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          tuteur_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "commentaires_tuteur_id_fkey"
            columns: ["tuteur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: number
          is_group: boolean
          participants: string[]
        }
        Insert: {
          created_at?: string
          id?: number
          is_group?: boolean
          participants: string[]
        }
        Update: {
          created_at?: string
          id?: number
          is_group?: boolean
          participants?: string[]
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          description: string
          id: string
          shared_with_peers: boolean
          titre: string
          tuteur_id: string
          type: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          shared_with_peers?: boolean
          titre: string
          tuteur_id: string
          type: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          shared_with_peers?: boolean
          titre?: string
          tuteur_id?: string
          type?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_tuteur_id_fkey"
            columns: ["tuteur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      evenements: {
        Row: {
          created_at: string
          date: string
          description: string
          id: string
          shared_with_peers: boolean
          titre: string
          tuteur_id: string
          type: string
        }
        Insert: {
          created_at?: string
          date: string
          description?: string
          id?: string
          shared_with_peers?: boolean
          titre: string
          tuteur_id: string
          type: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          id?: string
          shared_with_peers?: boolean
          titre?: string
          tuteur_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "evenements_tuteur_id_fkey"
            columns: ["tuteur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      liens: {
        Row: {
          created_at: string
          description: string | null
          id: string
          source_id: string
          source_type: string
          title: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          source_id: string
          source_type: string
          title?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          source_id?: string
          source_type?: string
          title?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: number | null
          created_at: string
          id: string
          recipient_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          conversation_id?: number | null
          created_at?: string
          id?: string
          recipient_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: number | null
          created_at?: string
          id?: string
          recipient_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          content: string
          created_at: string
          created_by: string
          id: string
          metadata: Json | null
          read: boolean
          target_user_id: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          action_url?: string | null
          content: string
          created_at?: string
          created_by: string
          id?: string
          metadata?: Json | null
          read?: boolean
          target_user_id?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          action_url?: string | null
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          metadata?: Json | null
          read?: boolean
          target_user_id?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      poll_options: {
        Row: {
          id: string
          option_text: string
          poll_id: string
        }
        Insert: {
          id?: string
          option_text: string
          poll_id: string
        }
        Update: {
          id?: string
          option_text?: string
          poll_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          id: string
          option_id: string
          user_id: string
        }
        Insert: {
          id?: string
          option_id: string
          user_id: string
        }
        Update: {
          id?: string
          option_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          conversation_id: number
          created_at: string
          created_by: string
          id: string
          question: string
        }
        Insert: {
          conversation_id: number
          created_at?: string
          created_by: string
          id?: string
          question: string
        }
        Update: {
          conversation_id?: number
          created_at?: string
          created_by?: string
          id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polls_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          color: string | null
          created_at: string
          display_name: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          color?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          color?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string
          id: string
          target_id: string
          target_type: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_id: string
          target_type: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_id?: string
          target_type?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      reponses: {
        Row: {
          commentaire_id: string
          content: string
          created_at: string
          id: string
          shared_with_peers: boolean
          tuteur_id: string
        }
        Insert: {
          commentaire_id: string
          content: string
          created_at?: string
          id?: string
          shared_with_peers?: boolean
          tuteur_id: string
        }
        Update: {
          commentaire_id?: string
          content?: string
          created_at?: string
          id?: string
          shared_with_peers?: boolean
          tuteur_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reponses_commentaire_id_fkey"
            columns: ["commentaire_id"]
            isOneToOne: false
            referencedRelation: "commentaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reponses_tuteur_id_fkey"
            columns: ["tuteur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      seance_reactions: {
        Row: {
          created_at: string
          id: string
          seance_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          seance_id: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          seance_id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      seance_responses: {
        Row: {
          content: string
          created_at: string
          id: string
          seance_id: string
          shared_with_peers: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          seance_id: string
          shared_with_peers?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          seance_id?: string
          shared_with_peers?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      seances: {
        Row: {
          created_at: string
          creneau: string | null
          date: string
          duree: number
          heure: string | null
          horaire_mode: string | null
          id: string
          notes: string
          shared_with_peers: boolean
          tuteur_id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creneau?: string | null
          date: string
          duree: number
          heure?: string | null
          horaire_mode?: string | null
          id?: string
          notes?: string
          shared_with_peers?: boolean
          tuteur_id: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creneau?: string | null
          date?: string
          duree?: number
          heure?: string | null
          horaire_mode?: string | null
          id?: string
          notes?: string
          shared_with_peers?: boolean
          tuteur_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seances_tuteur_id_fkey"
            columns: ["tuteur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_presence_settings: {
        Row: {
          created_at: string
          custom_status: string | null
          id: string
          show_presence: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_status?: string | null
          id?: string
          show_presence?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_status?: string | null
          id?: string
          show_presence?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clear_test_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_demo_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_reaction_admin: {
        Args: { _reaction_id: string }
        Returns: undefined
      }
      ensure_profile_exists: {
        Args: { _user_id: string }
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      seed_demo_content: {
        Args: { _user_id: string }
        Returns: undefined
      }
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
