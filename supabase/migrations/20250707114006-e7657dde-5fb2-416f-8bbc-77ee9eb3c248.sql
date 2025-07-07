-- Storage bucket für Verifizierungsdokumente erstellen
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents', 
  'verification-documents', 
  false, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Storage policies für Verifizierungsdokumente
CREATE POLICY "Users can upload their own verification documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own verification documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'verification-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all verification documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'verification-documents' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
);

-- Funktion um Profildaten automatisch zu synchronisieren bei Verifizierung
CREATE OR REPLACE FUNCTION sync_profile_from_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Bei approved Status: Profildaten aus verification_request übernehmen
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE profiles 
    SET 
      full_name = COALESCE(NEW.full_name, full_name),
      verified = true,
      verification_level = 'id',
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Users Tabelle auch aktualisieren
    UPDATE users 
    SET 
      verified = true,
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für automatische Synchronisation
CREATE TRIGGER sync_profile_on_verification_approval
  AFTER UPDATE ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_from_verification();