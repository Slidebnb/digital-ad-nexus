-- KORREKTUR: Erst alle Storage-Policies für profile-avatars prüfen und erneuern
-- Komplettes Löschen aller Storage-Policies für den profile-avatars bucket
DELETE FROM pg_policy WHERE polname LIKE '%avatar%' OR polname LIKE '%profile-avatar%';

-- Saubere neue Policies für profile-avatars Storage
CREATE POLICY "profile_avatars_select_policy" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-avatars');

CREATE POLICY "profile_avatars_insert_policy" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-avatars' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "profile_avatars_update_policy" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile-avatars' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "profile_avatars_delete_policy" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile-avatars' 
  AND auth.uid() IS NOT NULL
);