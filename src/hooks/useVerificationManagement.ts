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
  user_profile_name?: string;
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
    if (!isAdmin) {
      console.log('User is not admin, skipping verification requests fetch');
      return;
    }

    console.log('Fetching verification requests as admin...');

    try {
      setError(null);
      
      // Fetch verification requests first
      const { data: verificationData, error: verificationError } = await supabase
        .from('verification_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (verificationError) throw verificationError;

      // Then fetch user emails separately for each request
      const formattedRequests = await Promise.all(
        (verificationData || []).map(async (req: any) => {
          // Get user email from profiles or users table  
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, city')
            .eq('user_id', req.user_id)
            .single();
            
          // Try to get email from auth metadata or use a placeholder
          const userEmail = req.user_email || `user-${req.user_id.slice(0, 8)}@platform.local`;
          
          return {
            ...req,
            user_email: userEmail,
            user_city: profileData?.city || 'Nicht angegeben',
            user_profile_name: profileData?.full_name || req.full_name
          };
        })
      );

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
      // Find the request to get user details
      const request = requests.find(r => r.id === requestId);
      
      // Update verification request
      const { error } = await supabase.rpc('update_verification_status', {
        p_request_id: requestId,
        p_status: status,
        p_admin_notes: adminNotes || null
      });

      if (error) throw error;

      // Send status email to user (non-blocking)
      if (request) {
        setTimeout(async () => {
          try {
            await supabase.functions.invoke('send-verification-status-email', {
              body: {
                email: request.user_email,
                displayName: request.user_profile_name || request.full_name,
                status: status,
                adminNotes: adminNotes
              }
            });
            console.log(`Verification status email sent to ${request.user_email}`);
          } catch (emailError) {
            console.error('Verification status email error:', emailError);
          }
        }, 100);
      }

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