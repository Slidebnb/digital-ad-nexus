-- Admin-User erstellen und Rollen-System einrichten
-- Zuerst den Admin-User in der users-Tabelle einfügen (wenn noch nicht vorhanden)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  instance_id
) VALUES (
  gen_random_uuid(),
  'wladislawhuwa@web.de',
  crypt('Egajaben123', gen_salt('bf')), 
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (email) DO NOTHING;

-- Admin-Profil erstellen mit Admin-Rolle
INSERT INTO public.profiles (
  user_id,
  role,
  full_name,
  created_at,
  updated_at,
  verified,
  verification_level
) 
SELECT 
  u.id,
  'admin',
  'Admin User',
  now(),
  now(),
  true,
  'full'
FROM auth.users u 
WHERE u.email = 'wladislawhuwa@web.de'
ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin',
  verified = true,
  verification_level = 'full';

-- Auch in der users-Tabelle die Rolle setzen
UPDATE public.users 
SET role = 'admin', verified = true
WHERE email = 'wladislawhuwa@web.de';

-- Funktion zur Überprüfung der Admin-Rolle erweitern
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

-- RLS-Policy für Admin-Zugriff auf alle Tabellen
CREATE POLICY "Admins have full access" ON public.profiles
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage users" ON public.users
FOR ALL TO authenticated  
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage ads" ON public.ads
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());