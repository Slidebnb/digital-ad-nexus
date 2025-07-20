
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface UseAutomaticPaymentProcessingProps {
  paymentId: string | null;
  blockchain: string;
  amount: number;
  walletAddress: string;
}

export function useAutomaticPaymentProcessing({
  paymentId,
  blockchain,
  amount,
  walletAddress
}: UseAutomaticPaymentProcessingProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const startProcessing = async () => {
    if (!paymentId || status !== 'idle') return;

    setStatus('processing');
    
    try {
      // Initial delay to allow user to make payment
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds
      
      // Start periodic processing attempts
      intervalRef.current = setInterval(async () => {
        await triggerProcessing();
      }, 15000); // Every 15 seconds

      // Also trigger immediate processing
      await triggerProcessing();
      
    } catch (error) {
      console.error('Error starting payment processing:', error);
      setStatus('failed');
    }
  };

  const triggerProcessing = async () => {
    if (!paymentId) return;

    try {
      const { data, error } = await supabase.functions.invoke('crypto-payment-processor', {
        body: {
          paymentId,
          blockchain,
          amount,
          walletAddress
        }
      });

      if (error) {
        console.error('Processing error:', error);
        return;
      }

      if (data?.success && data?.status === 'confirmed') {
        setStatus('completed');
        setTransactionHash(data.transactionHash);
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        toast({
          title: "Zahlung bestätigt!",
          description: "Ihre Transaktion wurde erfolgreich verarbeitet.",
        });
      }
    } catch (error) {
      console.error('Failed to trigger payment processing:', error);
    }
  };

  const stopProcessing = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setStatus('idle');
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    status,
    transactionHash,
    startProcessing,
    stopProcessing
  };
}
