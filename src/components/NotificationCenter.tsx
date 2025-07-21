
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, MessageSquare, TrendingUp, AlertTriangle, CheckCircle, X, Zap, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'message' | 'boost_completed' | 'premium_activated' | 'ad_view' | 'verification' | 'system';
  title: string;
  content: string;
  read: boolean;
  created_at: string;
  metadata?: any;
}

export function NotificationCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Defensive State-Initialisierung
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRealNotifications();
      setupRealtimeSubscription();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRealNotifications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const realNotifications: Notification[] = [];

      // Defensive Abfrage - Hole neue Nachrichten als Benachrichtigungen
      try {
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            read_at,
            conversation_id,
            conversations!inner(recipient_id)
          `)
          .eq('conversations.recipient_id', user.id)
          .is('read_at', null)
          .order('created_at', { ascending: false })
          .limit(10);

        if (messagesError) {
          console.warn('Fehler beim Laden der Nachrichten:', messagesError);
        } else if (messages) {
          messages.forEach(message => {
            realNotifications.push({
              id: `msg_${message.id}`,
              type: 'message',
              title: 'Neue Nachricht',
              content: `Sie haben eine neue Nachricht erhalten: "${(message.content || '').slice(0, 50)}..."`,
              read: false,
              created_at: message.created_at,
              metadata: { messageId: message.id, conversationId: message.conversation_id }
            });
          });
        }
      } catch (error) {
        console.warn('Nachrichten konnten nicht geladen werden:', error);
      }

      // Defensive Abfrage - Hole bestätigte Crypto-Payments als Benachrichtigungen
      try {
        const { data: payments, error: paymentsError } = await supabase
          .from('crypto_payments')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'confirmed')
          .order('confirmed_at', { ascending: false })
          .limit(5);

        if (paymentsError) {
          console.warn('Fehler beim Laden der Zahlungen:', paymentsError);
        } else if (payments) {
          payments.forEach(payment => {
            const isBoost = payment.payment_type === 'boost';
            const isPremium = payment.payment_type === 'premium';
            
            realNotifications.push({
              id: `payment_${payment.id}`,
              type: isBoost ? 'boost_completed' : 'premium_activated',
              title: isBoost ? 'Boost aktiviert' : 'Premium aktiviert',
              content: isBoost 
                ? `Ihr Anzeigen-Boost wurde erfolgreich aktiviert (${payment.amount_eur || 0}€)`
                : `Ihr Premium-Account wurde aktiviert (${payment.amount_eur || 0}€)`,
              read: true, // Da diese schon länger her sind
              created_at: payment.confirmed_at || payment.created_at,
              metadata: { paymentId: payment.id, amount: payment.amount_eur }
            });
          });
        }
      } catch (error) {
        console.warn('Zahlungen konnten nicht geladen werden:', error);
      }

      // Defensive Abfrage - Hole Views für User's Ads als Benachrichtigungen
      try {
        const { data: userAds, error: adsError } = await supabase
          .from('ads')
          .select('id, title, views, updated_at')
          .eq('user_id', user.id)
          .gt('views', 0)
          .order('updated_at', { ascending: false })
          .limit(3);

        if (adsError) {
          console.warn('Fehler beim Laden der Anzeigen:', adsError);
        } else if (userAds) {
          userAds.forEach(ad => {
            if (ad.views && ad.views > 0) {
              realNotifications.push({
                id: `views_${ad.id}`,
                type: 'ad_view',
                title: 'Neue Aufrufe',
                content: `Ihre Anzeige "${ad.title || 'Unbekannt'}" wurde ${ad.views} mal angesehen`,
                read: true,
                created_at: ad.updated_at,
                metadata: { adId: ad.id, views: ad.views }
              });
            }
          });
        }
      } catch (error) {
        console.warn('Anzeigen konnten nicht geladen werden:', error);
      }

      // Sortiere alle Benachrichtigungen nach Datum
      realNotifications.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications(realNotifications);
      setUnreadCount(realNotifications.filter(n => !n.read).length);

    } catch (error) {
      console.error('Fehler beim Laden der Benachrichtigungen:', error);
      setError('Benachrichtigungen konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    try {
      // Höre auf neue Nachrichten
      const messageChannel = supabase
        .channel('new_messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversations.recipient_id=eq.${user.id}`
          },
          () => {
            fetchRealNotifications(); // Aktualisiere Benachrichtigungen
          }
        )
        .subscribe();

      // Höre auf bestätigte Zahlungen
      const paymentChannel = supabase
        .channel('confirmed_payments')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'crypto_payments',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (payload.new.status === 'confirmed') {
              fetchRealNotifications();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messageChannel);
        supabase.removeChannel(paymentChannel);
      };
    } catch (error) {
      console.warn('Realtime-Subscription konnte nicht eingerichtet werden:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4 text-primary" />;
      case 'boost_completed':
        return <Zap className="h-4 w-4 text-warning" />;
      case 'premium_activated':
        return <Star className="h-4 w-4 text-warning" />;
      case 'ad_view':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'verification':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'system':
        return <AlertTriangle className="h-4 w-4 text-info" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => {
      const notification = notifications.find(n => n.id === id);
      return notification && !notification.read ? prev - 1 : prev;
    });
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 60) {
        return `vor ${diffInMinutes} Min`;
      } else if (diffInMinutes < 1440) {
        return `vor ${Math.floor(diffInMinutes / 60)} Std`;
      } else {
        return `vor ${Math.floor(diffInMinutes / 1440)} Tag(en)`;
      }
    } catch (error) {
      return 'Unbekannt';
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Sie müssen angemeldet sein, um Benachrichtigungen zu sehen.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Lade Benachrichtigungen...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              onClick={fetchRealNotifications} 
              className="mt-4"
            >
              Erneut versuchen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Benachrichtigungen
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Alle als gelesen markieren
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Benachrichtigungen vorhanden</p>
              <p className="text-xs mt-2">Benachrichtigungen erscheinen hier wenn:</p>
              <ul className="text-xs mt-1 space-y-1">
                <li>• Sie neue Nachrichten erhalten</li>
                <li>• Ihre Boost-Zahlungen bestätigt werden</li>
                <li>• Premium-Abonnements aktiviert werden</li>
                <li>• Ihre Anzeigen angesehen werden</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-all hover:bg-muted/50 ${
                    !notification.read ? 'bg-primary/5 border-primary/20' : 'bg-background'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-medium ${
                          !notification.read ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className={`text-sm ${
                        !notification.read ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {notification.content}
                      </p>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-6 text-xs"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Als gelesen markieren
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
