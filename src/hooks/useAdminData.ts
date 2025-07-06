import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AdminStats {
  totalUsers: number;
  activeAds: number;
  pendingReports: number;
  totalTrades: number;
  platformVolume: number;
  verifiedUsers: number;
  pendingVerifications: number;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  role: string;
  verified: boolean;
  banned: boolean;
  last_active: string;
}

interface VerificationRequest {
  id: string;
  user_id: string;
  status: string;
  document_type: string;
  full_name: string;
  created_at: string;
  user_email?: string;
}

export const useAdminData = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeAds: 0,
    pendingReports: 0,
    totalTrades: 0,
    platformVolume: 0,
    verifiedUsers: 0,
    pendingVerifications: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = async () => {
    if (!isAdmin) return;

    try {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch active ads
      const { count: activeAds } = await supabase
        .from('ads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch pending reports
      const { count: pendingReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch trades
      const { count: totalTrades } = await supabase
        .from('trades')
        .select('*', { count: 'exact', head: true });

      // Fetch verified users
      const { count: verifiedUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('verified', true);

      // Fetch pending verifications
      const { count: pendingVerifications } = await supabase
        .from('verification_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Calculate platform volume (sum of all trade amounts)
      const { data: tradeVolume } = await supabase
        .from('trades')
        .select('price_eur')
        .eq('status', 'completed');

      const platformVolume = tradeVolume?.reduce((sum, trade) => sum + (trade.price_eur || 0), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        activeAds: activeAds || 0,
        pendingReports: pendingReports || 0,
        totalTrades: totalTrades || 0,
        platformVolume,
        verifiedUsers: verifiedUsers || 0,
        pendingVerifications: pendingVerifications || 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const fetchUsers = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          created_at,
          role,
          verified,
          banned,
          last_active
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchVerificationRequests = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          id,
          user_id,
          status,
          document_type,
          full_name,
          created_at
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVerificationRequests(data || []);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
    }
  };

  const promoteUserToAdmin = async (email: string) => {
    if (!isAdmin) return { error: 'Not authorized' };

    try {
      const { data, error } = await supabase.rpc('promote_to_admin', {
        target_email: email
      });

      if (error) throw error;
      
      // Refresh users list
      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error promoting user:', error);
      return { error: error.message };
    }
  };

  const approveVerification = async (requestId: string) => {
    if (!isAdmin) return { error: 'Not authorized' };

    try {
      const { error } = await supabase.rpc('update_verification_status', {
        p_request_id: requestId,
        p_status: 'approved',
        p_admin_notes: 'Approved by admin'
      });

      if (error) throw error;
      
      // Refresh verification requests
      await fetchVerificationRequests();
      return { success: true };
    } catch (error) {
      console.error('Error approving verification:', error);
      return { error: error.message };
    }
  };

  const rejectVerification = async (requestId: string, reason: string) => {
    if (!isAdmin) return { error: 'Not authorized' };

    try {
      const { error } = await supabase.rpc('update_verification_status', {
        p_request_id: requestId,
        p_status: 'rejected',
        p_admin_notes: reason
      });

      if (error) throw error;
      
      // Refresh verification requests
      await fetchVerificationRequests();
      return { success: true };
    } catch (error) {
      console.error('Error rejecting verification:', error);
      return { error: error.message };
    }
  };

  const banUser = async (userId: string) => {
    if (!isAdmin) return { error: 'Not authorized' };

    try {
      const { error } = await supabase
        .from('users')
        .update({ banned: true })
        .eq('id', userId);

      if (error) throw error;
      
      // Refresh users list
      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error banning user:', error);
      return { error: error.message };
    }
  };

  useEffect(() => {
    if (isAdmin) {
      Promise.all([
        fetchAdminStats(),
        fetchUsers(),
        fetchVerificationRequests()
      ]).finally(() => setLoading(false));
    }
  }, [isAdmin]);

  return {
    stats,
    users,
    verificationRequests,
    loading,
    promoteUserToAdmin,
    approveVerification,
    rejectVerification,
    banUser,
    refetch: () => {
      fetchAdminStats();
      fetchUsers();
      fetchVerificationRequests();
    }
  };
};