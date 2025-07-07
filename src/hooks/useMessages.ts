import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  read_at: string | null;
}

interface Conversation {
  id: string;
  sender_id: string;
  recipient_id: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_by_recipient: boolean;
}

export const useMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id]);

  const fetchConversations = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      setConversations(data || []);
      
      // Count unread messages where user is recipient
      const unread = data?.filter(conv => 
        conv.recipient_id === user.id && conv.unread_by_recipient
      ).length || 0;
      
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    conversations,
    unreadCount,
    loading,
    refetch: fetchConversations
  };
};