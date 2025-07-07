import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type PriceAlert = Tables<'price_alerts'>;

export const usePriceAlerts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAlerts();
    }
  }, [user?.id]);

  const fetchAlerts = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching price alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (alertData: {
    coin: string;
    target_price: number;
    condition: 'above' | 'below';
  }) => {
    if (!user?.id) return { error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .insert({
          user_id: user.id,
          ...alertData
        })
        .select()
        .single();

      if (error) throw error;
      
      setAlerts(prev => [data, ...prev]);
      toast({
        title: "Preisalarm erstellt",
        description: `Sie werden benachrichtigt, wenn ${alertData.coin} ${alertData.condition === 'above' ? 'über' : 'unter'} ${alertData.target_price}€ liegt.`
      });
      
      return { data };
    } catch (error) {
      console.error('Error creating price alert:', error);
      return { error };
    }
  };

  const deleteAlert = async (alertId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast({
        title: "Preisalarm gelöscht",
        description: "Der Preisalarm wurde erfolgreich entfernt."
      });
    } catch (error) {
      console.error('Error deleting price alert:', error);
      toast({
        title: "Fehler",
        description: "Preisalarm konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    }
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('price_alerts')
        .update({ is_active: isActive })
        .eq('id', alertId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_active: isActive } : alert
      ));
    } catch (error) {
      console.error('Error toggling price alert:', error);
    }
  };

  return {
    alerts,
    loading,
    createAlert,
    deleteAlert,
    toggleAlert,
    refetch: fetchAlerts
  };
};