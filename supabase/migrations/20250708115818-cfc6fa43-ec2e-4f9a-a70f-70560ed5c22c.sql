-- Korrektur der get_all_users_for_admin Funktion - behebe ambiguous column reference
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
    AND profiles.role IN ('admin', 'moderator')
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
    COALESCE(p.role, u.role, 'user')::TEXT as role,
    COALESCE(p.verified, u.verified, false) as verified,
    COALESCE(u.banned, false) as banned,
    COALESCE(au.last_sign_in_at, au.created_at) as last_active,
    COALESCE(p.total_trades, u.total_trades, 0) as total_trades,
    COALESCE(p.total_trade_volume_eur, u.total_trade_volume_eur, 0) as total_trade_volume_eur,
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