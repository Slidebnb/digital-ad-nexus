import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  role: string;
  verified: boolean;
  banned: boolean;
  last_active: string;
  total_trades: number;
  total_trade_volume_eur: number;
  profile: {
    full_name?: string;
    avatar_url?: string;
    city?: string;
    verification_level?: string;
    trust_score?: number;
  } | null;
}

interface UserFilters {
  search: string;
  role: 'all' | 'admin' | 'user';
  status: 'all' | 'active' | 'banned' | 'unverified';
  sortBy: 'created_at' | 'last_active' | 'email' | 'total_trades';
  sortOrder: 'asc' | 'desc';
}

export const useAdminUsers = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50
  });

  const fetchUsers = async () => {
    if (!isAdmin) return;

    setLoading(true);
    setError(null);

    try {
      // Apply pagination
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;

      // Separate queries since joins are not working
      const { data: usersData, error: usersError, count } = await supabase
        .from('users')
        .select(`
          id,
          email,
          created_at,
          role,
          verified,
          banned,
          last_active,
          total_trades,
          total_trade_volume_eur
        `, { count: 'exact' })
        .order(filters.sortBy, { ascending: filters.sortOrder === 'asc' })
        .range(from, to);

      if (usersError) throw usersError;

      // Get profiles separately
      const userIds = usersData?.map(user => user.id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          avatar_url,
          city,
          verification_level,
          trust_score
        `)
        .in('user_id', userIds);

      // Merge user data with profiles
      const processedUsers = usersData?.map((user: any) => {
        const profile = profilesData?.find(p => p.user_id === user.id);
        return {
          ...user,
          profile: profile || null
        };
      }) || [];
      
      setUsers(processedUsers);
      setTotalCount(count || 0);

    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const promoteUserToAdmin = async (email: string) => {
    if (!isAdmin) return { error: 'Not authorized' };

    try {
      const { error } = await supabase.rpc('promote_to_admin', {
        target_email: email
      });

      if (error) throw error;
      
      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error promoting user:', error);
      return { error: error.message };
    }
  };

  const banUser = async (userId: string, reason?: string) => {
    if (!isAdmin) return { error: 'Not authorized' };

    try {
      const { error } = await supabase
        .from('users')
        .update({ banned: true })
        .eq('id', userId);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_logs').insert({
        action: 'user_banned',
        target_type: 'user',
        target_id: userId,
        details: { reason }
      });

      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error banning user:', error);
      return { error: error.message };
    }
  };

  const unbanUser = async (userId: string) => {
    if (!isAdmin) return { error: 'Not authorized' };

    try {
      const { error } = await supabase
        .from('users')
        .update({ banned: false })
        .eq('id', userId);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_logs').insert({
        action: 'user_unbanned',
        target_type: 'user',
        target_id: userId
      });

      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error unbanning user:', error);
      return { error: error.message };
    }
  };

  const verifyUser = async (userId: string) => {
    if (!isAdmin) return { error: 'Not authorized' };

    try {
      const { error } = await supabase
        .from('users')
        .update({ verified: true })
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error verifying user:', error);
      return { error: error.message };
    }
  };

  const bulkAction = async (userIds: string[], action: 'ban' | 'unban' | 'verify') => {
    if (!isAdmin) return { error: 'Not authorized' };

    try {
      let updateData = {};
      let logAction = '';

      switch (action) {
        case 'ban':
          updateData = { banned: true };
          logAction = 'bulk_ban';
          break;
        case 'unban':
          updateData = { banned: false };
          logAction = 'bulk_unban';
          break;
        case 'verify':
          updateData = { verified: true };
          logAction = 'bulk_verify';
          break;
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .in('id', userIds);

      if (error) throw error;

      // Log bulk action
      await supabase.from('admin_logs').insert({
        action: logAction,
        target_type: 'bulk_users',
        target_id: userIds[0], // Reference first user
        details: { user_count: userIds.length, user_ids: userIds }
      });

      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error performing bulk action:', error);
      return { error: error.message };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isAdmin, filters, pagination]);

  // Real-time updates with better performance
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('admin-users-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'users' 
      }, (payload) => {
        console.log('User update:', payload);
        // Debounced refresh to avoid too many updates
        setTimeout(() => fetchUsers(), 100);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        console.log('Profile update:', payload);
        setTimeout(() => fetchUsers(), 100);
      })
      .subscribe();

    // Auto-refresh every 30 seconds for live data
    const interval = setInterval(fetchUsers, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [isAdmin]);

  return {
    users,
    totalCount,
    loading,
    error,
    filters,
    pagination,
    setFilters,
    setPagination,
    promoteUserToAdmin,
    banUser,
    unbanUser,
    verifyUser,
    bulkAction,
    refetch: fetchUsers
  };
};