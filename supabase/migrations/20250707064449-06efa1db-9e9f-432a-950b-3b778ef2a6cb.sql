-- Erweiterte Features für KryptoMarkt-Plattform
-- Favoriten-System
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, ad_id)
);

-- Preisalerts
CREATE TABLE public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin TEXT NOT NULL,
  target_price NUMERIC NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('above', 'below')),
  is_active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Premium Accounts & Subscriptions
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'premium', 'pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  features JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Blacklist System
CREATE TABLE public.user_blacklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blacklisted_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, blacklisted_user_id)
);

-- Affiliate System
CREATE TABLE public.affiliate_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  commission_rate NUMERIC DEFAULT 0.05,
  total_earned NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2FA Settings (erweitert profiles)
ALTER TABLE public.profiles ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN two_factor_secret TEXT;
ALTER TABLE public.profiles ADD COLUMN backup_codes TEXT[];

-- Payment Methods
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method_type TEXT NOT NULL CHECK (method_type IN ('bank_transfer', 'paypal', 'revolut', 'wise', 'crypto')),
  details JSONB NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notification Preferences (erweitert)
CREATE TABLE public.notification_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'push', 'sms')),
  categories TEXT[] DEFAULT ARRAY['new_messages', 'price_alerts', 'trade_updates'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Template Messages
CREATE TABLE public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trading Statistics (für Analytics)
CREATE TABLE public.trading_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_trades INTEGER DEFAULT 0,
  total_volume_eur NUMERIC DEFAULT 0,
  successful_trades INTEGER DEFAULT 0,
  avg_response_time_minutes INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Market Data für Trends
CREATE TABLE public.market_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coin TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  avg_price_eur NUMERIC NOT NULL,
  total_volume NUMERIC DEFAULT 0,
  trade_count INTEGER DEFAULT 0,
  min_price NUMERIC,
  max_price NUMERIC,
  UNIQUE(coin, date)
);

-- RLS Policies
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- Favorites Policies
CREATE POLICY "Users can manage own favorites" ON public.favorites
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public favorite counts" ON public.favorites
FOR SELECT USING (true);

-- Price Alerts Policies
CREATE POLICY "Users can manage own price alerts" ON public.price_alerts
FOR ALL USING (auth.uid() = user_id);

-- Subscriptions Policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions
FOR ALL USING (is_admin());

-- Blacklist Policies
CREATE POLICY "Users can manage own blacklist" ON public.user_blacklist
FOR ALL USING (auth.uid() = user_id);

-- Affiliate Policies
CREATE POLICY "Users can view own referrals" ON public.affiliate_referrals
FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Payment Methods Policies
CREATE POLICY "Users can manage own payment methods" ON public.payment_methods
FOR ALL USING (auth.uid() = user_id);

-- Notification Subscriptions Policies
CREATE POLICY "Users can manage own notifications" ON public.notification_subscriptions
FOR ALL USING (auth.uid() = user_id);

-- Message Templates Policies
CREATE POLICY "Users can manage own templates" ON public.message_templates
FOR ALL USING (auth.uid() = user_id);

-- Trading Stats Policies
CREATE POLICY "Users can view own stats" ON public.trading_stats
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all stats" ON public.trading_stats
FOR SELECT USING (is_admin());

-- Market Data Policies (public read)
CREATE POLICY "Public can view market data" ON public.market_data
FOR SELECT USING (true);

CREATE POLICY "Admins can manage market data" ON public.market_data
FOR ALL USING (is_admin());

-- Nützliche Funktionen
CREATE OR REPLACE FUNCTION public.get_user_verification_level(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  level TEXT := 'none';
  profile_record RECORD;
BEGIN
  SELECT * INTO profile_record FROM public.profiles WHERE user_id = user_uuid;
  
  IF profile_record.verified THEN
    level := 'bronze';
    
    -- Silver: Verified + mindestens 5 Trades
    IF profile_record.total_trades >= 5 THEN
      level := 'silver';
      
      -- Gold: Silver + mindestens 50 Trades + Rating > 4.5
      IF profile_record.total_trades >= 50 AND profile_record.rating >= 4.5 THEN
        level := 'gold';
      END IF;
    END IF;
  END IF;
  
  RETURN level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Automatische Trading Stats Update
CREATE OR REPLACE FUNCTION public.update_trading_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.trading_stats (user_id, date, total_trades, successful_trades)
  VALUES (NEW.seller_id, CURRENT_DATE, 1, CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END)
  ON CONFLICT (user_id, date) 
  DO UPDATE SET 
    total_trades = trading_stats.total_trades + 1,
    successful_trades = trading_stats.successful_trades + CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END;
    
  INSERT INTO public.trading_stats (user_id, date, total_trades, successful_trades)
  VALUES (NEW.buyer_id, CURRENT_DATE, 1, CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END)
  ON CONFLICT (user_id, date) 
  DO UPDATE SET 
    total_trades = trading_stats.total_trades + 1,
    successful_trades = trading_stats.successful_trades + CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für Trading Stats
CREATE TRIGGER update_trading_stats_trigger
AFTER INSERT ON public.trades
FOR EACH ROW EXECUTE FUNCTION public.update_trading_stats();

-- Updated at Triggers
CREATE TRIGGER update_price_alerts_updated_at BEFORE UPDATE ON public.price_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();