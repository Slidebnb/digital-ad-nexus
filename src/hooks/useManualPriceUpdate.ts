import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useManualPriceUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePrices = async () => {
    setIsUpdating(true);
    setError(null);

    try {
      console.log('Updating crypto prices manually...');
      
      const { data, error } = await supabase.functions.invoke('crypto-price-updater', {
        body: {},
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        throw error;
      }

      console.log('Crypto prices updated successfully:', data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update prices';
      setError(errorMessage);
      console.error('Error updating prices:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updatePrices,
    isUpdating,
    error,
  };
}