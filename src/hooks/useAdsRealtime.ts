import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface AdWithProfile {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  images: string[];
  status: string;
  views: number;
  favorites: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  category_id: string;
  boosted_until: string | null;
  featured: boolean;
  accepted_coins: string[];
  crypto_payment_enabled: boolean;
  categories?: { name: string };
  profiles?: {
    full_name: string;
    rating: number;
    verified: boolean;
    avatar_url: string;
  };
}

export function useAdsRealtime() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ads, setAds] = useState<AdWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          categories (name),
          profiles (full_name, rating, verified, avatar_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAds(data as any[] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ads');
    } finally {
      setLoading(false);
    }
  };

  const incrementAdViews = async (adId: string) => {
    try {
      const { error } = await supabase.rpc('increment_ad_views', { ad_id: adId });
      if (error) throw error;
      
      // Optimistisch das lokale State updaten
      setAds(prev => prev.map(ad => 
        ad.id === adId ? { ...ad, views: ad.views + 1 } : ad
      ));
    } catch (error) {
      console.error('Error incrementing ad views:', error);
    }
  };

  useEffect(() => {
    fetchAds();
    
    // Set up real-time subscription for ads
    const adsChannel = supabase
      .channel('ads-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ads',
        },
        (payload) => {
          console.log('Real-time ad update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newAd = payload.new as AdWithProfile;
            if (newAd.status === 'active') {
              setAds(prev => [newAd, ...prev]);
              toast({
                title: "Neue Anzeige",
                description: `Neue Anzeige: ${newAd.title}`,
                duration: 3000,
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedAd = payload.new as AdWithProfile;
            setAds(prev => 
              prev.map(ad => ad.id === updatedAd.id ? updatedAd : ad)
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedAd = payload.old as AdWithProfile;
            setAds(prev => prev.filter(ad => ad.id !== deletedAd.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Ads realtime subscription status:', status);
      });

    // Set up real-time subscription for favorites count
    const favoritesChannel = supabase
      .channel('favorites-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
        },
        (payload) => {
          console.log('Real-time favorites update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newFavorite = payload.new;
            setAds(prev => 
              prev.map(ad => 
                ad.id === newFavorite.ad_id 
                  ? { ...ad, favorites: ad.favorites + 1 }
                  : ad
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedFavorite = payload.old;
            setAds(prev => 
              prev.map(ad => 
                ad.id === deletedFavorite.ad_id 
                  ? { ...ad, favorites: Math.max(0, ad.favorites - 1) }
                  : ad
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(adsChannel);
      supabase.removeChannel(favoritesChannel);
    };
  }, [toast]);

  const getFeaturedAds = () => ads.filter(ad => ad.featured || ad.boosted_until);
  const getRecentAds = () => ads.slice(0, 10);
  const getCategoryAds = (categoryId: string) => ads.filter(ad => ad.category_id === categoryId);

  return {
    ads,
    loading,
    error,
    refetch: fetchAds,
    incrementAdViews,
    getFeaturedAds,
    getRecentAds,
    getCategoryAds
  };
}