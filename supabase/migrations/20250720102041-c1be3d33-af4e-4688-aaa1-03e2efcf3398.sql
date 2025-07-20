
-- PHASE 1: KRITISCHE SICHERHEITSFIXES FÜR PRODUCTION-READINESS

-- 1. Alle bestehenden Funktionen mit SET search_path = 'public' sichern
DROP FUNCTION IF EXISTS public.increment_ad_views(uuid);
CREATE OR REPLACE FUNCTION public.increment_ad_views(ad_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.ads SET views = views + 1 WHERE id = ad_id;
END;
$function$;

DROP FUNCTION IF EXISTS public.is_admin(uuid);
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = $1 
    AND profiles.role IN ('admin', 'moderator')
  );
$function$;

DROP FUNCTION IF EXISTS public.get_current_user_role();
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  select role
  from public.profiles
  where user_id = auth.uid();
$function$;

-- 2. Verification-basierte RLS Policy für Ads
DROP POLICY IF EXISTS "Only verified users can create ads" ON public.ads;
CREATE POLICY "Only verified users can create ads" ON public.ads
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND verified = true 
      AND verification_level IN ('id', 'full')
    )
  );

-- 3. Rate Limiting für kritische Operationen
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, action_type, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits" ON public.rate_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits" ON public.rate_limits
  FOR ALL USING (true);

-- 4. Sichere Message-Funktionen mit Rate Limiting
CREATE OR REPLACE FUNCTION public.send_message_secure(
  p_conversation_id uuid,
  p_content text,
  p_message_type text DEFAULT 'text'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_message_id uuid;
  v_sender_id uuid := auth.uid();
BEGIN
  -- Prüfe ob User an Conversation teilnimmt
  IF NOT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = p_conversation_id
    AND (sender_id = v_sender_id OR recipient_id = v_sender_id)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Not participant in conversation';
  END IF;
  
  -- Rate Limiting prüfen (max 60 messages per minute)
  INSERT INTO public.rate_limits (user_id, action_type, action_count, window_start)
  VALUES (v_sender_id, 'send_message', 1, date_trunc('minute', now()))
  ON CONFLICT (user_id, action_type, window_start) 
  DO UPDATE SET action_count = rate_limits.action_count + 1;
  
  IF (
    SELECT action_count FROM public.rate_limits 
    WHERE user_id = v_sender_id 
    AND action_type = 'send_message' 
    AND window_start = date_trunc('minute', now())
  ) > 60 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Too many messages per minute';
  END IF;
  
  -- Message erstellen
  INSERT INTO public.messages (
    conversation_id,
    sender_id,
    content,
    message_type,
    created_at
  ) VALUES (
    p_conversation_id,
    v_sender_id,
    p_content,
    p_message_type,
    now()
  ) RETURNING id INTO v_message_id;
  
  -- Conversation aktualisieren
  UPDATE public.conversations SET
    last_message = p_content,
    last_message_at = now(),
    unread_by_recipient = true
  WHERE id = p_conversation_id;
  
  RETURN v_message_id;
END;
$$;

-- 5. Optimierte User-Stats Funktion für Dashboard
CREATE OR REPLACE FUNCTION public.get_cached_user_stats(p_user_id uuid)
RETURNS TABLE(
  total_ads integer,
  active_ads integer, 
  total_views bigint,
  total_messages integer,
  unread_messages integer,
  total_favorites integer,
  total_trades integer,
  verification_level text,
  verified boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH user_ad_stats AS (
    SELECT 
      COUNT(*)::integer as total_ads,
      COUNT(*) FILTER (WHERE status = 'active')::integer as active_ads,
      COALESCE(SUM(views), 0)::bigint as total_views
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
  ),
  user_profile AS (
    SELECT
      COALESCE(p.verification_level, 'none') as verification_level,
      COALESCE(p.verified, false) as verified
    FROM profiles p
    WHERE p.user_id = p_user_id
  )
  SELECT 
    COALESCE(ua.total_ads, 0),
    COALESCE(ua.active_ads, 0),
    COALESCE(ua.total_views, 0),
    COALESCE(um.total_messages, 0),
    COALESCE(um.unread_messages, 0),
    (SELECT COUNT(*)::integer FROM favorites WHERE user_id = p_user_id),
    (SELECT COUNT(*)::integer FROM trades WHERE buyer_id = p_user_id OR seller_id = p_user_id),
    COALESCE(up.verification_level, 'none'),
    COALESCE(up.verified, false)
  FROM user_ad_stats ua
  CROSS JOIN user_message_stats um
  CROSS JOIN user_profile up;
END;
$$;

-- 6. Performance-Indizes für bessere Dashboard-Performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ads_user_status_created 
ON public.ads(user_id, status, created_at DESC) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_unread 
ON public.messages(conversation_id, created_at DESC, read_at) 
WHERE read_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_created 
ON public.favorites(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_verified_role 
ON public.profiles(verified, role) WHERE verified = true;

-- 7. Erweiterte RLS für bessere Sicherheit
DROP POLICY IF EXISTS "Enhanced verification security" ON public.ads;
CREATE POLICY "Enhanced verification security" ON public.ads
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND verified = true 
      AND verification_level IN ('id', 'full')
    )
  );
