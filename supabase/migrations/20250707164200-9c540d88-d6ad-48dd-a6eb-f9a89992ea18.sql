-- Create ratings table for GDPR-compliant rating system
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Ensure one rating per user per ad
  UNIQUE(from_user_id, to_user_id, ad_id)
);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create ratings" 
ON public.ratings 
FOR INSERT 
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can view ratings" 
ON public.ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update own ratings" 
ON public.ratings 
FOR UPDATE 
USING (auth.uid() = from_user_id)
WITH CHECK (auth.uid() = from_user_id);

-- Trigger for updated_at
CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate user rating average
CREATE OR REPLACE FUNCTION public.calculate_user_rating(user_uuid UUID)
RETURNS DECIMAL(3,2)
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(AVG(rating), 0)::DECIMAL(3,2)
  FROM public.ratings
  WHERE to_user_id = user_uuid;
$$;

-- Function to get rating count
CREATE OR REPLACE FUNCTION public.get_user_rating_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.ratings
  WHERE to_user_id = user_uuid;
$$;