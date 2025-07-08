-- Admin-Funktion zum Abrufen aller Nutzer aus auth.users mit Profildaten
CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  email_confirmed_at TIMESTAMPTZ,
  role TEXT,
  verified BOOLEAN,
  banned BOOLEAN,
  last_active TIMESTAMPTZ,
  total_trades INTEGER,
  total_trade_volume_eur DECIMAL,
  profile_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prüfe ob der aufrufende Benutzer Admin ist
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Keine Berechtigung für diese Aktion';
  END IF;

  RETURN QUERY
  SELECT 
    au.id,
    au.email::TEXT,
    au.created_at,
    au.last_sign_in_at,
    au.email_confirmed_at,
    COALESCE(p.role, 'user')::TEXT as role,
    COALESCE(p.verified, false) as verified,
    COALESCE(u.banned, false) as banned,
    COALESCE(au.last_sign_in_at, au.created_at) as last_active,
    COALESCE(p.total_trades, 0) as total_trades,
    COALESCE(p.total_trade_volume_eur, 0) as total_trade_volume_eur,
    jsonb_build_object(
      'full_name', p.full_name,
      'avatar_url', p.avatar_url,
      'city', p.city,
      'verification_level', p.verification_level,
      'trust_score', p.trust_score,
      'rating', p.rating,
      'phone', p.phone,
      'bio', p.bio
    ) as profile_data
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.user_id = au.id
  LEFT JOIN public.users u ON u.id = au.id
  ORDER BY au.created_at DESC;
END;
$$;

-- Funktion zum Befördern eines Nutzers zum Admin (verbessert)
CREATE OR REPLACE FUNCTION public.promote_user_to_admin_by_email(target_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Funktion zum Bannen/Entbannen von Nutzern
CREATE OR REPLACE FUNCTION public.update_user_ban_status(
  target_user_id UUID,
  is_banned BOOLEAN,
  ban_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Prüfe Admin-Berechtigung
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Keine Berechtigung für diese Aktion';
  END IF;

  -- Erstelle oder aktualisiere users Eintrag
  INSERT INTO public.users (
    id,
    email,
    banned,
    created_at,
    updated_at
  ) 
  SELECT 
    target_user_id,
    email,
    is_banned,
    now(),
    now()
  FROM auth.users 
  WHERE id = target_user_id
  ON CONFLICT (id) DO UPDATE SET
    banned = is_banned,
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
    CASE WHEN is_banned THEN 'user_banned' ELSE 'user_unbanned' END,
    'user',
    target_user_id,
    jsonb_build_object('reason', ban_reason)
  );
  
  RETURN true;
END;
$$;

-- Funktion zum Verifizieren von Nutzern
CREATE OR REPLACE FUNCTION public.verify_user_by_id(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Prüfe Admin-Berechtigung
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Keine Berechtigung für diese Aktion';
  END IF;

  -- Aktualisiere Profil
  INSERT INTO public.profiles (
    user_id,
    verified,
    verification_level,
    created_at,
    updated_at
  )
  SELECT 
    target_user_id,
    true,
    'id',
    now(),
    now()
  FROM auth.users 
  WHERE id = target_user_id
  ON CONFLICT (user_id) DO UPDATE SET
    verified = true,
    verification_level = COALESCE(profiles.verification_level, 'id'),
    updated_at = now();
  
  -- Aktualisiere users Tabelle
  INSERT INTO public.users (
    id,
    email,
    verified,
    created_at,
    updated_at
  )
  SELECT 
    target_user_id,
    email,
    true,
    now(),
    now()
  FROM auth.users 
  WHERE id = target_user_id
  ON CONFLICT (id) DO UPDATE SET
    verified = true,
    updated_at = now();
  
  -- Log admin action
  INSERT INTO public.admin_logs (
    admin_id,
    action,
    target_type,
    target_id
  ) VALUES (
    auth.uid(),
    'user_verified',
    'user',
    target_user_id
  );
  
  RETURN true;
END;
$$;