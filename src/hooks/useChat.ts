import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Conversation = Tables<'conversations'> & {
  other_user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
};

type Message = Tables<'messages'>;

export const useChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setLoading(false);
      fetchConversations();
    }
  }, [user?.id]);

  const fetchConversations = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`*`)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user?.id || !activeConversation) return { error: 'No active conversation' };
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversation,
          sender_id: user.id,
          content: content.trim(),
          message_type: 'text'
        });

      if (error) throw error;
      fetchConversations();
      return { data };
    } catch (error) {
      console.error('Error sending message:', error);
      return { error };
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (!user?.id) return;
    try {
      await supabase
        .from('conversations')
        .update({ unread_by_recipient: false })
        .eq('id', conversationId)
        .eq('recipient_id', user.id);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const createConversation = async (recipientId: string) => {
    if (!user?.id) return { error: 'Not authenticated' };
    
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId
        });

      if (error) throw error;
      fetchConversations();
      return { data };
    } catch (error) {
      console.error('Error creating conversation:', error);
      return { error };
    }
  };

  return {
    conversations,
    messages,
    activeConversation,
    loading,
    setActiveConversation,
    sendMessage,
    markAsRead,
    createConversation,
    fetchConversations
  };
};