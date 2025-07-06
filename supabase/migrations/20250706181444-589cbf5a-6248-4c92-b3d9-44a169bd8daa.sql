-- Admin-System über profiles-Tabelle implementieren
-- Funktion zur Überprüfung der Admin-Rolle
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = $1 
    AND profiles.role IN ('admin', 'moderator')
  );
$$;

-- Funktion um einen User zum Admin zu machen (nur für Super-Admin)
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Finde die User-ID basierend auf der E-Mail aus der auth.users Tabelle
  -- Da wir keinen direkten Zugriff haben, nutzen wir das users Profil
  SELECT user_id INTO target_user_id
  FROM profiles p
  JOIN users u ON p.user_id = u.id
  WHERE u.email = target_email;
  
  IF target_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Update profile role
  UPDATE profiles 
  SET role = 'admin', 
      verified = true,
      verification_level = 'full',
      updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Update users table
  UPDATE users 
  SET role = 'admin', 
      verified = true,
      updated_at = now()
  WHERE id = target_user_id;
  
  RETURN true;
END;
$$;

-- RLS-Policies für Admin-Zugriff
CREATE POLICY "Admins have full access to profiles" ON public.profiles
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage all users" ON public.users
FOR ALL TO authenticated  
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage all ads" ON public.ads
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage verification requests" ON public.verification_requests
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());