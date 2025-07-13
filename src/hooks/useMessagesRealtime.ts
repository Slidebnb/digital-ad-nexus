import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  read_at: string | null;
  message_type: string;
}

export interface ConversationWithProfile {
  id: string;
  sender_id: string;
  recipient_id: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_by_recipient: boolean;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

export function useMessagesRealtime() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationWithProfile[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});

  const fetchConversations = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      setConversations(data || []);
      
      // Count unread messages
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

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(prev => ({
        ...prev,
        [conversationId]: data || []
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user?.id) return;

    try {
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: 'text'
        });

      if (messageError) throw messageError;

      // Update conversation last_message
      const { error: convError } = await supabase
        .from('conversations')
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
          unread_by_recipient: true
        })
        .eq('id', conversationId);

      if (convError) throw convError;

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Fehler",
        description: "Nachricht konnte nicht gesendet werden.",
        variant: "destructive"
      });
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (!user?.id) return;

    try {
      // Mark conversation as read
      const { error: convError } = await supabase
        .from('conversations')
        .update({ unread_by_recipient: false })
        .eq('id', conversationId)
        .eq('recipient_id', user.id);

      if (convError) throw convError;

      // Mark all messages as read
      const { error: msgError } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .is('read_at', null);

      if (msgError) throw msgError;

    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const broadcastTyping = (conversationId: string, isTyping: boolean) => {
    if (!user?.id) return;

    const channel = supabase.channel(`conversation-${conversationId}`);
    
    if (isTyping) {
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: user.id, typing: true }
      });
    } else {
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: user.id, typing: false }
      });
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    fetchConversations();

    // Set up real-time subscription for conversations
    const conversationsChannel = supabase
      .channel('conversations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `sender_id=eq.${user.id},recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time conversation update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newConv = payload.new as ConversationWithProfile;
            setConversations(prev => [newConv, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedConv = payload.new as ConversationWithProfile;
            setConversations(prev => 
              prev.map(conv => conv.id === updatedConv.id ? updatedConv : conv)
            );
            
            // Show notification for new messages
            if (updatedConv.recipient_id === user.id && updatedConv.unread_by_recipient) {
              toast({
                title: "Neue Nachricht",
                description: updatedConv.last_message || "Sie haben eine neue Nachricht erhalten.",
                duration: 5000,
              });
              
              // Update unread count
              setUnreadCount(prev => prev + 1);
            }
          }
        }
      )
      .subscribe();

    // Set up real-time subscription for messages
    const messagesChannel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Real-time message update:', payload);
          
          const newMessage = payload.new as Message;
          setMessages(prev => ({
            ...prev,
            [newMessage.conversation_id]: [
              ...(prev[newMessage.conversation_id] || []),
              newMessage
            ]
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user?.id, toast]);

  // Set up typing indicators for active conversations
  const subscribeToConversation = (conversationId: string) => {
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, typing } = payload.payload;
        
        if (user_id !== user?.id) {
          setTypingUsers(prev => ({
            ...prev,
            [conversationId]: typing 
              ? [...(prev[conversationId] || []), user_id]
              : (prev[conversationId] || []).filter(id => id !== user_id)
          }));
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  return {
    conversations,
    messages,
    unreadCount,
    loading,
    typingUsers,
    refetch: fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
    broadcastTyping,
    subscribeToConversation
  };
}