
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface PaymentStatus {
  id: string;
  status: 'pending' | 'processing' | 'confirmed' | 'failed';
  transaction_hash?: string;
  confirmed_at?: string;
}

export function usePaymentMonitoring(paymentId: string | null) {
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout>();

  const startMonitoring = () => {
    if (!paymentId || isMonitoring) return;
    
    setIsMonitoring(true);
    
    // Initial check
    checkPaymentStatus();
    
    // Set up real-time subscription
    const channel = supabase
      .channel(`payment-${paymentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'crypto_payments',
          filter: `id=eq.${paymentId}`
        },
        (payload) => {
          console.log('Payment update:', payload);
          const newPayment = payload.new as PaymentStatus;
          setPaymentStatus(newPayment);
          
          if (newPayment.status === 'confirmed') {
            toast({
              title: "Zahlung bestätigt!",
              description: "Ihre Transaktion wurde erfolgreich verarbeitet.",
            });
            stopMonitoring();
          } else if (newPayment.status === 'failed') {
            toast({
              title: "Zahlung fehlgeschlagen",
              description: "Bitte versuchen Sie es erneut.",
              variant: "destructive"
            });
            stopMonitoring();
          }
        }
      )
      .subscribe();

    // Fallback polling every 10 seconds
    pollingRef.current = setInterval(checkPaymentStatus, 10000);
    
    // Auto-stop after 30 minutes
    setTimeout(() => {
      if (isMonitoring) {
        stopMonitoring();
        toast({
          title: "Monitoring beendet",
          description: "Zahlungsüberwachung nach 30 Minuten beendet.",
          variant: "destructive"
        });
      }
    }, 30 * 60 * 1000);

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const checkPaymentStatus = async () => {
    if (!paymentId) return;
    
    try {
      const { data, error } = await supabase
        .from('crypto_payments')
        .select('id, status, transaction_hash, confirmed_at')
        .eq('id', paymentId)
        .single();

      if (error) throw error;
      
      setPaymentStatus(data);
      
      if (data.status === 'confirmed' || data.status === 'failed') {
        stopMonitoring();
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
  };

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, []);

  return {
    paymentStatus,
    isMonitoring,
    startMonitoring,
    stopMonitoring
  };
}
