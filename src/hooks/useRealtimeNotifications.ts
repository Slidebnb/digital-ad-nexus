import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    // Mock implementation for now since notifications table doesn't exist yet
    setNotifications([]);
    setUnreadCount(0);
    setLoading(false);
  };

  const markAsRead = async (notificationId: string) => {
    // Mock implementation
    console.log('Mark as read:', notificationId);
  };

  const markAllAsRead = async () => {
    // Mock implementation
    setUnreadCount(0);
  };

  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    
    // Mock realtime updates for crypto payments
    const interval = setInterval(() => {
      // Simulate random notifications for demonstration
      if (Math.random() > 0.95) { // 5% chance every 5 seconds
        const mockNotification: Notification = {
          id: Date.now().toString(),
          user_id: user.id,
          type: 'payment_update',
          title: 'Crypto-Zahlung bestätigt',
          message: 'Ihre SOL-Zahlung wurde erfolgreich verarbeitet.',
          read: false,
          created_at: new Date().toISOString()
        };
        
        setNotifications(prev => [mockNotification, ...prev.slice(0, 19)]);
        setUnreadCount(prev => prev + 1);
        
        toast({
          title: mockNotification.title,
          description: mockNotification.message,
          duration: 5000,
        });
      }
    }, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, [user, toast]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
}