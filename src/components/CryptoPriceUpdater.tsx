import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function CryptoPriceUpdater() {
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const updatePrices = async () => {
      setIsUpdating(true);
      try {
        console.log('Triggering crypto price update...');
        
        const { data, error } = await supabase.functions.invoke('crypto-price-updater', {
          body: {},
        });

        if (error) {
          console.error('Error updating crypto prices:', error);
        } else {
          console.log('Crypto prices updated successfully:', data);
        }
      } catch (err) {
        console.error('Failed to update crypto prices:', err);
      } finally {
        setIsUpdating(false);
      }
    };

    // Trigger update on component mount
    updatePrices();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-background/90 backdrop-blur-sm border rounded-lg p-2 text-xs text-muted-foreground">
      {isUpdating ? 'Updating crypto prices...' : 'Crypto prices updated'}
    </div>
  );
}