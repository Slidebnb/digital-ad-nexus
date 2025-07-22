import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { usePWANotifications } from './usePWA';

export function useRealtimePushNotifications() {
  const { user } = useAuth();
  const { permission, showNotification } = usePWANotifications();

  useEffect(() => {
    if (!user || permission !== 'granted') return;

    console.log('Setting up realtime push notifications for user:', user.id);

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('push-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Check if this message is for the current user by checking conversations
          const { data: conversation } = await supabase
            .from('conversations')
            .select('recipient_id, sender_id')
            .eq('id', payload.new.conversation_id)
            .single();
          
          if (conversation && conversation.recipient_id === user.id) {
            await showNotification('Neue Nachricht', {
              body: 'Sie haben eine neue Nachricht erhalten',
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              tag: 'new-message',
              data: { type: 'message', conversationId: payload.new.conversation_id }
            });
          }
        }
      )
      .subscribe();

    // Subscribe to price alerts
    const priceAlertsChannel = supabase
      .channel('push-price-alerts')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'crypto_prices'
        },
        async (payload) => {
          console.log('Price update received:', payload);
          
          // Check if user has active price alerts for this coin
          const { data: alerts } = await supabase
            .from('price_alerts')
            .select('*')
            .eq('user_id', user.id)
            .eq('coin', payload.new.cryptocurrency)
            .eq('is_active', true);
          
          if (alerts && alerts.length > 0) {
            for (const alert of alerts) {
              const currentPrice = parseFloat(payload.new.price_eur);
              const targetPrice = parseFloat(alert.target_price.toString());
              
              let triggered = false;
              if (alert.condition === 'above' && currentPrice >= targetPrice) {
                triggered = true;
              } else if (alert.condition === 'below' && currentPrice <= targetPrice) {
                triggered = true;
              }
              
              if (triggered) {
                await showNotification('Preisalarm ausgelöst', {
                  body: `${alert.coin} hat ${targetPrice}€ ${alert.condition === 'above' ? 'erreicht' : 'unterschritten'}`,
                  icon: '/icon-192.png',
                  badge: '/icon-192.png',
                  tag: `price-alert-${alert.id}`,
                  data: { type: 'price-alert', coin: alert.coin, price: currentPrice.toString() }
                });
                
                // Mark alert as triggered
                await supabase
                  .from('price_alerts')
                  .update({ triggered_at: new Date().toISOString(), is_active: false })
                  .eq('id', alert.id);
              }
            }
          }
        }
      )
      .subscribe();

    // Subscribe to new ads in favorite categories
    const newAdsChannel = supabase
      .channel('push-new-ads')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ads'
        },
        async (payload) => {
          console.log('New ad created:', payload);
          
          // Get user's favorite categories from profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('favorite_categories')
            .eq('user_id', user.id)
            .single();
          
          if (profile?.favorite_categories && 
              profile.favorite_categories.includes(payload.new.category)) {
            await showNotification('Neue Anzeige in Ihrer Kategorie', {
              body: `Neue Anzeige: ${payload.new.title}`,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              tag: `new-ad-${payload.new.id}`,
              data: { type: 'new-ad', adId: payload.new.id }
            });
          }
        }
      )
      .subscribe();

    // Subscribe to crypto payment confirmations
    const paymentsChannel = supabase
      .channel('push-payments')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'crypto_payments'
        },
        async (payload) => {
          console.log('Payment update received:', payload);
          
          if (payload.new.user_id === user.id && 
              payload.old.status !== 'confirmed' && 
              payload.new.status === 'confirmed') {
            await showNotification('Zahlung bestätigt', {
              body: `Ihre ${payload.new.cryptocurrency} Zahlung wurde bestätigt`,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              tag: `payment-${payload.new.id}`,
              data: { type: 'payment', paymentId: payload.new.id }
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime push subscriptions');
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(priceAlertsChannel);
      supabase.removeChannel(newAdsChannel);
      supabase.removeChannel(paymentsChannel);
    };
  }, [user, permission, showNotification]);

  return null;
}