
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CryptoPayment {
  id: string;
  user_id: string;
  amount_crypto: number;
  amount_eur: number;
  cryptocurrency: string;
  status: string;
  payment_type: string;
  wallet_address: string;
  transaction_hash?: string;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  boost_package_id?: number;
  ad_id?: string;
}

export function useCryptoPaymentsRealtime() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<CryptoPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      const { data, error } = await supabase
        .from('crypto_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setPayments(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payments';
      console.error('Crypto payments fetch error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchPayments();
    
    // Set up realtime subscription for user's crypto payments
    const channel = supabase
      .channel('user-crypto-payments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crypto_payments',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Crypto payment update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newPayment = payload.new as CryptoPayment;
            setPayments(prev => [newPayment, ...prev.slice(0, 49)]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedPayment = payload.new as CryptoPayment;
            setPayments(prev => 
              prev.map(p => p.id === updatedPayment.id ? updatedPayment : p)
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedPayment = payload.old as CryptoPayment;
            setPayments(prev => prev.filter(p => p.id !== deletedPayment.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Crypto payments realtime status:', status);
        if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to crypto payments');
          setError('Realtime connection failed');
        }
      });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getPendingPayments = () => payments.filter(p => p.status === 'pending');
  const getConfirmedPayments = () => payments.filter(p => p.status === 'confirmed');
  const getFailedPayments = () => payments.filter(p => p.status === 'failed');

  const getTotalVolume = () => payments
    .filter(p => p.status === 'confirmed')
    .reduce((sum, p) => sum + p.amount_eur, 0);

  return {
    payments,
    loading,
    error,
    refetch: fetchPayments,
    getPendingPayments,
    getConfirmedPayments,
    getFailedPayments,
    getTotalVolume
  };
}
