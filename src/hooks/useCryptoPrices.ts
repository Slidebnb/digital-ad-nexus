import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CryptoPrice {
  cryptocurrency: string;
  price_eur: number;
  price_usd: number;
  market_cap?: number;
  volume_24h?: number;
  change_24h?: number;
  last_updated: string;
  source: string;
}

export function useCryptoPrices() {
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_prices')
        .select('*')
        .in('cryptocurrency', ['SOL', 'BTC', 'ETH']);

      if (error) throw error;

      const pricesMap = data.reduce((acc, price) => {
        acc[price.cryptocurrency] = price;
        return acc;
      }, {} as Record<string, CryptoPrice>);

      setPrices(pricesMap);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  };

  const convertEurToCrypto = (eurAmount: number, crypto: string): number => {
    const price = prices[crypto];
    if (!price) return 0;
    return eurAmount / price.price_eur;
  };

  const convertCryptoToEur = (cryptoAmount: number, crypto: string): number => {
    const price = prices[crypto];
    if (!price) return 0;
    return cryptoAmount * price.price_eur;
  };

  const formatCryptoAmount = (amount: number, crypto: string): string => {
    switch (crypto) {
      case 'BTC':
        return amount.toFixed(8);
      case 'ETH':
        return amount.toFixed(6);
      case 'SOL':
        return amount.toFixed(4);
      default:
        return amount.toFixed(8);
    }
  };

  const getCryptoSymbol = (crypto: string): string => {
    switch (crypto) {
      case 'BTC': return '₿';
      case 'ETH': return 'Ξ';
      case 'SOL': return '◎';
      default: return '';
    }
  };

  useEffect(() => {
    fetchPrices();
    
    // Auto-refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    prices,
    loading,
    error,
    fetchPrices,
    convertEurToCrypto,
    convertCryptoToEur,
    formatCryptoAmount,
    getCryptoSymbol
  };
}