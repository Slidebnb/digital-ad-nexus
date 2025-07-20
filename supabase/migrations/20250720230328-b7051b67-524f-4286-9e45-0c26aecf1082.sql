-- PROBLEM: Avatar Upload schlägt mit RLS-Fehler fehl
-- Lösung: Sehr permissive Storage-Policies für profile-avatars bucket

-- Neue, einfache Policies (existierende werden überschrieben falls doppelt)
CREATE POLICY "Anyone can read profile avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-avatars');

CREATE POLICY "Auth users upload avatars freely" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Auth users update avatars freely" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Auth users delete avatars freely" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-avatars' AND auth.role() = 'authenticated');