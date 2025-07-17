-- Enable cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable http extension if not already enabled  
CREATE EXTENSION IF NOT EXISTS http;

-- Create a scheduled job to update crypto prices every 5 minutes
SELECT cron.schedule(
  'crypto-price-updater',
  '*/5 * * * *', -- every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://jaherdxwzftzgazplwzo.supabase.co/functions/v1/crypto-price-updater',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphaGVyZHh3emZ0emdhenBsd3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjA4MTEsImV4cCI6MjA2NTgzNjgxMX0.BFlaz60sLyhZV9DwttuJWJ9uCvWFPE4ZIhEUyhAxsiQ"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Also create a function to update boost package prices when crypto prices change
CREATE OR REPLACE FUNCTION update_boost_package_crypto_prices(
  sol_price DECIMAL, 
  btc_price DECIMAL, 
  eth_price DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update boost package crypto prices based on EUR prices
  UPDATE boost_packages SET
    price_sol = CASE WHEN price_eur > 0 THEN price_eur / sol_price ELSE NULL END,
    price_btc = CASE WHEN price_eur > 0 THEN price_eur / btc_price ELSE NULL END,
    price_eth = CASE WHEN price_eur > 0 THEN price_eur / eth_price ELSE NULL END
  WHERE crypto_enabled = true;
END;
$$;