-- Premium Subscription System
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'premium', -- premium, vip, enterprise
  status TEXT NOT NULL DEFAULT 'active', -- active, expired, cancelled
  price_sol NUMERIC NOT NULL,
  price_eur NUMERIC NOT NULL,
  transaction_signature TEXT,
  solana_wallet_from TEXT,
  solana_wallet_to TEXT NOT NULL,
  features JSONB DEFAULT '{}',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Premium Plans Presets
CREATE TABLE IF NOT EXISTS premium_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_sol NUMERIC NOT NULL,
  price_eur NUMERIC NOT NULL,
  duration_days INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  benefits TEXT[],
  popular BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert Premium Plans
INSERT INTO premium_plans (name, description, price_sol, price_eur, duration_days, features, benefits, popular, sort_order) VALUES
('Premium 1 Monat', 'Alle Premium-Features für 1 Monat', 0.5, 25, 30, 
 '["priority_support", "unlimited_ads", "advanced_analytics", "premium_badge", "boost_discount"]',
 ARRAY['Prioritäts-Support', 'Unbegrenzte Anzeigen', 'Erweiterte Statistiken', 'Premium-Badge', '50% Rabatt auf Boosts'],
 false, 1),
('Premium 3 Monate', 'Alle Premium-Features für 3 Monate - Spare 20%!', 1.2, 60, 90,
 '["priority_support", "unlimited_ads", "advanced_analytics", "premium_badge", "boost_discount", "early_access"]',
 ARRAY['Prioritäts-Support', 'Unbegrenzte Anzeigen', 'Erweiterte Statistiken', 'Premium-Badge', '50% Rabatt auf Boosts', 'Early Access zu neuen Features'],
 true, 2),
('Premium 12 Monate', 'Alle Premium-Features für 1 Jahr - Spare 40%!', 3.6, 180, 365,
 '["priority_support", "unlimited_ads", "advanced_analytics", "premium_badge", "boost_discount", "early_access", "vip_features"]',
 ARRAY['Prioritäts-Support', 'Unbegrenzte Anzeigen', 'Erweiterte Statistiken', 'Premium-Badge', '50% Rabatt auf Boosts', 'Early Access', 'VIP-Features'],
 false, 3);

-- RLS Policies
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_plans ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "users_view_own_subscriptions" ON premium_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own subscriptions (for payment processing)
CREATE POLICY "users_insert_own_subscriptions" ON premium_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "users_update_own_subscriptions" ON premium_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Everyone can view active premium plans
CREATE POLICY "public_view_active_plans" ON premium_plans
  FOR SELECT USING (active = true);

-- Function to check if user has active premium
CREATE OR REPLACE FUNCTION is_premium_user(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM premium_subscriptions 
    WHERE user_id = user_uuid 
    AND status = 'active' 
    AND expires_at > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;