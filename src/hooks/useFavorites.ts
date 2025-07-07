import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchFavorites();
    }
  }, [user?.id]);

  const fetchFavorites = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('ad_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data?.map(f => f.ad_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (adId: string) => {
    if (!user?.id) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Bitte melden Sie sich an, um Favoriten zu verwalten.",
        variant: "destructive"
      });
      return;
    }

    const isFavorite = favorites.includes(adId);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('ad_id', adId);

        if (error) throw error;
        setFavorites(prev => prev.filter(id => id !== adId));
        
        toast({
          title: "Favorit entfernt",
          description: "Anzeige wurde aus Ihren Favoriten entfernt."
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            ad_id: adId
          });

        if (error) throw error;
        setFavorites(prev => [...prev, adId]);
        
        toast({
          title: "Favorit hinzugefügt",
          description: "Anzeige wurde zu Ihren Favoriten hinzugefügt."
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Fehler",
        description: "Favorit konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  };

  const getFavoriteAds = async () => {
    if (!user?.id || favorites.length === 0) return [];

    try {
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          categories (name),
          profiles!ads_user_id_fkey (full_name, rating, verified)
        `)
        .in('id', favorites)
        .eq('status', 'active');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching favorite ads:', error);
      return [];
    }
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    getFavoriteAds,
    isFavorite: (adId: string) => favorites.includes(adId)
  };
};