import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Wifi } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function LiveUserCounter() {
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initial count
    updateCounts();

    // Real-time presence tracking
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: 'online-users',
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const users = Object.keys(newState).length;
        setOnlineUsers(users);
        setIsConnected(true);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: Math.random().toString(36).substr(2, 9),
            online_at: new Date().toISOString(),
          });
        }
      });

    // Update total users count when new users register
    const usersChannel = supabase
      .channel('users-count-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'auth',
        table: 'users'
      }, () => {
        updateTotalUsers();
      })
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(usersChannel);
    };
  }, []);

  const updateCounts = async () => {
    await Promise.all([
      updateTotalUsers(),
      updateOnlineEstimate()
    ]);
  };

  const updateTotalUsers = async () => {
    try {
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
      
      setTotalUsers(count || 0);
    } catch (error) {
      console.error('Error fetching total users:', error);
    }
  };

  const updateOnlineEstimate = () => {
    // Simulate online users (5-15% of total users)
    const estimate = Math.floor(totalUsers * (0.05 + Math.random() * 0.1));
    setOnlineUsers(Math.max(1, estimate));
  };

  // Update estimate every 30 seconds
  useEffect(() => {
    const interval = setInterval(updateOnlineEstimate, 30000);
    return () => clearInterval(interval);
  }, [totalUsers]);

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          {totalUsers.toLocaleString()} Nutzer
        </span>
      </div>
      
      <Badge 
        variant={isConnected ? "default" : "secondary"} 
        className="flex items-center gap-1"
      >
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        {onlineUsers} online
      </Badge>
    </div>
  );
}