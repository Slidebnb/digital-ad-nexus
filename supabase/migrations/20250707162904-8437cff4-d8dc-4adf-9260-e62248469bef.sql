-- Update the ads status check constraint to match the enum values
ALTER TABLE public.ads DROP CONSTRAINT IF EXISTS ads_status_check;
ALTER TABLE public.ads ADD CONSTRAINT ads_status_check 
  CHECK (status IN ('active', 'inactive', 'banned', 'sold'));

-- Also check the condition constraint and fix it to match German values
ALTER TABLE public.ads DROP CONSTRAINT IF EXISTS ads_condition_check;
ALTER TABLE public.ads ADD CONSTRAINT ads_condition_check 
  CHECK (condition IN ('neu', 'wie neu', 'sehr gut', 'gut', 'gebraucht', 'defekt'));

-- Ensure admin_logs table is accessible for admins
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admin_logs
DROP POLICY IF EXISTS "Admins can manage logs" ON public.admin_logs;
CREATE POLICY "Admins can manage logs"
ON public.admin_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
);