CREATE OR REPLACE FUNCTION public.update_verification_status(p_request_id uuid, p_status text, p_admin_notes text DEFAULT NULL::text, p_admin_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Prüfe ob der aufrufende Benutzer Admin ist (in profiles table)
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
    
    -- Auch in profiles aktualisieren
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
$$;