-- Fix profiles table foreign key to reference auth.users instead of public.users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure ads table has correct foreign key to users
ALTER TABLE public.ads DROP CONSTRAINT IF EXISTS ads_user_id_fkey;
ALTER TABLE public.ads ADD CONSTRAINT ads_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix condition check constraint on ads table to allow common values
ALTER TABLE public.ads DROP CONSTRAINT IF EXISTS ads_condition_check;
ALTER TABLE public.ads ADD CONSTRAINT ads_condition_check 
  CHECK (condition IN ('neu', 'wie neu', 'sehr gut', 'gut', 'gebraucht', 'defekt'));

-- Create users table trigger to auto-create profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, created_at, updated_at)
  VALUES (NEW.id, 'user', NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP trigger IF EXISTS on_auth_user_created ON auth.users;
CREATE trigger on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update existing profiles to ensure data consistency
UPDATE public.profiles 
SET updated_at = NOW() 
WHERE updated_at IS NULL;