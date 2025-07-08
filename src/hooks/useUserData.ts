import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UserStats {
  totalAds: number;
  activeAds: number;
  totalViews: number;
  totalMessages: number;
  unreadMessages: number;
  totalFavorites: number;
  totalTrades: number;
  verificationLevel: string;
  trustScore: number;
  rating: number;
  responseTime: string;
}

export interface UserAd {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: string;
  views: number;
  favorites: number;
  created_at: string;
  boosted_until?: string;
}

interface UserMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at?: string;
  conversation_id: string;
}

export function useUserData() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<UserStats>({
    totalAds: 0,
    activeAds: 0,
    totalViews: 0,
    totalMessages: 0,
    unreadMessages: 0,
    totalFavorites: 0,
    totalTrades: 0,
    verificationLevel: 'none',
    trustScore: 0,
    rating: 0,
    responseTime: '120 min'
  });
  
  const [userAds, setUserAds] = useState<UserAd[]>([]);
  const [recentMessages, setRecentMessages] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user statistics
  const loadUserStats = async () => {
    if (!user) return;

    try {
      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get ads count and stats
      const { data: ads, count: totalAds } = await supabase
        .from('ads')
        .select('id, views, status', { count: 'exact' })
        .eq('user_id', user.id);

      const activeAds = ads?.filter(ad => ad.status === 'active').length || 0;
      const totalViews = ads?.reduce((sum, ad) => sum + (ad.views || 0), 0) || 0;

      // Get messages count
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', user.id);

      // Get unread messages count (simplified query)
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

      const conversationIds = conversations?.map(c => c.id) || [];
      
      const { count: unreadMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .is('read_at', null)
        .neq('sender_id', user.id);

      // Get favorites count
      const { count: totalFavorites } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get trades count
      const { count: totalTrades } = await supabase
        .from('trades')
        .select('*', { count: 'exact', head: true })
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .eq('status', 'completed');

      setStats({
        totalAds: totalAds || 0,
        activeAds,
        totalViews,
        totalMessages: totalMessages || 0,
        unreadMessages: unreadMessages || 0,
        totalFavorites: totalFavorites || 0,
        totalTrades: totalTrades || 0,
        verificationLevel: profile?.verification_level || 'none',
        trustScore: profile?.trust_score || 0,
        rating: profile?.rating || 0,
        responseTime: profile?.response_time || '120 min'
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  // Load user ads
  const loadUserAds = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ads')
        .select('id, title, price, currency, status, views, favorites, created_at, boosted_until')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setUserAds(data || []);
    } catch (error) {
      console.error('Error loading user ads:', error);
    }
  };

  // Load recent messages
  const loadRecentMessages = async () => {
    if (!user) return;

    try {
      // First get conversation IDs
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

      const conversationIds = conversations?.map(c => c.id) || [];
      
      if (conversationIds.length === 0) {
        setRecentMessages([]);
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentMessages(data || []);
    } catch (error) {
      console.error('Error loading recent messages:', error);
    }
  };

  // Boost ad function
  const boostAd = async (adId: string, packageId: number) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('boosts')
        .insert({
          ad_id: adId,
          user_id: user.id,
          boost_type: 'highlighted',
          boost_start: new Date().toISOString(),
          boost_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      await loadUserAds();
      toast({
        title: "Anzeige erfolgreich geboostet",
        description: "Ihre Anzeige wird jetzt hervorgehoben angezeigt.",
      });

      return true;
    } catch (error) {
      console.error('Error boosting ad:', error);
      toast({
        title: "Fehler beim Boosten",
        description: "Die Anzeige konnte nicht geboostet werden.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Delete ad function
  const deleteAd = async (adId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadUserAds();
      await loadUserStats();

      toast({
        title: "Anzeige gelöscht",
        description: "Ihre Anzeige wurde erfolgreich gelöscht.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Die Anzeige konnte nicht gelöscht werden.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Load all data
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.all([
      loadUserStats(),
      loadUserAds(),
      loadRecentMessages()
    ]).finally(() => {
      setLoading(false);
    });

    // Setup realtime subscriptions
    const adsChannel = supabase
      .channel('user_ads_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ads',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadUserAds();
          loadUserStats();
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('user_messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          loadRecentMessages();
          loadUserStats();
        }
      )
      .subscribe();

    const favoritesChannel = supabase
      .channel('user_favorites_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadUserStats();
        }
      )
      .subscribe();

    const tradesChannel = supabase
      .channel('user_trades_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades'
        },
        () => {
          loadUserStats();
        }
      )
      .subscribe();

    const profileChannel = supabase
      .channel('user_profile_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadUserStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(adsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(favoritesChannel);
      supabase.removeChannel(tradesChannel);
      supabase.removeChannel(profileChannel);
    };
  }, [user]);

  return {
    stats,
    userAds,
    recentMessages,
    loading,
    boostAd,
    deleteAd,
    refetch: () => {
      loadUserStats();
      loadUserAds();
      loadRecentMessages();
    }
  };
}