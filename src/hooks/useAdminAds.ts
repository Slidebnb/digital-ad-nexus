import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AdminAd {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  status: string;
  condition: string;
  category: string;
  location: string;
  featured: boolean;
  boosted_until: string | null;
  view_count: number;
  favorite_count: number;
  contact_count: number;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    email: string;
    verified: boolean;
  };
  reports_count: number;
}

interface AdFilters {
  search: string;
  status: 'all' | 'active' | 'inactive' | 'reported' | 'featured';
  category: string;
  priceRange: [number, number];
  dateRange: [Date | null, Date | null];
  sortBy: 'created_at' | 'price' | 'view_count' | 'favorite_count';
  sortOrder: 'asc' | 'desc';
}

export const useAdminAds = () => {
  const { isAdmin } = useAuth();
  const [ads, setAds] = useState<AdminAd[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<AdFilters>({
    search: '',
    status: 'all',
    category: 'all',
    priceRange: [0, 10000],
    dateRange: [null, null],
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50
  });

  const fetchAds = async () => {
    if (!isAdmin) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('ads')
        .select(`
          id,
          title,
          description,
          price,
          currency,
          status,
          condition,
          category,
          location,
          featured,
          boosted_until,
          view_count,
          favorite_count,
          contact_count,
          created_at,
          updated_at,
          user_id
        `, { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.status !== 'all') {
        if (filters.status === 'featured') {
          query = query.eq('featured', true);
        } else if (filters.status === 'reported') {
          // This would need a more complex query with reports join
          query = query.eq('status', 'active');
        } else {
          query = query.eq('status', filters.status);
        }
      }

      if (filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      // Price range filter
      query = query
        .gte('price', filters.priceRange[0])
        .lte('price', filters.priceRange[1]);

      // Date range filter
      if (filters.dateRange[0]) {
        query = query.gte('created_at', filters.dateRange[0].toISOString());
      }
      if (filters.dateRange[1]) {
        query = query.lte('created_at', filters.dateRange[1].toISOString());
      }

      // Apply sorting
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });

      // Apply pagination
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Get user data and reports count for each ad
      const adsWithUserData = await Promise.all(
        (data || []).map(async (ad: any) => {
          // Get user data
          const { data: userData } = await supabase
            .from('users')
            .select('id, email, verified')
            .eq('id', ad.user_id)
            .single();

          // Get reports count
          const { count: reportsCount } = await supabase
            .from('reports')
            .select('*', { count: 'exact', head: true })
            .eq('reported_ad_id', ad.id);

          return {
            ...ad,
            user: userData || { id: ad.user_id, email: 'Unbekannt', verified: false },
            reports_count: reportsCount || 0
          } as AdminAd;
        })
      );

      setAds(adsWithUserData);
      setTotalCount(count || 0);

    } catch (error) {
      console.error('Error fetching ads:', error);
      setError('Failed to fetch ads');
    } finally {
      setLoading(false);
    }
  };

  const updateAdStatus = async (adId: string, status: string) => {
    if (!isAdmin) return { error: 'Not authorized' };

    try {
      const { error } = await supabase
        .from('ads')
        .update({ status })
        .eq('id', adId);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_logs').insert({
        action: 'ad_status_changed',
        target_type: 'ad',
        target_id: adId,
        details: { new_status: status }
      });

      await fetchAds();
      return { success: true };
    } catch (error) {
      console.error('Error updating ad status:', error);
      return { error: error.message };
    }
  };

  const featureAd = async (adId: string, featured: boolean) => {
    if (!isAdmin) return { error: 'Not authorized' };

    try {
      const { error } = await supabase
        .from('ads')
        .update({ featured })
        .eq('id', adId);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_logs').insert({
        action: featured ? 'ad_featured' : 'ad_unfeatured',
        target_type: 'ad',
        target_id: adId
      });

      await fetchAds();
      return { success: true };
    } catch (error) {
      console.error('Error featuring ad:', error);
      return { error: error.message };
    }
  };

  const deleteAd = async (adId: string, reason?: string) => {
    if (!isAdmin) return { error: 'Not authorized' };

    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_logs').insert({
        action: 'ad_deleted',
        target_type: 'ad',
        target_id: adId,
        details: { reason }
      });

      await fetchAds();
      return { success: true };
    } catch (error) {
      console.error('Error deleting ad:', error);
      return { error: error.message };
    }
  };

  const bulkAction = async (adIds: string[], action: 'activate' | 'deactivate' | 'feature' | 'unfeature' | 'delete') => {
    if (!isAdmin) return { error: 'Not authorized' };

    try {
      let updateData = {};
      let logAction = '';

      switch (action) {
        case 'activate':
          updateData = { status: 'active' };
          logAction = 'bulk_activate_ads';
          break;
        case 'deactivate':
          updateData = { status: 'inactive' };
          logAction = 'bulk_deactivate_ads';
          break;
        case 'feature':
          updateData = { featured: true };
          logAction = 'bulk_feature_ads';
          break;
        case 'unfeature':
          updateData = { featured: false };
          logAction = 'bulk_unfeature_ads';
          break;
        case 'delete':
          const { error: deleteError } = await supabase
            .from('ads')
            .delete()
            .in('id', adIds);
          
          if (deleteError) throw deleteError;
          logAction = 'bulk_delete_ads';
          break;
      }

      if (action !== 'delete') {
        const { error } = await supabase
          .from('ads')
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .in('id', adIds);

        if (error) throw error;
      }

      // Log bulk action
      await supabase.from('admin_logs').insert({
        action: logAction,
        target_type: 'bulk_ads',
        target_id: adIds[0],
        details: { ad_count: adIds.length, ad_ids: adIds }
      });

      await fetchAds();
      return { success: true };
    } catch (error) {
      console.error('Error performing bulk action:', error);
      return { error: error.message };
    }
  };

  useEffect(() => {
    fetchAds();
  }, [isAdmin, filters, pagination]);

  // Real-time updates
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('admin-ads')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'ads' 
      }, () => {
        fetchAds();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  return {
    ads,
    totalCount,
    loading,
    error,
    filters,
    pagination,
    setFilters,
    setPagination,
    updateAdStatus,
    featureAd,
    deleteAd,
    bulkAction,
    refetch: fetchAds
  };
};