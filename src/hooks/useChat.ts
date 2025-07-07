import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Conversation {
  id: string;
  sender_id: string;
  recipient_id: string;
  last_message: string | null;
  last_message_at: string;
  unread_by_recipient: boolean;
  created_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  read_at: string | null;
  created_at: string;
}

export function useChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Fehler",
        description: "Unterhaltungen konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Fetch messages for conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

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
      toast({
        title: "Fehler",
        description: "Nachrichten konnten nicht geladen werden.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Start or get conversation
  const startConversation = useCallback(async (recipientId: string) => {
    if (!user) return null;

    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .single();

      if (existingConversation) {
        return existingConversation.id;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchConversations();
      return data.id;
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Fehler",
        description: "Unterhaltung konnte nicht gestartet werden.",
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast, fetchConversations]);

  // Send message
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) throw error;

      // Mark conversation as unread for recipient
      await supabase
        .from('conversations')
        .update({ unread_by_recipient: true })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Fehler",
        description: "Nachricht konnte nicht gesendet werden.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .is('read_at', null);

      await supabase
        .from('conversations')
        .update({ unread_by_recipient: false })
        .eq('id', conversationId)
        .eq('recipient_id', user.id);

    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [user]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `sender_id=eq.${user.id},recipient_id=eq.${user.id}`
      }, () => {
        fetchConversations();
      })
      .subscribe();

    const messagesChannel = supabase
      .channel('messages-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        if (payload.new.conversation_id === activeConversationId) {
          fetchMessages(activeConversationId);
        }
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user, activeConversationId, fetchConversations, fetchMessages]);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
      markAsRead(activeConversationId);
    }
  }, [activeConversationId, fetchMessages, markAsRead]);

  return {
    conversations,
    messages,
    loading,
    activeConversationId,
    setActiveConversationId,
    startConversation,
    sendMessage,
    markAsRead,
    fetchConversations
  };
}