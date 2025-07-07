import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Conversation = Tables<'conversations'>;
type Message = Tables<'messages'>;

export const useChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<(Conversation & {
    other_user?: {
      full_name?: string;
      avatar_url?: string;
    };
  })[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
      subscribeToMessages();
    }
  }, [activeConversation]);

  const fetchConversations = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          sender_profile:profiles!conversations_sender_id_fkey(full_name, avatar_url),
          recipient_profile:profiles!conversations_recipient_id_fkey(full_name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const conversationsWithOtherUser = data?.map(conv => ({
        ...conv,
        other_user: conv.sender_id === user.id 
          ? conv.recipient_profile 
          : conv.sender_profile
      })) || [];

      setConversations(conversationsWithOtherUser);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!activeConversation) return;

    const channel = supabase
      .channel(`messages:${activeConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversation}`
        },
        payload => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (content: string, recipientId?: string) => {
    if (!user?.id) return { error: 'Not authenticated' };

    let conversationId = activeConversation;

    // Create conversation if needed (for new chats)
    if (!conversationId && recipientId) {
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`
        )
        .single();

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            sender_id: user.id,
            recipient_id: recipientId,
            last_message: content,
            last_message_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        conversationId = newConv.id;
      }
    }

    if (!conversationId) return { error: 'No conversation' };

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation
      await supabase
        .from('conversations')
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
          unread_by_recipient: true
        })
        .eq('id', conversationId);

      return { data };
    } catch (error) {
      console.error('Error sending message:', error);
      return { error };
    }
  };

  const startConversation = async (recipientId: string, initialMessage: string) => {
    const result = await sendMessage(initialMessage, recipientId);
    if (!result.error) {
      await fetchConversations();
      toast({
        title: "Nachricht gesendet",
        description: "Ihre Nachricht wurde erfolgreich gesendet."
      });
    }
    return result;
  };

  const markAsRead = async (conversationId: string) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('conversations')
        .update({ unread_by_recipient: false })
        .eq('id', conversationId)
        .neq('sender_id', user.id);

      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .is('read_at', null)
        .neq('sender_id', user.id);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return {
    conversations,
    messages,
    activeConversation,
    loading,
    setActiveConversation,
    sendMessage,
    startConversation,
    markAsRead,
    refetch: fetchConversations
  };
};