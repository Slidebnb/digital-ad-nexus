import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserPresence {
  user_id: string;
  status: 'online' | 'away' | 'offline';
  last_seen: string;
  activity: string;
}

export function useUserPresence() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Record<string, UserPresence>>({});
  const [userCount, setUserCount] = useState(0);

  const updatePresence = async (status: 'online' | 'away' | 'offline', activity = 'browsing') => {
    if (!user?.id) return;

    const presenceData = {
      user_id: user.id,
      status,
      last_seen: new Date().toISOString(),
      activity
    };

    try {
      const channel = supabase.channel('online-users');
      await channel.track(presenceData);
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  const setActivity = (activity: string) => {
    if (user?.id && onlineUsers[user.id]) {
      updatePresence(onlineUsers[user.id].status, activity);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const users: Record<string, UserPresence> = {};
        
        Object.keys(newState).forEach(key => {
          const presences = newState[key] as any[];
          if (presences.length > 0 && presences[0].user_id) {
            users[key] = presences[0] as UserPresence;
          }
        });
        
        setOnlineUsers(users);
        setUserCount(Object.keys(users).length);
        console.log('Online users updated:', users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await updatePresence('online', 'browsing');
        }
      });

    // Update presence when user becomes active/inactive
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away');
      } else {
        updatePresence('online');
      }
    };

    const handleBeforeUnload = () => {
      updatePresence('offline');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Periodic presence update
    const presenceInterval = setInterval(() => {
      if (!document.hidden) {
        updatePresence('online');
      }
    }, 30000); // Every 30 seconds

    return () => {
      updatePresence('offline');
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(presenceInterval);
    };
  }, [user?.id]);

  const getUserStatus = (userId: string): 'online' | 'away' | 'offline' => {
    const userData = onlineUsers[userId];
    if (!userData) return 'offline';
    
    const lastSeen = new Date(userData.last_seen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
    
    if (diffMinutes > 5) return 'offline';
    if (diffMinutes > 2) return 'away';
    return 'online';
  };

  return {
    onlineUsers,
    userCount,
    updatePresence,
    setActivity,
    getUserStatus,
    isUserOnline: (userId: string) => getUserStatus(userId) === 'online'
  };
}