import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface CryptoPayment {
  id?: string;
  user_id: string;
  payment_type: string;
  amount_crypto: number;
  amount_eur: number;
  cryptocurrency: string;
  exchange_rate: number;
  wallet_address: string;
  transaction_hash?: string | null;
  blockchain_network: string;
  status: string;
  ad_id?: string | null;
  boost_package_id?: number | null;
  subscription_id?: string | null;
  metadata?: Json;
  expires_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  confirmation_count?: number;
  confirmed_at?: string | null;
  payment_transactions?: any[];
}

export function useCryptoPayments() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<CryptoPayment[]>([]);

  // Create new crypto payment
  const createPayment = async (paymentData: Omit<CryptoPayment, 'id' | 'user_id' | 'status'>): Promise<string | null> => {
    if (!user?.id) {
      toast({
        title: "Authentifizierung erforderlich",
        description: "Bitte melden Sie sich an um eine Zahlung zu erstellen.",
        variant: "destructive"
      });
      return null;
    }

    try {
      setLoading(true);

      const payment: Omit<CryptoPayment, 'id'> = {
        ...paymentData,
        user_id: user.id,
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes expiry
      };

      const { data, error } = await supabase
        .from('crypto_payments')
        .insert(payment)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Zahlung erstellt",
        description: `${paymentData.cryptocurrency} Zahlung wurde initialisiert`,
      });

      return data.id;
    } catch (error) {
      toast({
        title: "Fehler bei Zahlung",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update payment status
  const updatePaymentStatus = async (
    paymentId: string, 
    status: CryptoPayment['status'],
    transactionHash?: string
  ): Promise<boolean> => {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (transactionHash) {
        updateData.transaction_hash = transactionHash;
      }

      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('crypto_payments')
        .update(updateData)
        .eq('id', paymentId);

      if (error) throw error;

      // Create payment transaction record
      if (transactionHash) {
        await supabase
          .from('payment_transactions')
          .insert({
            crypto_payment_id: paymentId,
            transaction_hash: transactionHash,
            blockchain_status: status === 'confirmed' ? 'confirmed' : 'pending'
          });
      }

      return true;
    } catch (error) {
      console.error('Failed to update payment status:', error);
      return false;
    }
  };

  // Process boost payment
  const processBoostPayment = async (
    adId: string,
    packageId: number,
    cryptocurrency: string,
    walletAddress: string,
    amountCrypto: number,
    amountEur: number,
    exchangeRate: number
  ): Promise<string | null> => {
    const paymentId = await createPayment({
      payment_type: 'boost',
      amount_crypto: amountCrypto,
      amount_eur: amountEur,
      cryptocurrency,
      exchange_rate: exchangeRate,
      wallet_address: walletAddress,
      blockchain_network: getBlockchainNetwork(cryptocurrency),
      ad_id: adId,
      boost_package_id: packageId,
      metadata: {
        boost_type: 'paid',
        payment_method: 'crypto'
      }
    });

    if (paymentId) {
      // Simulate payment processing (in real app, integrate with actual blockchain)
      setTimeout(async () => {
        const success = await simulateBlockchainTransaction(cryptocurrency);
        if (success) {
          await updatePaymentStatus(paymentId, 'confirmed', generateMockTxHash());
          await processBoostActivation(adId, packageId);
        } else {
          await updatePaymentStatus(paymentId, 'failed');
        }
      }, 3000);
    }

    return paymentId;
  };

  // Process premium subscription payment
  const processPremiumPayment = async (
    subscriptionId: string,
    planType: string,
    cryptocurrency: string,
    walletAddress: string,
    amountCrypto: number,
    amountEur: number,
    exchangeRate: number
  ): Promise<string | null> => {
    const paymentId = await createPayment({
      payment_type: 'premium',
      amount_crypto: amountCrypto,
      amount_eur: amountEur,
      cryptocurrency,
      exchange_rate: exchangeRate,
      wallet_address: walletAddress,
      blockchain_network: getBlockchainNetwork(cryptocurrency),
      subscription_id: subscriptionId,
      metadata: {
        plan_type: planType,
        payment_method: 'crypto'
      }
    });

    if (paymentId) {
      setTimeout(async () => {
        const success = await simulateBlockchainTransaction(cryptocurrency);
        if (success) {
          await updatePaymentStatus(paymentId, 'confirmed', generateMockTxHash());
          await activatePremiumSubscription(subscriptionId);
        } else {
          await updatePaymentStatus(paymentId, 'failed');
        }
      }, 3000);
    }

    return paymentId;
  };

  // Fetch user's payment history
  const fetchPayments = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('crypto_payments')
        .select(`
          *,
          payment_transactions(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
  }, [user?.id]);

  // Helper functions
  const getBlockchainNetwork = (crypto: string): string => {
    switch (crypto) {
      case 'SOL': return 'solana-mainnet';
      case 'BTC': return 'bitcoin-mainnet';
      case 'ETH': return 'ethereum-mainnet';
      default: return 'unknown';
    }
  };

  const simulateBlockchainTransaction = async (crypto: string): Promise<boolean> => {
    // Simulate network delay and 95% success rate
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(Math.random() > 0.05);
      }, 2000 + Math.random() * 3000);
    });
  };

  const generateMockTxHash = (): string => {
    return '0x' + Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  const processBoostActivation = async (adId: string, packageId: number) => {
    try {
      // Get package duration
      const { data: packageData } = await supabase
        .from('boost_packages')
        .select('duration_days')
        .eq('id', packageId)
        .single();

      if (packageData) {
        const boostEnd = new Date();
        boostEnd.setDate(boostEnd.getDate() + packageData.duration_days);

        // Update ad boost
        await supabase
          .from('ads')
          .update({ 
            boosted_until: boostEnd.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', adId);

        // Create boost record
        await supabase
          .from('boosts')
          .insert({
            user_id: user!.id,
            ad_id: adId,
            boost_type: 'paid',
            boost_start: new Date().toISOString(),
            boost_end: boostEnd.toISOString()
          });

        toast({
          title: "Boost aktiviert!",
          description: `Ihre Anzeige wurde für ${packageData.duration_days} Tage geboostet.`,
        });
      }
    } catch (error) {
      console.error('Failed to activate boost:', error);
    }
  };

  const activatePremiumSubscription = async (subscriptionId: string) => {
    try {
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          payment_method: 'crypto',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      toast({
        title: "Premium aktiviert!",
        description: "Ihr Premium-Abonnement wurde erfolgreich aktiviert.",
      });
    } catch (error) {
      console.error('Failed to activate premium:', error);
    }
  };

  return {
    loading,
    payments,
    createPayment,
    updatePaymentStatus,
    processBoostPayment,
    processPremiumPayment,
    fetchPayments
  };
}