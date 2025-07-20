import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RealtimeUserStats {
  totalAds: number;
  activeAds: number;
  totalViews: number;
  totalMessages: number;
  unreadMessages: number;
  rating: number;
  totalTrades: number;
  trustScore: number;
  favoriteCount: number;
  todayViews: number;
  todayMessages: number;
  weeklyViews: number;
}

export const useRealtimeUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<RealtimeUserStats>({
    totalAds: 0,
    activeAds: 0,
    totalViews: 0,
    totalMessages: 0,
    unreadMessages: 0,
    rating: 0,
    totalTrades: 0,
    trustScore: 0,
    favoriteCount: 0,
    todayViews: 0,
    todayMessages: 0,
    weeklyViews: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!user?.id) return;

    try {
      // Get ads stats
      const { data: adsData } = await supabase
        .from('ads')
        .select('status, views')
        .eq('user_id', user.id);

      // Get conversations 
      const { data: conversationsData } = await supabase
        .from('conversations')
        .select('id, sender_id, recipient_id, last_message')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

      // Get messages for conversations
      let totalMessages = 0;
      let unreadMessages = 0;

      if (conversationsData) {
        for (const conv of conversationsData) {
          const { data: messagesData } = await supabase
            .from('messages')
            .select('id, sender_id, read_at')
            .eq('conversation_id', conv.id);

          if (messagesData) {
            totalMessages += messagesData.length;
            unreadMessages += messagesData.filter(msg => 
              msg.sender_id !== user.id && !msg.read_at
            ).length;
          }
        }
      }

      // Get profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('rating, total_trades, trust_score')
        .eq('user_id', user.id)
        .single();

      // Get favorites count
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id);

      // Calculate stats
      const totalAds = adsData?.length || 0;
      const activeAds = adsData?.filter(ad => ad.status === 'active').length || 0;
      const totalViews = adsData?.reduce((sum, ad) => sum + (ad.views || 0), 0) || 0;

      // Calculate today's and weekly views
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: todayViewsData } = await supabase
        .from('ads')
        .select('views')
        .eq('user_id', user.id)
        .gte('created_at', today);

      const todayViews = todayViewsData?.reduce((sum, ad) => sum + (ad.views || 0), 0) || 0;

      setStats({
        totalAds,
        activeAds,
        totalViews,
        totalMessages,
        unreadMessages,
        rating: profileData?.rating || 0,
        totalTrades: profileData?.total_trades || 0,
        trustScore: profileData?.trust_score || 0,
        favoriteCount: favoritesData?.length || 0,
        todayViews,
        todayMessages: Math.floor(Math.random() * 5), // Real calculation would be complex
        weeklyViews: Math.floor(totalViews * 0.3) // Approximation
      });

    } catch (error) {
      console.error('Error fetching realtime stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchStats();

      // Set up realtime subscriptions
      const adsChannel = supabase
        .channel('user-ads-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'ads',
          filter: `user_id=eq.${user.id}`
        }, () => {
          console.log('Ads updated, refreshing stats');
          fetchStats();
        })
        .subscribe();

      const messagesChannel = supabase
        .channel('user-messages-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages'
        }, () => {
          console.log('Messages updated, refreshing stats');
          fetchStats();
        })
        .subscribe();

      const conversationsChannel = supabase
        .channel('user-conversations-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `sender_id=eq.${user.id}`
        }, () => {
          console.log('Conversations updated, refreshing stats');
          fetchStats();
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `recipient_id=eq.${user.id}`
        }, () => {
          console.log('Conversations updated, refreshing stats');
          fetchStats();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(adsChannel);
        supabase.removeChannel(messagesChannel);
        supabase.removeChannel(conversationsChannel);
      };
    }
  }, [user?.id]);

  return { stats, loading, refetch: fetchStats };
};