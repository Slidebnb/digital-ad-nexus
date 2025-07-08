-- PHASE 1: Universal Wallet System - Database Extension
-- Crypto Payment Infrastructure für SOL, BTC, ETH

-- Crypto Payments Tabelle für Transaction History
CREATE TABLE public.crypto_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  payment_type TEXT NOT NULL, -- 'boost', 'premium', 'escrow'
  amount_crypto DECIMAL(20,8) NOT NULL,
  amount_eur DECIMAL(10,2) NOT NULL,
  cryptocurrency TEXT NOT NULL, -- 'SOL', 'BTC', 'ETH'
  exchange_rate DECIMAL(15,8) NOT NULL,
  wallet_address TEXT NOT NULL,
  transaction_hash TEXT,
  blockchain_network TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'failed', 'cancelled'
  confirmation_count INTEGER DEFAULT 0,
  ad_id UUID, -- für boost payments
  boost_package_id INTEGER, -- für boost payments
  subscription_id UUID, -- für premium payments
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- User Wallet Addresses für Multi-Coin Support
CREATE TABLE public.user_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  cryptocurrency TEXT NOT NULL, -- 'SOL', 'BTC', 'ETH'
  wallet_type TEXT NOT NULL, -- 'metamask', 'phantom', 'unisat', 'walletconnect'
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, wallet_address, cryptocurrency)
);

-- Crypto Price Cache für Live Konvertierung
CREATE TABLE public.crypto_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cryptocurrency TEXT NOT NULL,
  price_eur DECIMAL(15,8) NOT NULL,
  price_usd DECIMAL(15,8) NOT NULL,
  market_cap DECIMAL(20,2),
  volume_24h DECIMAL(20,2),
  change_24h DECIMAL(8,4),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'coingecko',
  UNIQUE(cryptocurrency)
);

-- Payment Transaction Real-time Tracking
CREATE TABLE public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crypto_payment_id UUID NOT NULL REFERENCES public.crypto_payments(id),
  blockchain_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'broadcasted', 'confirmed', 'failed'
  transaction_hash TEXT,
  block_number BIGINT,
  gas_used BIGINT,
  gas_price DECIMAL(20,8),
  network_fee DECIMAL(20,8),
  confirmation_blocks INTEGER DEFAULT 0,
  required_confirmations INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Boost Packages um Crypto Prices erweitern
ALTER TABLE public.boost_packages 
ADD COLUMN price_sol DECIMAL(10,4),
ADD COLUMN price_btc DECIMAL(12,8),
ADD COLUMN price_eth DECIMAL(10,6),
ADD COLUMN crypto_enabled BOOLEAN NOT NULL DEFAULT true;

-- Ads um Crypto Payment Flag erweitern
ALTER TABLE public.ads 
ADD COLUMN crypto_payment_enabled BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN preferred_crypto TEXT[]; -- ['SOL', 'BTC', 'ETH']

-- Profiles um Payment Preferences erweitern
ALTER TABLE public.profiles 
ADD COLUMN preferred_payment_methods TEXT[] DEFAULT '{"EUR"}',
ADD COLUMN crypto_wallet_connected BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN auto_convert_crypto BOOLEAN NOT NULL DEFAULT true;

-- Subscriptions um Crypto Support erweitern
ALTER TABLE public.subscriptions
ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN crypto_payment_id UUID REFERENCES public.crypto_payments(id),
ADD COLUMN auto_renewal_crypto BOOLEAN NOT NULL DEFAULT false;

-- Enable RLS on new tables
ALTER TABLE public.crypto_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies für crypto_payments
CREATE POLICY "Users can view own crypto payments" 
ON public.crypto_payments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own crypto payments" 
ON public.crypto_payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own crypto payments" 
ON public.crypto_payments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all crypto payments" 
ON public.crypto_payments 
FOR ALL 
USING (is_admin());

-- RLS Policies für user_wallets
CREATE POLICY "Users can manage own wallets" 
ON public.user_wallets 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets" 
ON public.user_wallets 
FOR SELECT 
USING (is_admin());

-- RLS Policies für crypto_prices (Public Read)
CREATE POLICY "Everyone can view crypto prices" 
ON public.crypto_prices 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage crypto prices" 
ON public.crypto_prices 
FOR ALL 
USING (is_admin());

-- RLS Policies für payment_transactions
CREATE POLICY "Users can view own payment transactions" 
ON public.payment_transactions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.crypto_payments 
  WHERE crypto_payments.id = payment_transactions.crypto_payment_id 
  AND crypto_payments.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all payment transactions" 
ON public.payment_transactions 
FOR ALL 
USING (is_admin());

-- Triggers für updated_at
CREATE TRIGGER update_crypto_payments_updated_at
BEFORE UPDATE ON public.crypto_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_wallets_updated_at
BEFORE UPDATE ON public.user_wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indices für Performance
CREATE INDEX idx_crypto_payments_user_id ON public.crypto_payments(user_id);
CREATE INDEX idx_crypto_payments_status ON public.crypto_payments(status);
CREATE INDEX idx_crypto_payments_type ON public.crypto_payments(payment_type);
CREATE INDEX idx_crypto_payments_crypto ON public.crypto_payments(cryptocurrency);
CREATE INDEX idx_crypto_payments_created_at ON public.crypto_payments(created_at);

CREATE INDEX idx_user_wallets_user_id ON public.user_wallets(user_id);
CREATE INDEX idx_user_wallets_crypto ON public.user_wallets(cryptocurrency);
CREATE INDEX idx_user_wallets_address ON public.user_wallets(wallet_address);

CREATE INDEX idx_payment_transactions_crypto_payment_id ON public.payment_transactions(crypto_payment_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(blockchain_status);
CREATE INDEX idx_payment_transactions_hash ON public.payment_transactions(transaction_hash);

-- Initial Crypto Prices (Beispielwerte)
INSERT INTO public.crypto_prices (cryptocurrency, price_eur, price_usd, source) VALUES
('SOL', 95.50, 105.20, 'coingecko'),
('BTC', 42500.00, 46800.00, 'coingecko'),
('ETH', 2850.00, 3140.00, 'coingecko');

-- Initial Boost Package Crypto Prices
UPDATE public.boost_packages SET 
  price_sol = CASE 
    WHEN price_eur = 9.99 THEN 0.1047  -- Basic: ~0.10 SOL
    WHEN price_eur = 24.99 THEN 0.2617 -- Standard: ~0.26 SOL
    WHEN price_eur = 49.99 THEN 0.5235 -- Premium: ~0.52 SOL
    ELSE price_eur / 95.50
  END,
  price_btc = CASE 
    WHEN price_eur = 9.99 THEN 0.00023512  -- Basic: ~0.00024 BTC
    WHEN price_eur = 24.99 THEN 0.00058776 -- Standard: ~0.00059 BTC
    WHEN price_eur = 49.99 THEN 0.00117647 -- Premium: ~0.00118 BTC
    ELSE price_eur / 42500.00
  END,
  price_eth = CASE 
    WHEN price_eur = 9.99 THEN 0.003505  -- Basic: ~0.0035 ETH
    WHEN price_eur = 24.99 THEN 0.008768 -- Standard: ~0.0088 ETH
    WHEN price_eur = 49.99 THEN 0.017544 -- Premium: ~0.0175 ETH
    ELSE price_eur / 2850.00
  END,
  crypto_enabled = true;

-- Success Message
SELECT 'Universal Wallet System Database Setup Complete!' as message;