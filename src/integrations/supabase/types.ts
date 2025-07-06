export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ad_images: {
        Row: {
          ad_id: string | null
          alt_text: string | null
          created_at: string | null
          id: string
          image_url: string
          is_primary: boolean | null
          sort_order: number | null
        }
        Insert: {
          ad_id?: string | null
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          sort_order?: number | null
        }
        Update: {
          ad_id?: string | null
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_images_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_dashboard_stats: {
        Row: {
          activeads: number | null
          adminusers: number | null
          bannedusers: number | null
          boostedads: number | null
          created_at: string | null
          id: string
          moderatorusers: number | null
          pendingreports: number | null
          pendingverifications: number | null
          totalads: number | null
          totalconversations: number | null
          totalmessages: number | null
          totalplatformtrades: number | null
          totalplatformvolume: number | null
          totalreports: number | null
          totalusers: number | null
          totalverificationrequests: number | null
          updated_at: string | null
          verifiedusers: number | null
        }
        Insert: {
          activeads?: number | null
          adminusers?: number | null
          bannedusers?: number | null
          boostedads?: number | null
          created_at?: string | null
          id?: string
          moderatorusers?: number | null
          pendingreports?: number | null
          pendingverifications?: number | null
          totalads?: number | null
          totalconversations?: number | null
          totalmessages?: number | null
          totalplatformtrades?: number | null
          totalplatformvolume?: number | null
          totalreports?: number | null
          totalusers?: number | null
          totalverificationrequests?: number | null
          updated_at?: string | null
          verifiedusers?: number | null
        }
        Update: {
          activeads?: number | null
          adminusers?: number | null
          bannedusers?: number | null
          boostedads?: number | null
          created_at?: string | null
          id?: string
          moderatorusers?: number | null
          pendingreports?: number | null
          pendingverifications?: number | null
          totalads?: number | null
          totalconversations?: number | null
          totalmessages?: number | null
          totalplatformtrades?: number | null
          totalplatformvolume?: number | null
          totalreports?: number | null
          totalusers?: number | null
          totalverificationrequests?: number | null
          updated_at?: string | null
          verifiedusers?: number | null
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string
          target_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id: string
          target_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string
          target_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          accepted_coins: string[]
          boosted_until: string | null
          category: string | null
          category_id: string | null
          condition: string | null
          contact_count: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string
          favorite_count: number | null
          favorites: number | null
          featured: boolean | null
          id: string
          images: string[] | null
          location: string | null
          metadata: Json | null
          price: number
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
          view_count: number | null
          views: number | null
        }
        Insert: {
          accepted_coins?: string[]
          boosted_until?: string | null
          category?: string | null
          category_id?: string | null
          condition?: string | null
          contact_count?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description: string
          favorite_count?: number | null
          favorites?: number | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          location?: string | null
          metadata?: Json | null
          price: number
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
          views?: number | null
        }
        Update: {
          accepted_coins?: string[]
          boosted_until?: string | null
          category?: string | null
          category_id?: string | null
          condition?: string | null
          contact_count?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string
          favorite_count?: number | null
          favorites?: number | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          location?: string | null
          metadata?: Json | null
          price?: number
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      boost_packages: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          duration_days: number
          features: string[] | null
          id: number
          name: string
          price_eur: number
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_days: number
          features?: string[] | null
          id?: number
          name: string
          price_eur: number
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_days?: number
          features?: string[] | null
          id?: number
          name?: string
          price_eur?: number
        }
        Relationships: []
      }
      boosts: {
        Row: {
          ad_id: string
          boost_end: string | null
          boost_start: string | null
          boost_type: string | null
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          ad_id: string
          boost_end?: string | null
          boost_start?: string | null
          boost_type?: string | null
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          ad_id?: string
          boost_end?: string | null
          boost_start?: string | null
          boost_type?: string | null
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boosts_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message: string | null
          last_message_at: string | null
          recipient_id: string
          sender_id: string
          unread_by_recipient: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          recipient_id: string
          sender_id: string
          unread_by_recipient?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          recipient_id?: string
          sender_id?: string
          unread_by_recipient?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversations_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      fees: {
        Row: {
          active: boolean | null
          boost_fee: number | null
          coin: string
          created_at: string | null
          id: number
          listing_fee: number | null
        }
        Insert: {
          active?: boolean | null
          boost_fee?: number | null
          coin: string
          created_at?: string | null
          id?: number
          listing_fee?: number | null
        }
        Update: {
          active?: boolean | null
          boost_fee?: number | null
          coin?: string
          created_at?: string | null
          id?: number
          listing_fee?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          message_type: string | null
          read_at: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_type?: string | null
          read_at?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_type?: string | null
          read_at?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          badges: string[] | null
          bio: string | null
          city: string | null
          completion_rate: number | null
          created_at: string | null
          favorite_categories: string[] | null
          full_name: string | null
          id: string
          is_flagged: boolean | null
          language: string | null
          last_active: string | null
          location: string | null
          member_since: string | null
          notification_preferences: Json | null
          notification_settings: Json | null
          phone: string | null
          preferred_coins: string[] | null
          preferred_language: string | null
          privacy_settings: Json | null
          rating: number | null
          response_time: string | null
          response_time_minutes: number | null
          role: string | null
          telegram_handle: string | null
          telegram_username: string | null
          timezone: string | null
          total_reviews: number | null
          total_trade_volume_eur: number | null
          total_trades: number | null
          trade_volume_eur: number | null
          trust_score: number | null
          updated_at: string | null
          user_id: string | null
          verification_level: string | null
          verified: boolean | null
          wallet_addresses: Json | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          badges?: string[] | null
          bio?: string | null
          city?: string | null
          completion_rate?: number | null
          created_at?: string | null
          favorite_categories?: string[] | null
          full_name?: string | null
          id?: string
          is_flagged?: boolean | null
          language?: string | null
          last_active?: string | null
          location?: string | null
          member_since?: string | null
          notification_preferences?: Json | null
          notification_settings?: Json | null
          phone?: string | null
          preferred_coins?: string[] | null
          preferred_language?: string | null
          privacy_settings?: Json | null
          rating?: number | null
          response_time?: string | null
          response_time_minutes?: number | null
          role?: string | null
          telegram_handle?: string | null
          telegram_username?: string | null
          timezone?: string | null
          total_reviews?: number | null
          total_trade_volume_eur?: number | null
          total_trades?: number | null
          trade_volume_eur?: number | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_level?: string | null
          verified?: boolean | null
          wallet_addresses?: Json | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          badges?: string[] | null
          bio?: string | null
          city?: string | null
          completion_rate?: number | null
          created_at?: string | null
          favorite_categories?: string[] | null
          full_name?: string | null
          id?: string
          is_flagged?: boolean | null
          language?: string | null
          last_active?: string | null
          location?: string | null
          member_since?: string | null
          notification_preferences?: Json | null
          notification_settings?: Json | null
          phone?: string | null
          preferred_coins?: string[] | null
          preferred_language?: string | null
          privacy_settings?: Json | null
          rating?: number | null
          response_time?: string | null
          response_time_minutes?: number | null
          role?: string | null
          telegram_handle?: string | null
          telegram_username?: string | null
          timezone?: string | null
          total_reviews?: number | null
          total_trade_volume_eur?: number | null
          total_trades?: number | null
          trade_volume_eur?: number | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_level?: string | null
          verified?: boolean | null
          wallet_addresses?: Json | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          reason: string
          reported_ad_id: string | null
          reported_user_id: string | null
          reporter_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason: string
          reported_ad_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string
          reported_ad_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_ad_id_fkey"
            columns: ["reported_ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          ad_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          reviewed_id: string | null
          reviewer_id: string | null
          trade_completed: boolean | null
        }
        Insert: {
          ad_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          reviewed_id?: string | null
          reviewer_id?: string | null
          trade_completed?: boolean | null
        }
        Update: {
          ad_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          reviewed_id?: string | null
          reviewer_id?: string | null
          trade_completed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string | null
          description: string | null
          key: string
          updated_at: string | null
          user_id: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          key: string
          updated_at?: string | null
          user_id?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          key?: string
          updated_at?: string | null
          user_id?: string | null
          value?: string | null
        }
        Relationships: []
      }
      trades: {
        Row: {
          ad_id: string
          amount: number
          buyer_id: string
          created_at: string | null
          currency: string
          id: string
          notes: string | null
          price_eur: number | null
          seller_id: string
          status: string
          trade_hash: string | null
        }
        Insert: {
          ad_id: string
          amount: number
          buyer_id: string
          created_at?: string | null
          currency: string
          id?: string
          notes?: string | null
          price_eur?: number | null
          seller_id: string
          status: string
          trade_hash?: string | null
        }
        Update: {
          ad_id?: string
          amount?: number
          buyer_id?: string
          created_at?: string | null
          currency?: string
          id?: string
          notes?: string | null
          price_eur?: number | null
          seller_id?: string
          status?: string
          trade_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trades_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trades_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      transactions: {
        Row: {
          ad_id: string | null
          amount: number
          buyer_id: string | null
          coin: string
          completed_at: string | null
          created_at: string | null
          escrow_address: string | null
          id: string
          resolved_by: string | null
          seller_id: string | null
          status: string | null
        }
        Insert: {
          ad_id?: string | null
          amount: number
          buyer_id?: string | null
          coin: string
          completed_at?: string | null
          created_at?: string | null
          escrow_address?: string | null
          id?: string
          resolved_by?: string | null
          seller_id?: string | null
          status?: string | null
        }
        Update: {
          ad_id?: string | null
          amount?: number
          buyer_id?: string | null
          coin?: string
          completed_at?: string | null
          created_at?: string | null
          escrow_address?: string | null
          id?: string
          resolved_by?: string | null
          seller_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          banned: boolean | null
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          last_active: string | null
          profile_image_url: string | null
          response_time_minutes: number | null
          role: string | null
          total_trade_volume_eur: number | null
          total_trades: number | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          banned?: boolean | null
          created_at?: string | null
          display_name?: string | null
          email: string
          id?: string
          last_active?: string | null
          profile_image_url?: string | null
          response_time_minutes?: number | null
          role?: string | null
          total_trade_volume_eur?: number | null
          total_trades?: number | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          banned?: boolean | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          last_active?: string | null
          profile_image_url?: string | null
          response_time_minutes?: number | null
          role?: string | null
          total_trade_volume_eur?: number | null
          total_trades?: number | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          document_back_url: string | null
          document_front_url: string | null
          document_type: string
          full_name: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          selfie_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          document_back_url?: string | null
          document_front_url?: string | null
          document_type: string
          full_name: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          document_back_url?: string | null
          document_front_url?: string | null
          document_type?: string
          full_name?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_trust_score: {
        Args: { user_uuid: string }
        Returns: number
      }
      check_profile_completion: {
        Args: { user_id: string }
        Returns: boolean
      }
      get_all_categories: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          slug: string
          icon: string
          description: string
          parent_id: string
          parent_name: string
          active: boolean
          sort_order: number
        }[]
      }
      get_all_verification_requests: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          status: string
          document_type: string
          document_front_url: string
          document_back_url: string
          selfie_url: string
          full_name: string
          date_of_birth: string
          address: string
          notes: string
          admin_notes: string
          reviewed_by: string
          reviewed_at: string
          created_at: string
          updated_at: string
          user_email: string
          user_profile_name: string
          user_city: string
        }[]
      }
      get_categories_by_parent: {
        Args: { parent_uuid?: string }
        Returns: {
          id: string
          name: string
          slug: string
          icon: string
          description: string
          sort_order: number
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_verification_request: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          user_id: string
          status: string
          document_type: string
          document_front_url: string
          document_back_url: string
          selfie_url: string
          full_name: string
          date_of_birth: string
          address: string
          notes: string
          admin_notes: string
          reviewed_by: string
          reviewed_at: string
          created_at: string
          updated_at: string
        }[]
      }
      increment_ad_views: {
        Args: Record<PropertyKey, never> | { ad_id: string }
        Returns: undefined
      }
      update_verification_status: {
        Args:
          | { p_request_id: string; p_status: string; p_admin_notes?: string }
          | {
              p_request_id: string
              p_status: string
              p_admin_notes?: string
              p_admin_id?: string
            }
        Returns: boolean
      }
    }
    Enums: {
      ad_status: "active" | "inactive" | "banned" | "sold"
      boost_type: "highlighted" | "featured" | "premium"
      currency_type: "EUR" | "USD" | "BTC" | "SOL" | "USDT"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ad_status: ["active", "inactive", "banned", "sold"],
      boost_type: ["highlighted", "featured", "premium"],
      currency_type: ["EUR", "USD", "BTC", "SOL", "USDT"],
    },
  },
} as const
