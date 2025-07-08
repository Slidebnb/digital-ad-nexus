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
      // Verwende die neue Admin-Funktion um alle echten Nutzer zu laden
      const { data: allUsers, error: usersError } = await supabase
        .rpc('get_all_users_for_admin');

      if (usersError) throw usersError;

      // Verarbeite die Daten von der Funktion
      let processedUsers = allUsers?.map((user: any) => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        role: user.role,
        verified: user.verified,
        banned: user.banned,
        last_active: user.last_active,
        total_trades: user.total_trades,
        total_trade_volume_eur: user.total_trade_volume_eur,
        profile: user.profile_data
      })) || [];

      // Anwenden der Frontend-Filter
      if (filters.search) {
        processedUsers = processedUsers.filter(user => 
          user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
          (user.profile?.full_name && user.profile.full_name.toLowerCase().includes(filters.search.toLowerCase()))
        );
      }

      if (filters.role !== 'all') {
        processedUsers = processedUsers.filter(user => user.role === filters.role);
      }

      if (filters.status !== 'all') {
        if (filters.status === 'banned') {
          processedUsers = processedUsers.filter(user => user.banned);
        } else if (filters.status === 'unverified') {
          processedUsers = processedUsers.filter(user => !user.verified);
        } else if (filters.status === 'active') {
          processedUsers = processedUsers.filter(user => !user.banned && user.verified);
        }
      }

      // Sortierung
      processedUsers.sort((a, b) => {
        const aValue = a[filters.sortBy];
        const bValue = b[filters.sortBy];
        
        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Pagination
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit;
      const paginatedUsers = processedUsers.slice(from, to);
      
      setUsers(paginatedUsers);
      setTotalCount(processedUsers.length);

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
      const { data, error } = await supabase.rpc('promote_user_to_admin_by_email', {
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
      const { data, error } = await supabase.rpc('update_user_ban_status', {
        target_user_id: userId,
        is_banned: true,
        ban_reason: reason
      });

      if (error) throw error;

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
      const { data, error } = await supabase.rpc('update_user_ban_status', {
        target_user_id: userId,
        is_banned: false
      });

      if (error) throw error;

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
      const { data, error } = await supabase.rpc('verify_user_by_id', {
        target_user_id: userId
      });

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
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('admin_logs').insert({
            admin_id: user.id,
            action: logAction,
            target_type: 'bulk_users',
            target_id: userIds[0], // Reference first user
            details: { user_count: userIds.length, user_ids: userIds }
          });
        }
      } catch (logError) {
        console.warn('Failed to log admin action:', logError);
      }

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

  // Real-time updates mit besserer Performance
  useEffect(() => {
    if (!isAdmin) return;

    // Setup realtime für auth.users Änderungen
    const authChannel = supabase
      .channel('admin-auth-users-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'auth', 
        table: 'users' 
      }, (payload) => {
        console.log('Auth user update:', payload);
        setTimeout(() => fetchUsers(), 500);
      })
      .subscribe();

    const profilesChannel = supabase
      .channel('admin-profiles-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        console.log('Profile update:', payload);
        setTimeout(() => fetchUsers(), 500);
      })
      .subscribe();

    const usersChannel = supabase
      .channel('admin-public-users-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'users' 
      }, (payload) => {
        console.log('Public users update:', payload);
        setTimeout(() => fetchUsers(), 500);
      })
      .subscribe();

    // Auto-refresh alle 60 Sekunden für Live-Daten
    const interval = setInterval(() => {
      console.log('Auto-refreshing user data...');
      fetchUsers();
    }, 60000);

    return () => {
      supabase.removeChannel(authChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(usersChannel);
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