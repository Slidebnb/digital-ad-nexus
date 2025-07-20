
-- PHASE 1: KRITISCHE SICHERHEITSFIXES
-- Alle Database-Funktionen sichern mit SET search_path = 'public'

-- 1. Sichere alle bestehenden Funktionen
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
  from public.users
  where id = auth.uid();
$function$;

DROP FUNCTION IF EXISTS public.promote_user_to_admin_by_email(text);
CREATE OR REPLACE FUNCTION public.promote_user_to_admin_by_email(target_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  target_user_id UUID;
BEGIN
  -- Prüfe Admin-Berechtigung
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Keine Berechtigung für diese Aktion';
  END IF;

  -- Finde User ID in auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Erstelle oder aktualisiere Profil
  INSERT INTO public.profiles (
    user_id, 
    role, 
    verified, 
    verification_level,
    created_at,
    updated_at
  ) VALUES (
    target_user_id,
    'admin',
    true,
    'full',
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin',
    verified = true,
    verification_level = 'full',
    updated_at = now();
  
  -- Erstelle oder aktualisiere users Eintrag
  INSERT INTO public.users (
    id,
    email,
    role,
    verified,
    created_at,
    updated_at
  ) VALUES (
    target_user_id,
    target_email,
    'admin',
    true,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    verified = true,
    updated_at = now();
  
  -- Log admin action
  INSERT INTO public.admin_logs (
    admin_id,
    action,
    target_type,
    target_id,
    details
  ) VALUES (
    auth.uid(),
    'user_promoted_to_admin',
    'user',
    target_user_id,
    jsonb_build_object('target_email', target_email)
  );
  
  RETURN true;
END;
$function$;

-- 2. OTP-Expiry auf sichere Werte setzen
UPDATE auth.config SET value = '300' WHERE parameter = 'OTP_EXPIRY';
UPDATE auth.config SET value = '86400' WHERE parameter = 'PASSWORD_RESET_EXPIRY';

-- 3. Leaked Password Protection aktivieren
UPDATE auth.config SET value = 'true' WHERE parameter = 'SECURITY_LEAKED_PASSWORD_PROTECTION';

-- 4. Rate Limiting für kritische Operationen
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, action_type, window_start)
);

-- RLS für rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits" ON public.rate_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits" ON public.rate_limits
  FOR ALL USING (true);

-- 5. Verbesserte Admin-Logs mit IP-Tracking
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action text,
  p_target_type text,
  p_target_id uuid,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.admin_logs (
    admin_id,
    action,
    target_type,
    target_id,
    details,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    auth.uid(),
    p_action,
    p_target_type,
    p_target_id,
    p_details,
    inet(current_setting('request.headers', true)::json->>'x-forwarded-for'),
    current_setting('request.headers', true)::json->>'user-agent',
    now()
  );
END;
$$;

-- 6. Sichere Crypto-Price Updates
CREATE OR REPLACE FUNCTION public.update_crypto_prices_secure(
  p_prices jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  price_record jsonb;
BEGIN
  -- Nur Admin kann Preise updaten
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Update prices from JSON array
  FOR price_record IN SELECT * FROM jsonb_array_elements(p_prices)
  LOOP
    INSERT INTO public.crypto_prices (
      cryptocurrency,
      price_eur,
      price_usd,
      change_24h,
      volume_24h,
      market_cap,
      source,
      last_updated
    ) VALUES (
      price_record->>'cryptocurrency',
      (price_record->>'price_eur')::numeric,
      (price_record->>'price_usd')::numeric,
      (price_record->>'change_24h')::numeric,
      (price_record->>'volume_24h')::numeric,
      (price_record->>'market_cap')::numeric,
      COALESCE(price_record->>'source', 'coingecko'),
      now()
    )
    ON CONFLICT (cryptocurrency) DO UPDATE SET
      price_eur = EXCLUDED.price_eur,
      price_usd = EXCLUDED.price_usd,
      change_24h = EXCLUDED.change_24h,
      volume_24h = EXCLUDED.volume_24h,
      market_cap = EXCLUDED.market_cap,
      last_updated = now();
  END LOOP;
END;
$$;

-- 7. Sicherheits-Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_action ON public.admin_logs(admin_id, action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role) WHERE role IN ('admin', 'moderator');
CREATE INDEX IF NOT EXISTS idx_users_verified ON public.users(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at);

-- 8. Erweiterte RLS für bessere Sicherheit
DROP POLICY IF EXISTS "Enhanced admin security" ON public.profiles;
CREATE POLICY "Enhanced admin security" ON public.profiles
  FOR ALL 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    public.is_admin()
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    public.is_admin()
  );

-- 9. Sichere Message-Funktionen
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

-- 10. System Health Monitoring
CREATE TABLE IF NOT EXISTS public.system_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
  details jsonb DEFAULT '{}'::jsonb,
  response_time_ms integer,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS für system_health
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view system health" ON public.system_health
  FOR SELECT USING (public.is_admin());

CREATE POLICY "System can insert health checks" ON public.system_health
  FOR INSERT WITH CHECK (true);
