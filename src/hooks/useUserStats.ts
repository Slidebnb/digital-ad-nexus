import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserStats {
  totalAds: number;
  activeAds: number;
  totalViews: number;
  totalMessages: number;
  unreadMessages: number;
  totalFavorites: number;
  totalTrades: number;
  verificationLevel: string;
  verified: boolean;
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalAds: 0,
    activeAds: 0,
    totalViews: 0,
    totalMessages: 0,
    unreadMessages: 0,
    totalFavorites: 0,
    totalTrades: 0,
    verificationLevel: 'none',
    verified: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Direct queries since the RPC function may not be available yet
      const [adsRes, conversationsRes, favoritesRes, tradesRes, profileRes] = await Promise.all([
        supabase.from('ads').select('id, status, views').eq('user_id', user.id),
        supabase.from('conversations').select('id, sender_id, recipient_id, unread_by_recipient').or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`),
        supabase.from('favorites').select('id').eq('user_id', user.id),
        supabase.from('trades').select('id').or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`),
        supabase.from('profiles').select('verified, verification_level').eq('user_id', user.id).single()
      ]);

      const ads = adsRes.data || [];
      const conversations = conversationsRes.data || [];
      const favorites = favoritesRes.data || [];
      const trades = tradesRes.data || [];
      const profile = profileRes.data;

      // Count unread messages
      let unreadMessages = 0;
      let totalMessages = 0;
      
      for (const conv of conversations) {
        const { data: messages } = await supabase
          .from('messages')
          .select('id, sender_id, read_at')
          .eq('conversation_id', conv.id);
        
        if (messages) {
          totalMessages += messages.length;
          unreadMessages += messages.filter(msg => 
            msg.sender_id !== user.id && !msg.read_at
          ).length;
        }
      }
      setStats({
        totalAds: ads.length,
        activeAds: ads.filter(ad => ad.status === 'active').length,
        totalViews: ads.reduce((sum, ad) => sum + (ad.views || 0), 0),
        totalMessages,
        unreadMessages,
        totalFavorites: favorites.length,
        totalTrades: trades.length,
        verificationLevel: profile?.verification_level || 'none',
        verified: profile?.verified || false
      });
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setError('Failed to load user statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [user?.id]);

  return { stats, loading, error, refetch: fetchUserStats };
};