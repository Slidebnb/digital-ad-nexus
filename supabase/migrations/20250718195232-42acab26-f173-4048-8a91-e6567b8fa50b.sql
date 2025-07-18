-- Enable realtime for crypto_prices table
ALTER TABLE crypto_prices REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE crypto_prices;