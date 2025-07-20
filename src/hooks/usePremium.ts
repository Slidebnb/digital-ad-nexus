import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface PremiumSubscription {
  id: string;
  plan_type: string;
  status: string;
  expires_at: string;
  features: any; // JSON from database
}

interface PremiumPlan {
  id: string;
  name: string;
  description: string;
  price_sol: number;
  price_eur: number;
  duration_days: number;
  features: any; // JSON from database
  benefits: string[];
  popular: boolean;
}

export function usePremium() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPremium, setIsPremium] = useState(false);
  const [subscription, setSubscription] = useState<PremiumSubscription | null>(null);
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
      loadPremiumPlans();
    }
  }, [user]);

  const checkPremiumStatus = async () => {
    if (!user) return;

    try {
      console.log('🔍 Checking premium status...');
      
      const { data, error } = await supabase
        .from('premium_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ Error checking premium status:', error);
        return;
      }

      if (data && data.length > 0) {
        const activeSubscription = data[0];
        setIsPremium(true);
        setSubscription(activeSubscription);
        console.log('✅ Premium status: ACTIVE', activeSubscription.plan_type);
      } else {
        setIsPremium(false);
        setSubscription(null);
        console.log('📅 Premium status: INACTIVE');
      }
    } catch (error) {
      console.error('❌ Error in checkPremiumStatus:', error);
    }
  };

  const loadPremiumPlans = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading premium plans...');

      const { data, error } = await supabase
        .from('premium_plans')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (error) {
        console.error('❌ Error loading premium plans:', error);
        return;
      }

      setPlans(data || []);
      console.log('✅ Premium plans loaded:', data?.length);
    } catch (error) {
      console.error('❌ Error in loadPremiumPlans:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPremiumPayment = async (planId: string, walletAddress: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('💳 Creating premium payment...', { planId, walletAddress });

      const { data, error } = await supabase.functions.invoke('create-premium-payment', {
        body: { planId, walletAddress }
      });

      if (error) {
        console.error('❌ Payment creation error:', error);
        throw new Error(error.message || 'Payment creation failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Payment creation failed');
      }

      console.log('✅ Payment created successfully:', data.payment);
      return data.payment;
    } catch (error) {
      console.error('❌ Error in createPremiumPayment:', error);
      throw error;
    }
  };

  const verifyPremiumPayment = async (subscriptionId: string, transactionSignature: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('✅ Verifying premium payment...', { subscriptionId, transactionSignature });

      const { data, error } = await supabase.functions.invoke('verify-premium-payment', {
        body: { subscriptionId, transactionSignature }
      });

      if (error) {
        console.error('❌ Payment verification error:', error);
        throw new Error(error.message || 'Payment verification failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Payment verification failed');
      }

      console.log('🎉 Payment verified successfully!');
      
      // Refresh premium status
      await checkPremiumStatus();
      
      toast({
        title: "Premium aktiviert! 🎉",
        description: "Dein Premium-Abonnement ist jetzt aktiv!",
      });

      return data.subscription;
    } catch (error) {
      console.error('❌ Error in verifyPremiumPayment:', error);
      throw error;
    }
  };

  const hasFeature = (feature: string): boolean => {
    if (!isPremium || !subscription) return false;
    
    try {
      const features = Array.isArray(subscription.features) 
        ? subscription.features 
        : JSON.parse(subscription.features as any);
      return features.includes(feature);
    } catch {
      return false;
    }
  };

  const getDaysRemaining = (): number => {
    if (!subscription) return 0;
    
    const expiresAt = new Date(subscription.expires_at);
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  return {
    isPremium,
    subscription,
    plans,
    loading,
    checkPremiumStatus,
    loadPremiumPlans,
    createPremiumPayment,
    verifyPremiumPayment,
    hasFeature,
    getDaysRemaining,
    // Premium feature flags
    features: {
      prioritySupport: hasFeature('priority_support'),
      unlimitedAds: hasFeature('unlimited_ads'),
      advancedAnalytics: hasFeature('advanced_analytics'),
      premiumBadge: hasFeature('premium_badge'),
      boostDiscount: hasFeature('boost_discount'),
      earlyAccess: hasFeature('early_access'),
      vipFeatures: hasFeature('vip_features'),
    }
  };
}