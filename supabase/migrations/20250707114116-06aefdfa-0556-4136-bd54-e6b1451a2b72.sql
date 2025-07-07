-- Storage policies für Verifizierungsdokumente (falls noch nicht existieren)
DO $$
BEGIN
  -- Policy für User-Upload
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Users can upload their own verification documents'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can upload their own verification documents"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = ''verification-documents'' AND 
      auth.uid()::text = (storage.foldername(name))[1]
    )';
  END IF;

  -- Policy für User-View
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Users can view their own verification documents'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own verification documents"
    ON storage.objects
    FOR SELECT
    USING (
      bucket_id = ''verification-documents'' AND 
      auth.uid()::text = (storage.foldername(name))[1]
    )';
  END IF;

  -- Policy für Admin-View
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Admins can view all verification documents'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view all verification documents"
    ON storage.objects
    FOR SELECT
    USING (
      bucket_id = ''verification-documents'' AND 
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND role IN (''admin'', ''moderator'')
      )
    )';
  END IF;
END $$;

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

-- Trigger für automatische Synchronisation (falls noch nicht existiert)
DROP TRIGGER IF EXISTS sync_profile_on_verification_approval ON verification_requests;
CREATE TRIGGER sync_profile_on_verification_approval
  AFTER UPDATE ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_from_verification();