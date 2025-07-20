
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger, measurePerformance, retryWithBackoff } from '@/utils/logger';

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
  
  // Use refs to prevent unnecessary effect reruns
  const channelRef = useRef<any>(null);
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);

  const fetchUserStats = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const result = await measurePerformance(async () => {
        // Parallel queries for better performance
        const [adsRes, conversationsRes, favoritesRes, tradesRes, profileRes] = await Promise.all([
          supabase.from('ads').select('id, status, views').eq('user_id', user.id),
          supabase.from('conversations').select('id, sender_id, recipient_id').or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`),
          supabase.from('favorites').select('id').eq('user_id', user.id),
          supabase.from('trades').select('id').or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`),
          supabase.from('profiles').select('verified, verification_level').eq('user_id', user.id).single()
        ]);

        // Handle potential errors
        const ads = adsRes.data || [];
        const conversations = conversationsRes.data || [];
        const favorites = favoritesRes.data || [];
        const trades = tradesRes.data || [];
        const profile = profileRes.data;

        // Count unread messages efficiently
        let unreadMessages = 0;
        let totalMessages = 0;
        
        if (conversations.length > 0) {
          const conversationIds = conversations.map(c => c.id);
          const { data: messages } = await supabase
            .from('messages')
            .select('id, sender_id, read_at')
            .in('conversation_id', conversationIds);
          
          if (messages) {
            totalMessages = messages.length;
            unreadMessages = messages.filter(msg => 
              msg.sender_id !== user.id && !msg.read_at
            ).length;
          }
        }

        return {
          totalAds: ads.length,
          activeAds: ads.filter(ad => ad.status === 'active').length,
          totalViews: ads.reduce((sum, ad) => sum + (ad.views || 0), 0),
          totalMessages,
          unreadMessages,
          totalFavorites: favorites.length,
          totalTrades: trades.length,
          verificationLevel: profile?.verification_level || 'none',
          verified: profile?.verified || false
        };
      }, 'fetchUserStats', 'useUserStats');

      setStats(result);
      setError(null);
      lastFetchTimeRef.current = Date.now();

      logger.debug('User stats fetched successfully', 'useUserStats', {
        userId: user.id,
        stats: result
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
      logger.error('Failed to fetch user stats', 'useUserStats', { 
        error: errorMessage,
        userId: user.id 
      });
      setError('Statistiken konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchStatsWithRetry = useCallback(() => {
    return retryWithBackoff(fetchUserStats, 3, 1000, 'useUserStats');
  }, [fetchUserStats]);

  useEffect(() => {
    if (!user?.id) {
      setStats({
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
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchStatsWithRetry();

    // Set up realtime subscription
    const setupRealtimeSubscription = () => {
      // Clean up existing channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      channelRef.current = supabase
        .channel('user-stats-realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'ads',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          logger.debug('Realtime ads update', 'useUserStats', { 
            event: payload.eventType,
            adId: payload.new?.id || payload.old?.id
          });
          
          // Debounce rapid updates
          const now = Date.now();
          if (now - lastFetchTimeRef.current < 2000) {
            return;
          }
          
          fetchStatsWithRetry();
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages'
        }, (payload) => {
          logger.debug('Realtime messages update', 'useUserStats', { 
            event: payload.eventType,
            messageId: payload.new?.id || payload.old?.id
          });
          
          // Only update if it affects this user
          const message = payload.new || payload.old;
          if (message && (message.sender_id === user.id || 
              // Check if message is in user's conversations - simplified check
              message.conversation_id)) {
            fetchStatsWithRetry();
          }
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`
        }, () => {
          logger.debug('Realtime favorites update', 'useUserStats');
          fetchStatsWithRetry();
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            logger.info('Stats realtime subscription active', 'useUserStats');
          } else if (status === 'CHANNEL_ERROR') {
            logger.error('Stats realtime subscription error', 'useUserStats');
            // Retry subscription after delay
            setTimeout(setupRealtimeSubscription, 5000);
          }
        });
    };

    setupRealtimeSubscription();

    // Set up periodic refresh as fallback
    fetchIntervalRef.current = setInterval(() => {
      fetchStatsWithRetry();
    }, 60000); // 60 seconds for stats (less frequent than messages)

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
    };
  }, [user?.id, fetchStatsWithRetry]);

  const refetch = useCallback(() => {
    return fetchStatsWithRetry();
  }, [fetchStatsWithRetry]);

  return { stats, loading, error, refetch };
};
