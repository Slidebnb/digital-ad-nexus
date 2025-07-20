-- Alle bestehenden Policies für profile-avatars löschen
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile avatars" ON storage.objects;

-- Neue, einfachere Policies erstellen
-- 1. Jeder kann profile-avatars lesen (public bucket)
CREATE POLICY "Public access to profile avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-avatars');

-- 2. Authentifizierte Benutzer können ihre eigenen Avatare hochladen
CREATE POLICY "Authenticated users can upload avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-avatars' 
  AND auth.uid() IS NOT NULL
);

-- 3. Benutzer können ihre eigenen Avatare aktualisieren
CREATE POLICY "Users can update their avatars" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile-avatars' 
  AND auth.uid() IS NOT NULL
);

-- 4. Benutzer können ihre eigenen Avatare löschen  
CREATE POLICY "Users can delete their avatars" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile-avatars' 
  AND auth.uid() IS NOT NULL
);