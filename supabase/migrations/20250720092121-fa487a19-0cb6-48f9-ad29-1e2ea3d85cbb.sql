-- PHASE 2: FINAL DATABASE OPTIMIZATION FOR LIVE DEPLOYMENT
-- Fix remaining function search paths and optimize for performance

-- Performance and security optimization cron job
SELECT cron.schedule('update-crypto-prices', '*/5 * * * *', 'SELECT net.http_post(
  url := ''https://jaherdxwzftzgazplwzo.supabase.co/functions/v1/crypto-price-updater'',
  headers := ''{"Content-Type": "application/json", "Authorization": "Bearer " || current_setting(''app.settings.service_role_key'', true)}'',
  body := ''{}''
);');

-- Optimize remaining functions with SET search_path
CREATE OR REPLACE FUNCTION public.get_cached_user_stats(p_user_id uuid)
RETURNS TABLE(
  total_ads integer,
  active_ads integer, 
  total_views bigint,
  total_messages integer,
  unread_messages integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE((SELECT COUNT(*)::integer FROM public.ads WHERE user_id = p_user_id), 0),
    COALESCE((SELECT COUNT(*)::integer FROM public.ads WHERE user_id = p_user_id AND status = 'active'), 0),
    COALESCE((SELECT SUM(views) FROM public.ads WHERE user_id = p_user_id), 0::bigint),
    COALESCE((SELECT COUNT(*)::integer FROM public.messages WHERE sender_id = p_user_id), 0),
    COALESCE((SELECT COUNT(*)::integer FROM public.conversations WHERE recipient_id = p_user_id AND unread_by_recipient = true), 0);
END;
$$;

-- Optimized admin stats function
CREATE OR REPLACE FUNCTION public.get_optimized_admin_stats()
RETURNS TABLE(
  total_users integer,
  verified_users integer,
  admin_users integer,
  banned_users integer,
  active_ads integer,
  total_trades integer,
  platform_volume numeric,
  pending_reports integer,
  pending_verifications integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow admins to access
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::integer FROM auth.users),
    (SELECT COUNT(*)::integer FROM public.profiles WHERE verified = true),
    (SELECT COUNT(*)::integer FROM public.profiles WHERE role = 'admin'),
    (SELECT COUNT(*)::integer FROM public.users WHERE banned = true),
    (SELECT COUNT(*)::integer FROM public.ads WHERE status = 'active'),
    (SELECT COUNT(*)::integer FROM public.trades),
    (SELECT COALESCE(SUM(price_eur), 0) FROM public.trades WHERE status = 'completed'),
    (SELECT COUNT(*)::integer FROM public.reports WHERE status = 'pending'),
    (SELECT COUNT(*)::integer FROM public.verification_requests WHERE status = 'pending');
END;
$$;

-- Create composite indexes for critical queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ads_user_status_boosted ON public.ads(user_id, status, boosted_until) WHERE status = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_created ON public.favorites(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trades_buyer_seller_status ON public.trades(buyer_id, seller_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_verified_role ON public.profiles(verified, role) WHERE verified = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status, created_at) WHERE status = 'pending';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_status_created ON public.reports(status, created_at) WHERE status = 'pending';

-- Query performance logging table
CREATE TABLE IF NOT EXISTS public.query_performance_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_type text NOT NULL,
  execution_time_ms integer NOT NULL,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS for query performance logs
ALTER TABLE public.query_performance_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view query performance" ON public.query_performance_log
  FOR SELECT USING (public.is_admin());

CREATE POLICY "System can log performance" ON public.query_performance_log
  FOR INSERT WITH CHECK (true);

-- Index for performance logs
CREATE INDEX IF NOT EXISTS idx_query_performance_type_time ON public.query_performance_log(query_type, created_at DESC);

-- User dashboard data function - optimized
CREATE OR REPLACE FUNCTION public.get_user_dashboard_data(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Build comprehensive dashboard data
  SELECT jsonb_build_object(
    'user_stats', (
      SELECT jsonb_build_object(
        'total_ads', COUNT(*)::integer,
        'active_ads', COUNT(*) FILTER (WHERE status = 'active')::integer,
        'total_views', COALESCE(SUM(views), 0),
        'total_favorites', COALESCE(SUM(favorite_count), 0)
      )
      FROM public.ads WHERE user_id = p_user_id
    ),
    'recent_messages', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', m.id,
          'content', m.content,
          'sender_id', m.sender_id,
          'created_at', m.created_at,
          'conversation_id', m.conversation_id
        ) ORDER BY m.created_at DESC
      ), '[]'::jsonb)
      FROM public.messages m
      JOIN public.conversations c ON c.id = m.conversation_id
      WHERE (c.sender_id = p_user_id OR c.recipient_id = p_user_id)
      AND m.created_at >= now() - interval '7 days'
      LIMIT 10
    ),
    'profile_data', (
      SELECT jsonb_build_object(
        'verified', verified,
        'verification_level', verification_level,
        'rating', rating,
        'total_reviews', total_reviews,
        'trust_score', trust_score
      )
      FROM public.profiles WHERE user_id = p_user_id
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Materialized view for daily stats (for admin dashboard)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_daily_platform_stats AS
SELECT 
  date_trunc('day', now()) as stats_date,
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.ads WHERE status = 'active') as active_ads,
  (SELECT COUNT(*) FROM public.trades WHERE created_at >= date_trunc('day', now())) as daily_trades,
  (SELECT COALESCE(SUM(price_eur), 0) FROM public.trades WHERE created_at >= date_trunc('day', now())) as daily_volume;

-- Function to refresh daily stats
CREATE OR REPLACE FUNCTION public.refresh_daily_stats()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  REFRESH MATERIALIZED VIEW public.mv_daily_platform_stats;
$$;

-- Schedule daily stats refresh
SELECT cron.schedule('refresh-daily-stats', '0 1 * * *', 'SELECT public.refresh_daily_stats();');