import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Ad = Tables<'ads'>;

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userAds, setUserAds] = useState<(Ad & { category_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationRequest, setVerificationRequest] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
      fetchUserAds();
      fetchVerificationRequest();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (!data) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
        } else {
          setProfile(newProfile);
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const fetchUserAds = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user ads:', error);
        return;
      }

      const adsWithCategory = data?.map(ad => ({
        ...ad,
        category_name: (ad as any).categories?.name
      })) || [];

      setUserAds(adsWithCategory);
    } catch (error) {
      console.error('Error in fetchUserAds:', error);
    }
  };

  const fetchVerificationRequest = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching verification request:', error);
        return;
      }

      setVerificationRequest(data);
    } catch (error) {
      console.error('Error in fetchVerificationRequest:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) return { error: 'No user' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return { error };
      }

      setProfile(data);
      return { data };
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return { error };
    }
  };

  const createVerificationRequest = async (requestData: {
    document_type: string;
    full_name: string;
    document_front_url?: string;
    document_back_url?: string;
    selfie_url?: string;
  }) => {
    if (!user?.id) return { error: 'No user' };

    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          ...requestData,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating verification request:', error);
        return { error };
      }

      setVerificationRequest(data);
      return { data };
    } catch (error) {
      console.error('Error in createVerificationRequest:', error);
      return { error };
    }
  };

  const getUserStats = () => {
    const activeAds = userAds.filter(ad => ad.status === 'active').length;
    const totalViews = userAds.reduce((sum, ad) => sum + (ad.views || 0), 0);
    const totalMessages = userAds.reduce((sum, ad) => sum + (ad.contact_count || 0), 0);

    return {
      totalAds: userAds.length,
      activeAds,
      totalViews,
      totalMessages,
      rating: profile?.rating || 0,
      trades: profile?.total_trades || 0,
      verified: profile?.verified || false,
      verificationLevel: profile?.verification_level || 'none'
    };
  };

  return {
    profile,
    userAds,
    loading,
    verificationRequest,
    updateProfile,
    createVerificationRequest,
    getUserStats,
    refetch: () => {
      fetchProfile();
      fetchUserAds();
      fetchVerificationRequest();
    }
  };
};