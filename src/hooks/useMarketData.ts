import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type MarketData = Tables<'market_data'>;

export const useMarketData = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      const { data, error } = await supabase
        .from('market_data')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      setMarketData(data || []);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLatestPrices = () => {
    const latestPrices: Record<string, MarketData> = {};
    
    marketData.forEach(data => {
      if (!latestPrices[data.coin] || data.date > latestPrices[data.coin].date) {
        latestPrices[data.coin] = data;
      }
    });
    
    return Object.values(latestPrices);
  };

  const getCoinHistory = (coin: string, days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return marketData
      .filter(data => data.coin === coin && new Date(data.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getTrendingCoins = () => {
    const latest = getLatestPrices();
    return latest
      .sort((a, b) => Number(b.total_volume) - Number(a.total_volume))
      .slice(0, 10);
  };

  const getCoinStats = (coin: string) => {
    const coinData = marketData.filter(data => data.coin === coin);
    if (coinData.length === 0) return null;

    const latest = coinData[0];
    const previous = coinData[1];
    
    const change = previous 
      ? ((Number(latest.avg_price_eur) - Number(previous.avg_price_eur)) / Number(previous.avg_price_eur)) * 100
      : 0;

    return {
      current_price: latest.avg_price_eur,
      price_change_24h: change,
      volume_24h: latest.total_volume,
      trades_24h: latest.trade_count,
      min_price_24h: latest.min_price,
      max_price_24h: latest.max_price
    };
  };

  return {
    marketData,
    loading,
    getLatestPrices,
    getCoinHistory,
    getTrendingCoins,
    getCoinStats,
    refetch: fetchMarketData
  };
};