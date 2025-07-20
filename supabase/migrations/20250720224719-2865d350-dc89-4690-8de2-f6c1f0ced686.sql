-- Storage policies für profile-avatars bucket
CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view profile avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-avatars');

-- Stelle sicher, dass der bucket public ist
UPDATE storage.buckets 
SET public = true 
WHERE id = 'profile-avatars';