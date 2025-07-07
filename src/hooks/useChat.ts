import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Conversation = Tables<'conversations'> & {
  other_user?: {
    full_name: string | null;
    avatar_url: string | null;
    user_id: string;
  };
  unread_count?: number;
};

type Message = Tables<'messages'> & {
  sender_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
};

export const useChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversationState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    } else {
      setConversations([]);
      setMessages([]);
      setActiveConversationState(null);
    }
  }, [user?.id]);

  // Real-time subscription for conversations
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`
        },
        (payload) => {
          console.log('Conversation change:', payload);
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Message change:', payload);
          if (activeConversation) {
            fetchMessages(activeConversation);
          }
          fetchConversations(); // Update last message
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, activeConversation]);

  const fetchConversations = async () => {
    if (!user?.id) return;
    
    try {
      // Get conversations
      const { data: conversationsData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (convError) throw convError;

      if (!conversationsData || conversationsData.length === 0) {
        setConversations([]);
        return;
      }

      // Get all unique user IDs
      const userIds = [...new Set(
        conversationsData.flatMap(conv => [conv.sender_id, conv.recipient_id])
      )].filter(id => id !== user.id);

      // Fetch profiles for other users
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
      }

      // Create profile map
      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      // Get unread counts for each conversation
      const conversationIds = conversationsData.map(conv => conv.id);
      const { data: unreadData } = await supabase
        .from('messages')
        .select('conversation_id')
        .in('conversation_id', conversationIds)
        .neq('sender_id', user.id)
        .is('read_at', null);

      const unreadCounts = new Map<string, number>();
      if (unreadData) {
        unreadData.forEach(msg => {
          const count = unreadCounts.get(msg.conversation_id) || 0;
          unreadCounts.set(msg.conversation_id, count + 1);
        });
      }

      // Enrich conversations with other user data and unread counts
      const enrichedConversations = conversationsData.map(conv => {
        const otherUserId = conv.sender_id === user.id ? conv.recipient_id : conv.sender_id;
        const otherUserProfile = profileMap.get(otherUserId);
        
        return {
          ...conv,
          other_user: otherUserProfile ? {
            ...otherUserProfile,
            user_id: otherUserId
          } : {
            full_name: 'Unbekannter Nutzer',
            avatar_url: null,
            user_id: otherUserId
          },
          unread_count: unreadCounts.get(conv.id) || 0
        };
      });

      setConversations(enrichedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Fehler beim Laden",
        description: "Konversationen konnten nicht geladen werden.",
        variant: "destructive"
      });
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!user?.id || !conversationId) return;
    
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(messagesData || []);

      // Mark messages as read
      await markAsRead(conversationId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const setActiveConversation = (conversationId: string | null) => {
    setActiveConversationState(conversationId);
    if (conversationId) {
      fetchMessages(conversationId);
    } else {
      setMessages([]);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user?.id || !activeConversation || !content.trim()) {
      return { error: 'Invalid parameters' };
    }

    setSending(true);
    try {
      // Insert message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversation,
          sender_id: user.id,
          content: content.trim(),
          message_type: 'text'
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Update conversation
      const { error: convUpdateError } = await supabase
        .from('conversations')
        .update({
          last_message: content.substring(0, 100),
          last_message_at: new Date().toISOString(),
          unread_by_recipient: true
        })
        .eq('id', activeConversation);

      if (convUpdateError) {
        console.error('Error updating conversation:', convUpdateError);
      }

      // Add message to current messages immediately
      setMessages(prev => [...prev, messageData]);

      toast({
        title: "Nachricht gesendet",
        description: "Ihre Nachricht wurde erfolgreich gesendet."
      });

      return { data: messageData };
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Fehler beim Senden",
        description: "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
      return { error };
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (!user?.id) return;
    
    try {
      // Mark all unread messages in this conversation as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);

      // Update conversation unread status
      await supabase
        .from('conversations')
        .update({ unread_by_recipient: false })
        .eq('id', conversationId)
        .eq('recipient_id', user.id);

    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const createConversation = async (recipientId: string, initialMessage?: string) => {
    if (!user?.id || user.id === recipientId) {
      return { error: 'Invalid recipient' };
    }
    
    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .maybeSingle();

      if (existing) {
        setActiveConversation(existing.id);
        return { data: existing };
      }

      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          last_message: initialMessage?.substring(0, 100) || null,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (convError) throw convError;

      // Send initial message if provided
      if (initialMessage) {
        await supabase
          .from('messages')
          .insert({
            conversation_id: newConv.id,
            sender_id: user.id,
            content: initialMessage,
            message_type: 'text'
          });
      }

      // Refresh conversations and set as active
      await fetchConversations();
      setActiveConversation(newConv.id);

      return { data: newConv };
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Fehler",
        description: "Konversation konnte nicht erstellt werden.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!user?.id) return { error: 'Not authenticated' };
    
    try {
      // Delete all messages in conversation
      await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      // Delete conversation
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (error) throw error;

      // Reset active conversation if it was deleted
      if (activeConversation === conversationId) {
        setActiveConversation(null);
      }

      // Refresh conversations
      fetchConversations();

      toast({
        title: "Konversation gelöscht",
        description: "Die Konversation wurde erfolgreich gelöscht."
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Fehler beim Löschen",
        description: "Die Konversation konnte nicht gelöscht werden.",
        variant: "destructive"
      });
      return { error };
    }
  };

  return {
    conversations,
    messages,
    activeConversation,
    loading,
    sending,
    setActiveConversation,
    sendMessage,
    markAsRead,
    createConversation,
    deleteConversation,
    fetchConversations,
    fetchMessages
  };
};