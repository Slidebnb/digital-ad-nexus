-- Bucket auf public setzen
UPDATE storage.buckets 
SET public = true 
WHERE id = 'verification-documents';

-- Doppelte Policies entfernen
DROP POLICY IF EXISTS "Users can upload verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own verification docs" ON storage.objects;

-- Vereinfachte Policies für public bucket
DROP POLICY IF EXISTS "Users can view their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all verification documents" ON storage.objects;

CREATE POLICY "Public verification documents access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'verification-documents');

CREATE POLICY "Users can upload verification documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);