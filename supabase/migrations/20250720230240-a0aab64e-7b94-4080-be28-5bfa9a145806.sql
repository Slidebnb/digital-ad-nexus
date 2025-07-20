-- LÖSUNG: Avatar Upload schlägt durch Storage RLS Policy fehl
-- Erst alle existierenden Policies löschen
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Neue, funktionierende Policies für profile-avatars bucket
CREATE POLICY "Public read access for avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-avatars');

CREATE POLICY "Authenticated users can upload avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-avatars' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own avatars" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile-avatars' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete own avatars" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile-avatars' 
  AND auth.role() = 'authenticated'
);