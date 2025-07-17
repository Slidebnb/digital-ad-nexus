export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
          crypto_payment_enabled: boolean
          currency: string | null
          description: string
          favorite_count: number | null
          favorites: number | null
          featured: boolean | null
          id: string
          images: string[] | null
          location: string | null
          metadata: Json | null
          preferred_crypto: string[] | null
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
          crypto_payment_enabled?: boolean
          currency?: string | null
          description: string
          favorite_count?: number | null
          favorites?: number | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          location?: string | null
          metadata?: Json | null
          preferred_crypto?: string[] | null
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
          crypto_payment_enabled?: boolean
          currency?: string | null
          description?: string
          favorite_count?: number | null
          favorites?: number | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          location?: string | null
          metadata?: Json | null
          preferred_crypto?: string[] | null
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
        ]
      }
      affiliate_referrals: {
        Row: {
          commission_rate: number | null
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
          status: string | null
          total_earned: number | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
          status?: string | null
          total_earned?: number | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
          status?: string | null
          total_earned?: number | null
        }
        Relationships: []
      }
      boost_packages: {
        Row: {
          active: boolean | null
          created_at: string | null
          crypto_enabled: boolean
          description: string | null
          duration_days: number
          features: string[] | null
          id: number
          name: string
          price_btc: number | null
          price_eth: number | null
          price_eur: number
          price_sol: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          crypto_enabled?: boolean
          description?: string | null
          duration_days: number
          features?: string[] | null
          id?: number
          name: string
          price_btc?: number | null
          price_eth?: number | null
          price_eur: number
          price_sol?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          crypto_enabled?: boolean
          description?: string | null
          duration_days?: number
          features?: string[] | null
          id?: number
          name?: string
          price_btc?: number | null
          price_eth?: number | null
          price_eur?: number
          price_sol?: number | null
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
      compliance_documents: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          document_type: string
          effective_date: string | null
          id: string
          language: string | null
          last_updated: string | null
          metadata: Json | null
          status: string | null
          title: string
          updated_at: string | null
          version: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          document_type: string
          effective_date?: string | null
          id?: string
          language?: string | null
          last_updated?: string | null
          metadata?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
          version: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          document_type?: string
          effective_date?: string | null
          id?: string
          language?: string | null
          last_updated?: string | null
          metadata?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      compliance_stats: {
        Row: {
          analytics_consents: number | null
          audit_events_count: number | null
          compliance_score: number | null
          created_at: string | null
          date: string | null
          essential_consents: number | null
          functional_consents: number | null
          gdpr_requests_completed: number | null
          gdpr_requests_pending: number | null
          id: string
          marketing_consents: number | null
          tax_reports_generated: number | null
          total_cookie_consents: number | null
          updated_at: string | null
        }
        Insert: {
          analytics_consents?: number | null
          audit_events_count?: number | null
          compliance_score?: number | null
          created_at?: string | null
          date?: string | null
          essential_consents?: number | null
          functional_consents?: number | null
          gdpr_requests_completed?: number | null
          gdpr_requests_pending?: number | null
          id?: string
          marketing_consents?: number | null
          tax_reports_generated?: number | null
          total_cookie_consents?: number | null
          updated_at?: string | null
        }
        Update: {
          analytics_consents?: number | null
          audit_events_count?: number | null
          compliance_score?: number | null
          created_at?: string | null
          date?: string | null
          essential_consents?: number | null
          functional_consents?: number | null
          gdpr_requests_completed?: number | null
          gdpr_requests_pending?: number | null
          id?: string
          marketing_consents?: number | null
          tax_reports_generated?: number | null
          total_cookie_consents?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      cookie_consents: {
        Row: {
          consent_type: string
          created_at: string | null
          granted: boolean
          id: string
          ip_address: unknown | null
          timestamp: string
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          consent_type: string
          created_at?: string | null
          granted?: boolean
          id?: string
          ip_address?: unknown | null
          timestamp?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          consent_type?: string
          created_at?: string | null
          granted?: boolean
          id?: string
          ip_address?: unknown | null
          timestamp?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      crypto_payments: {
        Row: {
          ad_id: string | null
          amount_crypto: number
          amount_eur: number
          blockchain_network: string
          boost_package_id: number | null
          confirmation_count: number | null
          confirmed_at: string | null
          created_at: string
          cryptocurrency: string
          exchange_rate: number
          expires_at: string | null
          id: string
          metadata: Json | null
          payment_type: string
          status: string
          subscription_id: string | null
          transaction_hash: string | null
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          ad_id?: string | null
          amount_crypto: number
          amount_eur: number
          blockchain_network: string
          boost_package_id?: number | null
          confirmation_count?: number | null
          confirmed_at?: string | null
          created_at?: string
          cryptocurrency: string
          exchange_rate: number
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          payment_type: string
          status?: string
          subscription_id?: string | null
          transaction_hash?: string | null
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          ad_id?: string | null
          amount_crypto?: number
          amount_eur?: number
          blockchain_network?: string
          boost_package_id?: number | null
          confirmation_count?: number | null
          confirmed_at?: string | null
          created_at?: string
          cryptocurrency?: string
          exchange_rate?: number
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          payment_type?: string
          status?: string
          subscription_id?: string | null
          transaction_hash?: string | null
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      crypto_prices: {
        Row: {
          change_24h: number | null
          cryptocurrency: string
          id: string
          last_updated: string
          market_cap: number | null
          price_eur: number
          price_usd: number
          source: string
          volume_24h: number | null
        }
        Insert: {
          change_24h?: number | null
          cryptocurrency: string
          id?: string
          last_updated?: string
          market_cap?: number | null
          price_eur: number
          price_usd: number
          source?: string
          volume_24h?: number | null
        }
        Update: {
          change_24h?: number | null
          cryptocurrency?: string
          id?: string
          last_updated?: string
          market_cap?: number | null
          price_eur?: number
          price_usd?: number
          source?: string
          volume_24h?: number | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          ad_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          ad_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          ad_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
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
      gdpr_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          data_export_url: string | null
          id: string
          metadata: Json | null
          processed_at: string | null
          processed_by: string | null
          request_type: string
          requested_at: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          data_export_url?: string | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          processed_by?: string | null
          request_type: string
          requested_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          data_export_url?: string | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          processed_by?: string | null
          request_type?: string
          requested_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      market_data: {
        Row: {
          avg_price_eur: number
          coin: string
          date: string
          id: string
          max_price: number | null
          min_price: number | null
          total_volume: number | null
          trade_count: number | null
        }
        Insert: {
          avg_price_eur: number
          coin: string
          date?: string
          id?: string
          max_price?: number | null
          min_price?: number | null
          total_volume?: number | null
          trade_count?: number | null
        }
        Update: {
          avg_price_eur?: number
          coin?: string
          date?: string
          id?: string
          max_price?: number | null
          min_price?: number | null
          total_volume?: number | null
          trade_count?: number | null
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          title: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          title: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          title?: string
          usage_count?: number | null
          user_id?: string
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
        Relationships: []
      }
      notification_subscriptions: {
        Row: {
          categories: string[] | null
          created_at: string
          id: string
          is_active: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          categories?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          categories?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          created_at: string
          details: Json
          id: string
          is_verified: boolean | null
          method_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details: Json
          id?: string
          is_verified?: boolean | null
          method_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json
          id?: string
          is_verified?: boolean | null
          method_type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          block_number: number | null
          blockchain_status: string
          confirmation_blocks: number | null
          created_at: string
          crypto_payment_id: string
          error_message: string | null
          gas_price: number | null
          gas_used: number | null
          id: string
          network_fee: number | null
          required_confirmations: number | null
          transaction_hash: string | null
          updated_at: string
        }
        Insert: {
          block_number?: number | null
          blockchain_status?: string
          confirmation_blocks?: number | null
          created_at?: string
          crypto_payment_id: string
          error_message?: string | null
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          network_fee?: number | null
          required_confirmations?: number | null
          transaction_hash?: string | null
          updated_at?: string
        }
        Update: {
          block_number?: number | null
          blockchain_status?: string
          confirmation_blocks?: number | null
          created_at?: string
          crypto_payment_id?: string
          error_message?: string | null
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          network_fee?: number | null
          required_confirmations?: number | null
          transaction_hash?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_crypto_payment_id_fkey"
            columns: ["crypto_payment_id"]
            isOneToOne: false
            referencedRelation: "crypto_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      price_alerts: {
        Row: {
          coin: string
          condition: string
          created_at: string
          id: string
          is_active: boolean | null
          target_price: number
          triggered_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coin: string
          condition: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          target_price: number
          triggered_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coin?: string
          condition?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          target_price?: number
          triggered_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auto_convert_crypto: boolean
          avatar_url: string | null
          backup_codes: string[] | null
          badges: string[] | null
          bio: string | null
          city: string | null
          completion_rate: number | null
          created_at: string | null
          crypto_wallet_connected: boolean
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
          preferred_payment_methods: string[] | null
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
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
          user_id: string | null
          verification_level: string | null
          verified: boolean | null
          wallet_addresses: Json | null
          website: string | null
        }
        Insert: {
          auto_convert_crypto?: boolean
          avatar_url?: string | null
          backup_codes?: string[] | null
          badges?: string[] | null
          bio?: string | null
          city?: string | null
          completion_rate?: number | null
          created_at?: string | null
          crypto_wallet_connected?: boolean
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
          preferred_payment_methods?: string[] | null
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
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_level?: string | null
          verified?: boolean | null
          wallet_addresses?: Json | null
          website?: string | null
        }
        Update: {
          auto_convert_crypto?: boolean
          avatar_url?: string | null
          backup_codes?: string[] | null
          badges?: string[] | null
          bio?: string | null
          city?: string | null
          completion_rate?: number | null
          created_at?: string | null
          crypto_wallet_connected?: boolean
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
          preferred_payment_methods?: string[] | null
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
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_level?: string | null
          verified?: boolean | null
          wallet_addresses?: Json | null
          website?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          ad_id: string | null
          created_at: string
          from_user_id: string
          id: string
          rating: number
          review_text: string | null
          to_user_id: string
          updated_at: string
        }
        Insert: {
          ad_id?: string | null
          created_at?: string
          from_user_id: string
          id?: string
          rating: number
          review_text?: string | null
          to_user_id: string
          updated_at?: string
        }
        Update: {
          ad_id?: string | null
          created_at?: string
          from_user_id?: string
          id?: string
          rating?: number
          review_text?: string | null
          to_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
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
      subscriptions: {
        Row: {
          auto_renewal_crypto: boolean
          created_at: string
          crypto_payment_id: string | null
          expires_at: string
          features: Json | null
          id: string
          payment_method: string
          plan_type: string
          starts_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renewal_crypto?: boolean
          created_at?: string
          crypto_payment_id?: string | null
          expires_at: string
          features?: Json | null
          id?: string
          payment_method?: string
          plan_type: string
          starts_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renewal_crypto?: boolean
          created_at?: string
          crypto_payment_id?: string | null
          expires_at?: string
          features?: Json | null
          id?: string
          payment_method?: string
          plan_type?: string
          starts_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_crypto_payment_id_fkey"
            columns: ["crypto_payment_id"]
            isOneToOne: false
            referencedRelation: "crypto_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_reports: {
        Row: {
          created_at: string | null
          file_url: string | null
          generated_at: string | null
          id: string
          report_data: Json | null
          report_type: string
          report_year: number
          status: string | null
          tax_liability_eur: number | null
          total_loss_eur: number | null
          total_profit_eur: number | null
          total_trades: number | null
          total_volume_eur: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_url?: string | null
          generated_at?: string | null
          id?: string
          report_data?: Json | null
          report_type: string
          report_year: number
          status?: string | null
          tax_liability_eur?: number | null
          total_loss_eur?: number | null
          total_profit_eur?: number | null
          total_trades?: number | null
          total_volume_eur?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_url?: string | null
          generated_at?: string | null
          id?: string
          report_data?: Json | null
          report_type?: string
          report_year?: number
          status?: string | null
          tax_liability_eur?: number | null
          total_loss_eur?: number | null
          total_profit_eur?: number | null
          total_trades?: number | null
          total_volume_eur?: number | null
          updated_at?: string | null
          user_id?: string | null
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
      trading_stats: {
        Row: {
          avg_response_time_minutes: number | null
          date: string
          id: string
          successful_trades: number | null
          total_trades: number | null
          total_volume_eur: number | null
          user_id: string
        }
        Insert: {
          avg_response_time_minutes?: number | null
          date?: string
          id?: string
          successful_trades?: number | null
          total_trades?: number | null
          total_volume_eur?: number | null
          user_id: string
        }
        Update: {
          avg_response_time_minutes?: number | null
          date?: string
          id?: string
          successful_trades?: number | null
          total_trades?: number | null
          total_volume_eur?: number | null
          user_id?: string
        }
        Relationships: []
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
      user_blacklist: {
        Row: {
          blacklisted_user_id: string
          created_at: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          blacklisted_user_id: string
          created_at?: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          blacklisted_user_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          created_at: string
          cryptocurrency: string
          id: string
          is_primary: boolean
          is_verified: boolean
          last_used_at: string | null
          updated_at: string
          user_id: string
          wallet_address: string
          wallet_type: string
        }
        Insert: {
          created_at?: string
          cryptocurrency: string
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          last_used_at?: string | null
          updated_at?: string
          user_id: string
          wallet_address: string
          wallet_type: string
        }
        Update: {
          created_at?: string
          cryptocurrency?: string
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          last_used_at?: string | null
          updated_at?: string
          user_id?: string
          wallet_address?: string
          wallet_type?: string
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
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      calculate_trust_score: {
        Args: { user_uuid: string }
        Returns: number
      }
      calculate_user_rating: {
        Args: { user_uuid: string }
        Returns: number
      }
      check_profile_completion: {
        Args: { user_id: string }
        Returns: boolean
      }
      generate_tax_report: {
        Args: { p_user_id: string; p_year?: number }
        Returns: string
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
      get_all_users_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          created_at: string
          last_sign_in_at: string
          email_confirmed_at: string
          role: string
          verified: boolean
          banned: boolean
          last_active: string
          total_trades: number
          total_trade_volume_eur: number
          profile_data: Json
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
      get_real_admin_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_users: number
          verified_users: number
          admin_users: number
          banned_users: number
          moderator_users: number
          active_ads: number
          total_ads: number
          boosted_ads: number
          pending_reports: number
          total_reports: number
          total_trades: number
          platform_volume: number
          pending_verifications: number
          total_conversations: number
          total_messages: number
        }[]
      }
      get_user_rating_count: {
        Args: { user_uuid: string }
        Returns: number
      }
      get_user_verification_level: {
        Args: { user_uuid: string }
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
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      increment_ad_views: {
        Args: Record<PropertyKey, never> | { ad_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      promote_to_admin: {
        Args: { target_email: string }
        Returns: boolean
      }
      promote_user_to_admin_by_email: {
        Args: { target_email: string }
        Returns: boolean
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      update_boost_package_crypto_prices: {
        Args: { sol_price: number; btc_price: number; eth_price: number }
        Returns: undefined
      }
      update_user_ban_status: {
        Args: {
          target_user_id: string
          is_banned: boolean
          ban_reason?: string
        }
        Returns: boolean
      }
      update_verification_status: {
        Args: {
          p_request_id: string
          p_status: string
          p_admin_notes?: string
          p_admin_id?: string
        }
        Returns: boolean
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
      verify_user_by_id: {
        Args: { target_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      ad_status: "active" | "inactive" | "banned" | "sold"
      boost_type: "highlighted" | "featured" | "premium"
      currency_type: "EUR" | "USD" | "BTC" | "SOL" | "USDT"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
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
      ad_status: ["active", "inactive", "banned", "sold"],
      boost_type: ["highlighted", "featured", "premium"],
      currency_type: ["EUR", "USD", "BTC", "SOL", "USDT"],
    },
  },
} as const
