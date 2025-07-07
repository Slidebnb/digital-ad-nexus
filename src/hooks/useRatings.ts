import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRatings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const submitRating = async (
    toUserId: string, 
    adId: string, 
    rating: number, 
    reviewText?: string
  ) => {
    if (!user?.id) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Bitte melden Sie sich an, um Bewertungen abzugeben.",
        variant: "destructive"
      });
      return false;
    }

    if (user.id === toUserId) {
      toast({
        title: "Fehler",
        description: "Sie können sich nicht selbst bewerten.",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('ratings')
        .upsert({
          from_user_id: user.id,
          to_user_id: toUserId,
          ad_id: adId,
          rating,
          review_text: reviewText
        });

      if (error) throw error;

      toast({
        title: "Bewertung abgegeben",
        description: "Ihre Bewertung wurde erfolgreich gespeichert."
      });

      return true;
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Fehler",
        description: "Bewertung konnte nicht gespeichert werden.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getUserRatings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          from_user:profiles!ratings_from_user_id_fkey(full_name, verified),
          ad:ads!ratings_ad_id_fkey(title)
        `)
        .eq('to_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user ratings:', error);
      return [];
    }
  };

  const getUserRatingStats = async (userId: string) => {
    try {
      const { data: avgData, error: avgError } = await supabase
        .rpc('calculate_user_rating', { user_uuid: userId });

      const { data: countData, error: countError } = await supabase
        .rpc('get_user_rating_count', { user_uuid: userId });

      if (avgError || countError) throw avgError || countError;

      return {
        averageRating: Number(avgData) || 0,
        totalRatings: Number(countData) || 0
      };
    } catch (error) {
      console.error('Error fetching rating stats:', error);
      return { averageRating: 0, totalRatings: 0 };
    }
  };

  const hasUserRated = async (toUserId: string, adId: string) => {
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('id')
        .eq('from_user_id', user.id)
        .eq('to_user_id', toUserId)
        .eq('ad_id', adId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking if user rated:', error);
      return false;
    }
  };

  return {
    loading,
    submitRating,
    getUserRatings,
    getUserRatingStats,
    hasUserRated
  };
};