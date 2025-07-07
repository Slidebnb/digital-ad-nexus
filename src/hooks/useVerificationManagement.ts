import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface VerificationRequest {
  id: string;
  user_id: string;
  full_name: string;
  document_type: string;
  document_front_url?: string;
  document_back_url?: string;
  selfie_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_city?: string;
}

interface VerificationStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export const useVerificationManagement = () => {
  const { isAdmin } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [stats, setStats] = useState<VerificationStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVerificationRequests = async () => {
    if (!isAdmin) return;

    try {
      setError(null);
      
      // Fetch all verification requests with user data
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          *,
          users!verification_requests_user_id_fkey (
            email,
            profiles!users_id_fkey (
              city,
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRequests = (data || []).map((req: any) => ({
        ...req,
        user_email: req.users?.email,
        user_city: req.users?.profiles?.[0]?.city,
        user_profile_name: req.users?.profiles?.[0]?.full_name
      }));

      setRequests(formattedRequests);

      // Calculate stats
      const newStats = {
        pending: formattedRequests.filter(r => r.status === 'pending').length,
        approved: formattedRequests.filter(r => r.status === 'approved').length,
        rejected: formattedRequests.filter(r => r.status === 'rejected').length,
        total: formattedRequests.length
      };
      setStats(newStats);

    } catch (error) {
      console.error('Error fetching verification requests:', error);
      setError('Fehler beim Laden der Verifizierungsanfragen');
    } finally {
      setLoading(false);
    }
  };

  const processVerification = async (requestId: string, status: 'approved' | 'rejected', adminNotes?: string) => {
    if (!isAdmin) return { error: 'Nicht autorisiert' };

    try {
      // Update verification request
      const { error } = await supabase.rpc('update_verification_status', {
        p_request_id: requestId,
        p_status: status,
        p_admin_notes: adminNotes || null
      });

      if (error) throw error;

      // Log the verification decision
      console.log(`Verification ${status} for request ${requestId}`);

      // Refresh data
      await fetchVerificationRequests();
      
      return { success: true };
    } catch (error) {
      console.error('Error processing verification:', error);
      return { error: error.message };
    }
  };

  const approveVerification = async (requestId: string) => {
    return await processVerification(requestId, 'approved');
  };

  const rejectVerification = async (requestId: string, reason: string) => {
    return await processVerification(requestId, 'rejected', reason);
  };

  // Real-time updates
  useEffect(() => {
    if (!isAdmin) return;

    fetchVerificationRequests();

    const channel = supabase
      .channel('verification-requests')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'verification_requests' 
      }, () => {
        fetchVerificationRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  return {
    requests,
    stats,
    loading,
    error,
    approveVerification,
    rejectVerification,
    refetch: fetchVerificationRequests
  };
};