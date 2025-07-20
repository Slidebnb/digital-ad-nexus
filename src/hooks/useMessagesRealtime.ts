
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger, measurePerformance, retryWithBackoff } from '@/utils/logger';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at?: string;
  conversation_id: string;
}

export const useMessagesRealtime = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to prevent unnecessary effect reruns
  const channelRef = useRef<any>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const result = await measurePerformance(async () => {
        // Get user's conversations first
        const { data: conversations, error: convError } = await supabase
          .from('conversations')
          .select('id')
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

        if (convError) throw convError;

        if (!conversations || conversations.length === 0) {
          return { messages: [], unreadCount: 0 };
        }

        const conversationIds = conversations.map(c => c.id);

        // Get recent messages with pagination
        const { data: messagesData, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false })
          .limit(50);

        if (msgError) throw msgError;

        // Calculate unread count efficiently
        const unreadMessages = messagesData?.filter(msg => 
          msg.sender_id !== user.id && !msg.read_at
        ) || [];

        return {
          messages: messagesData || [],
          unreadCount: unreadMessages.length
        };
      }, 'fetchMessages', 'useMessagesRealtime');

      setMessages(result.messages);
      setUnreadCount(result.unreadCount);
      setError(null);
      lastFetchTimeRef.current = Date.now();

      logger.debug('Messages fetched successfully', 'useMessagesRealtime', {
        messageCount: result.messages.length,
        unreadCount: result.unreadCount,
        userId: user.id
      });

    } catch (error) {
      logger.error('Failed to fetch messages', 'useMessagesRealtime', { 
        error: error.message,
        userId: user.id 
      });
      setError('Nachrichten konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchMessagesWithRetry = useCallback(() => {
    return retryWithBackoff(fetchMessages, 3, 1000, 'useMessagesRealtime');
  }, [fetchMessages]);

  useEffect(() => {
    if (!user?.id) {
      setMessages([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchMessagesWithRetry();

    // Set up realtime subscription
    const setupRealtimeSubscription = () => {
      // Clean up existing channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      channelRef.current = supabase
        .channel('messages-realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages'
        }, (payload) => {
          logger.debug('Realtime message update', 'useMessagesRealtime', { 
            event: payload.eventType,
            messageId: (payload.new as any)?.id || (payload.old as any)?.id
          });

          // Debounce rapid updates
          const now = Date.now();
          if (now - lastFetchTimeRef.current < 1000) {
            return;
          }

          // Refresh messages after realtime update
          fetchMessagesWithRetry();
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'conversations'
        }, (payload) => {
          logger.debug('Realtime conversation update', 'useMessagesRealtime', { 
            event: payload.eventType,
            conversationId: (payload.new as any)?.id || (payload.old as any)?.id
          });

          // Refresh messages when conversations change
          fetchMessagesWithRetry();
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            logger.info('Realtime subscription active', 'useMessagesRealtime');
          } else if (status === 'CHANNEL_ERROR') {
            logger.error('Realtime subscription error', 'useMessagesRealtime');
            // Retry subscription after delay
            setTimeout(setupRealtimeSubscription, 5000);
          }
        });
    };

    setupRealtimeSubscription();

    // Set up periodic refresh as fallback
    fetchIntervalRef.current = setInterval(() => {
      fetchMessagesWithRetry();
    }, 30000); // 30 seconds

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
    };
  }, [user?.id, fetchMessagesWithRetry]);

  const markAsRead = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      await measurePerformance(async () => {
        const { error } = await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('id', messageId)
          .neq('sender_id', user.id);

        if (error) throw error;
      }, 'markAsRead', 'useMessagesRealtime');

      // Update local state optimistically
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, read_at: new Date().toISOString() }
          : msg
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));

      logger.debug('Message marked as read', 'useMessagesRealtime', { messageId });

    } catch (error) {
      logger.error('Failed to mark message as read', 'useMessagesRealtime', { 
        error: error.message,
        messageId 
      });
    }
  }, [user?.id]);

  const refetch = useCallback(() => {
    return fetchMessagesWithRetry();
  }, [fetchMessagesWithRetry]);

  return {
    messages,
    unreadCount,
    loading,
    error,
    markAsRead,
    refetch
  };
};
