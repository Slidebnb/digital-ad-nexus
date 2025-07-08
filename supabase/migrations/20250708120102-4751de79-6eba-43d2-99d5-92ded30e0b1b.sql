-- Erstelle echte Admin-Statistiken Funktion die von auth.users liest
CREATE OR REPLACE FUNCTION public.get_real_admin_stats()
RETURNS TABLE (
  total_users INTEGER,
  verified_users INTEGER,
  admin_users INTEGER,
  banned_users INTEGER,
  moderator_users INTEGER,
  active_ads INTEGER,
  total_ads INTEGER,
  boosted_ads INTEGER,
  pending_reports INTEGER,
  total_reports INTEGER,
  total_trades INTEGER,
  platform_volume DECIMAL,
  pending_verifications INTEGER,
  total_conversations INTEGER,
  total_messages INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prüfe Admin-Berechtigung
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND profiles.role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Keine Berechtigung für diese Aktion';
  END IF;

  RETURN QUERY
  SELECT 
    -- Benutzer-Statistiken aus auth.users
    (SELECT COUNT(*)::INTEGER FROM auth.users) as total_users,
    (SELECT COUNT(*)::INTEGER 
     FROM auth.users au 
     LEFT JOIN public.profiles p ON p.user_id = au.id 
     LEFT JOIN public.users u ON u.id = au.id
     WHERE COALESCE(p.verified, u.verified, false) = true) as verified_users,
    (SELECT COUNT(*)::INTEGER 
     FROM auth.users au 
     LEFT JOIN public.profiles p ON p.user_id = au.id 
     LEFT JOIN public.users u ON u.id = au.id
     WHERE COALESCE(p.role, u.role, 'user') = 'admin') as admin_users,
    (SELECT COUNT(*)::INTEGER 
     FROM auth.users au 
     LEFT JOIN public.users u ON u.id = au.id
     WHERE COALESCE(u.banned, false) = true) as banned_users,
    (SELECT COUNT(*)::INTEGER 
     FROM auth.users au 
     LEFT JOIN public.profiles p ON p.user_id = au.id 
     LEFT JOIN public.users u ON u.id = au.id
     WHERE COALESCE(p.role, u.role, 'user') = 'moderator') as moderator_users,
    
    -- Anzeigen-Statistiken
    (SELECT COUNT(*)::INTEGER FROM public.ads WHERE status = 'active') as active_ads,
    (SELECT COUNT(*)::INTEGER FROM public.ads) as total_ads,
    (SELECT COUNT(*)::INTEGER FROM public.ads WHERE boosted_until > now()) as boosted_ads,
    
    -- Report-Statistiken
    (SELECT COUNT(*)::INTEGER FROM public.reports WHERE status = 'pending') as pending_reports,
    (SELECT COUNT(*)::INTEGER FROM public.reports) as total_reports,
    
    -- Trade-Statistiken
    (SELECT COUNT(*)::INTEGER FROM public.trades) as total_trades,
    (SELECT COALESCE(SUM(price_eur), 0) FROM public.trades WHERE status = 'completed') as platform_volume,
    
    -- Verifizierung-Statistiken
    (SELECT COUNT(*)::INTEGER FROM public.verification_requests WHERE status = 'pending') as pending_verifications,
    
    -- Chat-Statistiken
    (SELECT COUNT(*)::INTEGER FROM public.conversations) as total_conversations,
    (SELECT COUNT(*)::INTEGER FROM public.messages) as total_messages;
END;
$$;