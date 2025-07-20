import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, MessageSquare, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  type: 'message' | 'ad' | 'security' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export function EnhancedNotificationSystem() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    // Real-time Subscriptions für verschiedene Events
    const messagesChannel = supabase
      .channel('notification-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=in.(${getMyConversationIds().join(',')})`
      }, (payload) => {
        if (payload.new.sender_id !== user.id) {
          showNotification({
            type: 'message',
            title: 'Neue Nachricht',
            message: 'Du hast eine neue Nachricht erhalten',
            icon: MessageSquare
          });
        }
      })
      .subscribe();

    const adsChannel = supabase
      .channel('notification-ads')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'ads',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (payload.new.status === 'approved') {
          showNotification({
            type: 'ad',
            title: 'Anzeige genehmigt',
            message: 'Deine Anzeige wurde erfolgreich genehmigt',
            icon: TrendingUp
          });
        }
      })
      .subscribe();

    const securityChannel = supabase
      .channel('notification-security')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'admin_logs',
        filter: `target_id=eq.${user.id}`
      }, (payload) => {
        if (payload.new.action.includes('security') || payload.new.action.includes('ban')) {
          showNotification({
            type: 'security',
            title: 'Sicherheitshinweis',
            message: 'Es gab eine wichtige Aktivität in deinem Konto',
            icon: Shield
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(adsChannel);
      supabase.removeChannel(securityChannel);
    };
  }, [user]);

  const getMyConversationIds = (): string[] => {
    // This would be replaced with actual data from a hook
    return [];
  };

  const showNotification = ({ type, title, message, icon: Icon }: {
    type: 'message' | 'ad' | 'security' | 'system';
    title: string;
    message: string;
    icon: any;
  }) => {
    const notificationId = Date.now().toString();

    toast(title, {
      description: message,
      icon: <Icon className="h-4 w-4" />,
      duration: 5000,
      action: {
        label: 'Anzeigen',
        onClick: () => handleNotificationClick(type)
      }
    });

    // Add to internal notifications list
    const newNotification: Notification = {
      id: notificationId,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep last 10

    // Request browser notification permission if not granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  };

  const handleNotificationClick = (type: string) => {
    switch (type) {
      case 'message':
        window.location.href = '/dashboard?tab=messages';
        break;
      case 'ad':
        window.location.href = '/dashboard?tab=ads';
        break;
      case 'security':
        window.location.href = '/dashboard?tab=security';
        break;
      default:
        window.location.href = '/dashboard';
    }
  };

  // System-wide notifications (price changes, maintenance, etc.)
  useEffect(() => {
    const systemChannel = supabase
      .channel('system-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'system_health'
      }, (payload) => {
        if (payload.new.status === 'critical') {
          showNotification({
            type: 'system',
            title: 'System-Wartung',
            message: 'Es können kurzzeitig Störungen auftreten',
            icon: AlertTriangle
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(systemChannel);
    };
  }, []);

  // Auto-clear old notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => 
        prev.filter(n => Date.now() - n.timestamp.getTime() < 24 * 60 * 60 * 1000)
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return null; // This component only manages notifications, no UI
}