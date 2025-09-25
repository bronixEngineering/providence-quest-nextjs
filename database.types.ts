export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  public: {
    Tables: {
      accepted_referrals: {
        Row: {
          created_at: string;
          id: string;
          point_given: number | null;
          referral_code: string | null;
          referral_owner: string | null;
          referral_run: string | null;
          referral_usage_id: string | null;
          referral_used_by: string | null;
          run_count: number | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          point_given?: number | null;
          referral_code?: string | null;
          referral_owner?: string | null;
          referral_run?: string | null;
          referral_usage_id?: string | null;
          referral_used_by?: string | null;
          run_count?: number | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          point_given?: number | null;
          referral_code?: string | null;
          referral_owner?: string | null;
          referral_run?: string | null;
          referral_usage_id?: string | null;
          referral_used_by?: string | null;
          run_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "accepted_referrals_referral_run_fkey";
            columns: ["referral_run"];
            isOneToOne: false;
            referencedRelation: "referral_function_runs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accepted_referrals_referral_usage_id_fkey";
            columns: ["referral_usage_id"];
            isOneToOne: false;
            referencedRelation: "referral_usage";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accepted_refferals_refferal_owner_fkey";
            columns: ["referral_owner"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accepted_refferals_refferal_used_by_fkey";
            columns: ["referral_used_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      badges: {
        Row: {
          color: string | null;
          created_at: string;
          discord_role_id: string;
          id: number;
          name: string;
          permissions: string | null;
          position: number | null;
          updated_at: string | null;
        };
        Insert: {
          color?: string | null;
          created_at: string;
          discord_role_id: string;
          id?: number;
          name: string;
          permissions?: string | null;
          position?: number | null;
          updated_at?: string | null;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          discord_role_id?: string;
          id?: number;
          name?: string;
          permissions?: string | null;
          position?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      daily_checkins: {
        Row: {
          base_xp: number | null;
          bonus_reward: string | null;
          bonus_xp: number | null;
          checked_in_at: string | null;
          checkin_date: string;
          created_at: string | null;
          id: string;
          streak_day: number | null;
          tokens_earned: number | null;
          total_xp: number | null;
          user_email: string;
        };
        Insert: {
          base_xp?: number | null;
          bonus_reward?: string | null;
          bonus_xp?: number | null;
          checked_in_at?: string | null;
          checkin_date: string;
          created_at?: string | null;
          id?: string;
          streak_day?: number | null;
          tokens_earned?: number | null;
          total_xp?: number | null;
          user_email: string;
        };
        Update: {
          base_xp?: number | null;
          bonus_reward?: string | null;
          bonus_xp?: number | null;
          checked_in_at?: string | null;
          checkin_date?: string;
          created_at?: string | null;
          id?: string;
          streak_day?: number | null;
          tokens_earned?: number | null;
          total_xp?: number | null;
          user_email?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          completed_quests: number | null;
          created_at: string | null;
          email: string | null;
          id: string;
          name: string | null;
          primary_wallet_address: string | null;
          referral_count: number | null;
          tokens: number | null;
          total_quests: number | null;
          updated_at: string | null;
          user_id: string;
          wallet_verified: boolean | null;
          wallet_verified_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          completed_quests?: number | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name?: string | null;
          primary_wallet_address?: string | null;
          referral_count?: number | null;
          tokens?: number | null;
          total_quests?: number | null;
          updated_at?: string | null;
          user_id: string;
          wallet_verified?: boolean | null;
          wallet_verified_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          completed_quests?: number | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name?: string | null;
          primary_wallet_address?: string | null;
          referral_count?: number | null;
          tokens?: number | null;
          total_quests?: number | null;
          updated_at?: string | null;
          user_id?: string;
          wallet_verified?: boolean | null;
          wallet_verified_at?: string | null;
        };
        Relationships: [];
      };
      quest_definitions: {
        Row: {
          category: string;
          created_at: string | null;
          description: string;
          id: string;
          is_active: boolean | null;
          is_repeatable: boolean | null;
          repeat_interval: string | null;
          requirements: Json;
          requires_quest_id: string | null;
          sort_order: number | null;
          special_reward: string | null;
          title: string;
          token_reward: number;
          type: Database["public"]["Enums"]["quest_type"];
          updated_at: string | null;
          xp_reward: number;
        };
        Insert: {
          category: string;
          created_at?: string | null;
          description: string;
          id?: string;
          is_active?: boolean | null;
          is_repeatable?: boolean | null;
          repeat_interval?: string | null;
          requirements?: Json;
          requires_quest_id?: string | null;
          sort_order?: number | null;
          special_reward?: string | null;
          title: string;
          token_reward?: number;
          type: Database["public"]["Enums"]["quest_type"];
          updated_at?: string | null;
          xp_reward?: number;
        };
        Update: {
          category?: string;
          created_at?: string | null;
          description?: string;
          id?: string;
          is_active?: boolean | null;
          is_repeatable?: boolean | null;
          repeat_interval?: string | null;
          requirements?: Json;
          requires_quest_id?: string | null;
          sort_order?: number | null;
          special_reward?: string | null;
          title?: string;
          token_reward?: number;
          type?: Database["public"]["Enums"]["quest_type"];
          updated_at?: string | null;
          xp_reward?: number;
        };
        Relationships: [
          {
            foreignKeyName: "quest_definitions_requires_quest_id_fkey";
            columns: ["requires_quest_id"];
            isOneToOne: false;
            referencedRelation: "quest_definitions";
            referencedColumns: ["id"];
          }
        ];
      };
      referral_codes: {
        Row: {
          created_at: string | null;
          id: string;
          profile_id: string;
          referral_code: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          profile_id: string;
          referral_code: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          profile_id?: string;
          referral_code?: string;
        };
        Relationships: [
          {
            foreignKeyName: "referral_codes_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      referral_function_runs: {
        Row: {
          created_at: string;
          id: string;
          run_count: number | null;
          total_already_accepted: number | null;
          total_failed: number | null;
          total_processed: number | null;
          total_success: number | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          run_count?: number | null;
          total_already_accepted?: number | null;
          total_failed?: number | null;
          total_processed?: number | null;
          total_success?: number | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          run_count?: number | null;
          total_already_accepted?: number | null;
          total_failed?: number | null;
          total_processed?: number | null;
          total_success?: number | null;
        };
        Relationships: [];
      };
      referral_usage: {
        Row: {
          id: string;
          referred_profile_id: string;
          referrer_profile_id: string;
          used_at: string | null;
        };
        Insert: {
          id?: string;
          referred_profile_id: string;
          referrer_profile_id: string;
          used_at?: string | null;
        };
        Update: {
          id?: string;
          referred_profile_id?: string;
          referrer_profile_id?: string;
          used_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "referral_usage_referred_profile_id_fkey";
            columns: ["referred_profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referral_usage_referrer_profile_id_fkey";
            columns: ["referrer_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_badges: {
        Row: {
          assigned_at: string | null;
          badge_discord_role_id: string;
          id: number;
          user_discord_id: string;
        };
        Insert: {
          assigned_at?: string | null;
          badge_discord_role_id: string;
          id?: number;
          user_discord_id: string;
        };
        Update: {
          assigned_at?: string | null;
          badge_discord_role_id?: string;
          id?: number;
          user_discord_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_discord_role_id_fkey";
            columns: ["badge_discord_role_id"];
            isOneToOne: false;
            referencedRelation: "badges";
            referencedColumns: ["discord_role_id"];
          },
          {
            foreignKeyName: "user_badges_user_discord_id_fkey";
            columns: ["user_discord_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["discord_id"];
          }
        ];
      };
      user_quest_completions: {
        Row: {
          completed_at: string | null;
          completion_data: Json | null;
          completion_date: string | null;
          created_at: string | null;
          id: string;
          quest_id: string;
          special_reward_earned: string | null;
          tokens_earned: number | null;
          user_email: string;
          user_id: string | null;
          xp_earned: number | null;
        };
        Insert: {
          completed_at?: string | null;
          completion_data?: Json | null;
          completion_date?: string | null;
          created_at?: string | null;
          id?: string;
          quest_id: string;
          special_reward_earned?: string | null;
          tokens_earned?: number | null;
          user_email: string;
          user_id?: string | null;
          xp_earned?: number | null;
        };
        Update: {
          completed_at?: string | null;
          completion_data?: Json | null;
          completion_date?: string | null;
          created_at?: string | null;
          id?: string;
          quest_id?: string;
          special_reward_earned?: string | null;
          tokens_earned?: number | null;
          user_email?: string;
          user_id?: string | null;
          xp_earned?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_quest_completions_quest_id_fkey";
            columns: ["quest_id"];
            isOneToOne: false;
            referencedRelation: "quest_definitions";
            referencedColumns: ["id"];
          }
        ];
      };
      user_score: {
        Row: {
          created_at: string;
          id: string;
          profile_id: string | null;
          score: number | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          profile_id?: string | null;
          score?: number | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          profile_id?: string | null;
          score?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_score_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_social_connections: {
        Row: {
          connected_at: string | null;
          id: string;
          is_following: boolean | null;
          is_verified: boolean | null;
          platform: string;
          platform_data: Json | null;
          platform_user_id: string | null;
          platform_username: string | null;
          updated_at: string | null;
          user_email: string;
          user_id: string | null;
          verification_token: string | null;
          verified_at: string | null;
        };
        Insert: {
          connected_at?: string | null;
          id?: string;
          is_following?: boolean | null;
          is_verified?: boolean | null;
          platform: string;
          platform_data?: Json | null;
          platform_user_id?: string | null;
          platform_username?: string | null;
          updated_at?: string | null;
          user_email: string;
          user_id?: string | null;
          verification_token?: string | null;
          verified_at?: string | null;
        };
        Update: {
          connected_at?: string | null;
          id?: string;
          is_following?: boolean | null;
          is_verified?: boolean | null;
          platform?: string;
          platform_data?: Json | null;
          platform_user_id?: string | null;
          platform_username?: string | null;
          updated_at?: string | null;
          user_email?: string;
          user_id?: string | null;
          verification_token?: string | null;
          verified_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_social_connections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          }
        ];
      };
      user_stats: {
        Row: {
          badges: Json | null;
          connected_social_accounts: number | null;
          created_at: string | null;
          current_daily_streak: number | null;
          daily_quests_completed: number | null;
          last_checkin_date: string | null;
          level: number | null;
          longest_daily_streak: number | null;
          social_quests_completed: number | null;
          tokens: number | null;
          total_quests_completed: number | null;
          total_xp: number | null;
          updated_at: string | null;
          user_email: string;
          web3_quests_completed: number | null;
        };
        Insert: {
          badges?: Json | null;
          connected_social_accounts?: number | null;
          created_at?: string | null;
          current_daily_streak?: number | null;
          daily_quests_completed?: number | null;
          last_checkin_date?: string | null;
          level?: number | null;
          longest_daily_streak?: number | null;
          social_quests_completed?: number | null;
          tokens?: number | null;
          total_quests_completed?: number | null;
          total_xp?: number | null;
          updated_at?: string | null;
          user_email: string;
          web3_quests_completed?: number | null;
        };
        Update: {
          badges?: Json | null;
          connected_social_accounts?: number | null;
          created_at?: string | null;
          current_daily_streak?: number | null;
          daily_quests_completed?: number | null;
          last_checkin_date?: string | null;
          level?: number | null;
          longest_daily_streak?: number | null;
          social_quests_completed?: number | null;
          tokens?: number | null;
          total_quests_completed?: number | null;
          total_xp?: number | null;
          updated_at?: string | null;
          user_email?: string;
          web3_quests_completed?: number | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          discord_id: string;
          display_name: string | null;
          id: number;
          joined_at: string | null;
          updated_at: string | null;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at: string;
          discord_id: string;
          display_name?: string | null;
          id?: number;
          joined_at?: string | null;
          updated_at?: string | null;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          discord_id?: string;
          display_name?: string | null;
          id?: number;
          joined_at?: string | null;
          updated_at?: string | null;
          username?: string;
        };
        Relationships: [];
      };
      wallet_accounts: {
        Row: {
          connected_at: string | null;
          created_at: string | null;
          id: string;
          is_primary: boolean | null;
          is_verified: boolean | null;
          network_chain_id: number | null;
          nonce: string | null;
          updated_at: string | null;
          user_email: string;
          verification_message: string | null;
          verification_signature: string | null;
          verified_at: string | null;
          wallet_address: string;
        };
        Insert: {
          connected_at?: string | null;
          created_at?: string | null;
          id?: string;
          is_primary?: boolean | null;
          is_verified?: boolean | null;
          network_chain_id?: number | null;
          nonce?: string | null;
          updated_at?: string | null;
          user_email: string;
          verification_message?: string | null;
          verification_signature?: string | null;
          verified_at?: string | null;
          wallet_address: string;
        };
        Update: {
          connected_at?: string | null;
          created_at?: string | null;
          id?: string;
          is_primary?: boolean | null;
          is_verified?: boolean | null;
          network_chain_id?: number | null;
          nonce?: string | null;
          updated_at?: string | null;
          user_email?: string;
          verification_message?: string | null;
          verification_signature?: string | null;
          verified_at?: string | null;
          wallet_address?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wallet_accounts_user_email_fkey";
            columns: ["user_email"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["email"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_level_from_xp: {
        Args: { xp: number };
        Returns: number;
      };
      process_daily_checkin: {
        Args: { p_user_email: string };
        Returns: {
          bonus_reward: string;
          message: string;
          streak_day: number;
          success: boolean;
          tokens_earned: number;
          xp_earned: number;
        }[];
      };
      update_user_stats_after_quest: {
        Args: {
          p_quest_type: Database["public"]["Enums"]["quest_type"];
          p_tokens_earned: number;
          p_user_email: string;
          p_xp_earned: number;
        };
        Returns: undefined;
      };
    };
    Enums: {
      quest_status: "available" | "completed" | "locked";
      quest_type: "daily" | "social" | "web3";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      quest_status: ["available", "completed", "locked"],
      quest_type: ["daily", "social", "web3"],
    },
  },
} as const;
