import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HomepageStats {
  activeUsers: number;
  totalAds: number;
  tradeVolume: number;
  satisfaction: number;
  loading: boolean;
}

export const useHomepageStats = () => {
  const [stats, setStats] = useState<HomepageStats>({
    activeUsers: 0,
    totalAds: 0,
    tradeVolume: 0,
    satisfaction: 99,
    loading: true
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('banned', false);

      // Get active users (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('banned', false)
        .gte('last_active', thirtyDaysAgo.toISOString());

      // Get total ads count
      const { count: adsCount } = await supabase
        .from('ads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get trade volume from trades table
      const { data: tradeData } = await supabase
        .from('trades')
        .select('price_eur')
        .eq('status', 'completed');

      const totalVolume = tradeData?.reduce((sum, trade) => sum + (trade.price_eur || 0), 0) || 0;

      // Calculate satisfaction based on reviews
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('rating');

      const avgRating = reviewData?.length 
        ? reviewData.reduce((sum, review) => sum + review.rating, 0) / reviewData.length 
        : 4.8;

      const satisfaction = Math.round((avgRating / 5) * 100);

      setStats({
        activeUsers: activeUsersCount || usersCount || 0,
        totalAds: adsCount || 0,
        tradeVolume: Math.round(totalVolume),
        satisfaction: satisfaction,
        loading: false
      });

    } catch (error) {
      console.error('Error fetching homepage stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  return { stats, refetch: fetchStats };
};