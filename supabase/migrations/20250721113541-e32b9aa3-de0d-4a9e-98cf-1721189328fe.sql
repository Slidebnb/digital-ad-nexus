-- Fix search_path security issues for all functions by adding SET search_path = ''
-- This is critical for production security

-- Fix the main admin functions
DROP FUNCTION IF EXISTS public.is_admin(uuid);
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = $1 
    AND profiles.role IN ('admin', 'moderator')
  );
$function$;

-- Fix get_current_user_role function
DROP FUNCTION IF EXISTS public.get_current_user_role();
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  select role
  from public.users
  where id = auth.uid();
$function$;

-- Fix handle_new_user trigger function
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, role, created_at, updated_at)
  VALUES (NEW.id, 'user', NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Fix update_verification_status function
DROP FUNCTION IF EXISTS public.update_verification_status(uuid, text, text, uuid);
CREATE OR REPLACE FUNCTION public.update_verification_status(p_request_id uuid, p_status text, p_admin_notes text DEFAULT NULL::text, p_admin_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  v_user_id UUID;
BEGIN
  -- Prüfe ob der aufrufende Benutzer Admin ist
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = COALESCE(p_admin_id, auth.uid()) 
    AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Keine Berechtigung für diese Aktion';
  END IF;

  -- Update der Verifizierungsanfrage
  UPDATE public.verification_requests 
  SET 
    status = p_status,
    admin_notes = p_admin_notes,
    reviewed_by = COALESCE(p_admin_id, auth.uid()),
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id
  RETURNING user_id INTO v_user_id;

  -- Wenn genehmigt, Benutzer als verifiziert markieren
  IF p_status = 'approved' AND v_user_id IS NOT NULL THEN
    UPDATE public.users 
    SET 
      verified = true,
      updated_at = NOW()
    WHERE id = v_user_id;
    
    UPDATE public.profiles 
    SET 
      verified = true,
      verification_level = 'id',
      updated_at = NOW()
    WHERE user_id = v_user_id;
  END IF;

  -- Admin-Log erstellen
  INSERT INTO public.admin_logs (
    admin_id,
    action,
    target_type,
    target_id,
    details
  ) VALUES (
    COALESCE(p_admin_id, auth.uid()),
    'verification_' || p_status,
    'verification_request',
    p_request_id,
    jsonb_build_object(
      'user_id', v_user_id,
      'status', p_status,
      'admin_notes', p_admin_notes
    )
  );

  RETURN TRUE;
END;
$function$;