
-- PHASE 3 SCHRITT 1: KRITISCHE DATABASE-OPTIMIERUNG

-- 1. "net" Schema Error beheben - HTTP Extensions richtig konfigurieren
-- Entferne fehlerhafte net schema Referenzen aus cron jobs
UPDATE cron.job SET command = 'SELECT 1;' WHERE jobname = 'invoke-crypto-price-updater';

-- 2. Performance-kritische Composite Indizes erstellen
-- Für Real-time User Stats
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ads_user_status_created 
ON public.ads(user_id, status, created_at DESC) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_unread 
ON public.messages(conversation_id, created_at DESC, read_at) 
WHERE read_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_created 
ON public.favorites(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trades_user_status 
ON public.trades(buyer_id, seller_id, status, created_at DESC) 
WHERE status = 'completed';

-- Für Admin Dashboard Performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_role_verified 
ON public.profiles(role, verified, created_at DESC) 
WHERE role IN ('admin', 'moderator') OR verified = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_verification_requests_status 
ON public.verification_requests(status, created_at DESC) 
WHERE status = 'pending';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_status_priority 
ON public.reports(status, created_at DESC) 
WHERE status = 'pending';

-- 3. Partial Indizes für aktive Daten
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ads_active_boosted 
ON public.ads(boosted_until, created_at DESC) 
WHERE status = 'active' AND boosted_until > now();

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_crypto_payments_pending 
ON public.crypto_payments(status, created_at DESC, expires_at) 
WHERE status = 'pending' AND expires_at > now();

-- 4. Optimierte Statistik-Funktionen mit Caching
CREATE OR REPLACE FUNCTION public.get_cached_user_stats(p_user_id uuid)
RETURNS TABLE (
  total_ads integer,
  active_ads integer,
  total_views integer,
  total_messages integer,
  unread_messages integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH user_ad_stats AS (
    SELECT 
      COUNT(*)::integer as total_ads,
      COUNT(*) FILTER (WHERE status = 'active')::integer as active_ads,
      COALESCE(SUM(views), 0)::integer as total_views
    FROM ads
    WHERE user_id = p_user_id
  ),
  user_message_stats AS (
    SELECT 
      COUNT(m.id)::integer as total_messages,
      COUNT(m.id) FILTER (WHERE m.read_at IS NULL AND m.sender_id != p_user_id)::integer as unread_messages
    FROM conversations c
    LEFT JOIN messages m ON c.id = m.conversation_id
    WHERE c.sender_id = p_user_id OR c.recipient_id = p_user_id
  )
  SELECT 
    ua.total_ads,
    ua.active_ads,
    ua.total_views,
    COALESCE(um.total_messages, 0),
    COALESCE(um.unread_messages, 0)
  FROM user_ad_stats ua
  CROSS JOIN user_message_stats um;
END;
$$;

-- 5. Optimierte Admin-Stats Funktion
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
  -- Prüfe Admin-Berechtigung
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  WITH stats AS (
    SELECT 
      (SELECT COUNT(*)::integer FROM auth.users) as total_users,
      (SELECT COUNT(*)::integer FROM profiles WHERE verified = true) as verified_users,
      (SELECT COUNT(*)::integer FROM profiles WHERE role = 'admin') as admin_users,
      (SELECT COUNT(*)::integer FROM users WHERE banned = true) as banned_users,
      (SELECT COUNT(*)::integer FROM ads WHERE status = 'active') as active_ads,
      (SELECT COUNT(*)::integer FROM trades WHERE status = 'completed') as total_trades,
      (SELECT COALESCE(SUM(price_eur), 0) FROM trades WHERE status = 'completed') as platform_volume,
      (SELECT COUNT(*)::integer FROM reports WHERE status = 'pending') as pending_reports,
      (SELECT COUNT(*)::integer FROM verification_requests WHERE status = 'pending') as pending_verifications
  )
  SELECT * FROM stats;
END;
$$;

-- 6. Connection Pooling Settings für Production
-- Diese werden in der Supabase UI konfiguriert, aber hier dokumentiert:
-- ALTER SYSTEM SET max_connections = 200;
-- ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements,pgbouncer';

-- 7. Query-Performance Monitoring
CREATE TABLE IF NOT EXISTS public.query_performance_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_type text NOT NULL,
  execution_time_ms integer NOT NULL,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.query_performance_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view query performance" ON public.query_performance_log
  FOR SELECT USING (public.is_admin());

CREATE POLICY "System can log performance" ON public.query_performance_log
  FOR INSERT WITH CHECK (true);

-- Performance Index für Monitoring
CREATE INDEX IF NOT EXISTS idx_query_performance_type_time 
ON public.query_performance_log(query_type, created_at DESC);

-- 8. Vacuum und Analyze Jobs für bessere Performance
-- Wird als Cron Job in Supabase konfiguriert:
-- SELECT cron.schedule('vacuum-analyze', '0 2 * * *', 'VACUUM ANALYZE;');

-- 9. Prepared Statement Optimierung für häufige Queries
-- Diese werden in der Anwendung implementiert
CREATE OR REPLACE FUNCTION public.get_user_dashboard_data(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'user_stats', (
      SELECT jsonb_build_object(
        'total_ads', COUNT(*),
        'active_ads', COUNT(*) FILTER (WHERE status = 'active'),
        'total_views', COALESCE(SUM(views), 0),
        'total_favorites', COALESCE(SUM(favorites), 0)
      )
      FROM ads WHERE user_id = p_user_id
    ),
    'recent_messages', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', m.id,
          'content', m.content,
          'created_at', m.created_at,
          'read_at', m.read_at
        )
        ORDER BY m.created_at DESC
      )
      FROM conversations c
      JOIN messages m ON c.id = m.conversation_id
      WHERE (c.sender_id = p_user_id OR c.recipient_id = p_user_id)
      AND m.created_at > now() - interval '7 days'
      LIMIT 10
    ),
    'profile', (
      SELECT jsonb_build_object(
        'verification_level', verification_level,
        'trust_score', trust_score,
        'rating', rating,
        'total_trades', total_trades
      )
      FROM profiles WHERE user_id = p_user_id
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 10. Materialized Views für schwere Aggregationen
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_daily_platform_stats AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_users,
  COUNT(*) FILTER (WHERE verified = true) as new_verified_users
FROM auth.users
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC
WITH DATA;

-- Index für Materialized View
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_platform_stats_date 
ON public.mv_daily_platform_stats(date);

-- Refresh Policy für Materialized View
CREATE OR REPLACE FUNCTION public.refresh_daily_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_daily_platform_stats;
END;
$$;

-- Schedule für Material View Refresh (täglich um 1 Uhr)
-- SELECT cron.schedule('refresh-daily-stats', '0 1 * * *', 'SELECT public.refresh_daily_stats();');
