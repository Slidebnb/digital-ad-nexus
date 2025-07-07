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
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      
      // Fetch user profiles for conversations
      const conversations = conversationsData || [];
      const userIds = [...new Set(conversations.flatMap(conv => [conv.sender_id, conv.recipient_id]))];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      // Create a map of user profiles
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      // Add other_user information
      const enrichedConversations = conversations.map(conv => {
        const otherUserId = conv.sender_id === user.id ? conv.recipient_id : conv.sender_id;
        const otherUserProfile = profileMap.get(otherUserId);
        
        return {
          ...conv,
          other_user: otherUserProfile ? {
            full_name: otherUserProfile.full_name,
            avatar_url: otherUserProfile.avatar_url
          } : null
        };
      });
      
      setConversations(enrichedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Add fetchMessages function
  const fetchMessages = async (conversationId: string) => {
    if (!user?.id) return;
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

  // Update setActiveConversation to also fetch messages
  const handleSetActiveConversation = (conversationId: string | null) => {
    setActiveConversation(conversationId);
    if (conversationId) {
      fetchMessages(conversationId);
    } else {
      setMessages([]);
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
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update the conversation's last message
      await supabase
        .from('conversations')
        .update({
          last_message: content.substring(0, 100),
          last_message_at: new Date().toISOString(),
          unread_by_recipient: true
        })
        .eq('id', activeConversation);

      // Add message to current messages
      setMessages(prev => [...prev, data]);
      
      // Refresh conversations list
      fetchConversations();
      
      toast({
        title: "Nachricht gesendet",
        description: "Ihre Nachricht wurde erfolgreich gesendet."
      });
      
      return { data };
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Fehler beim Senden",
        description: "Die Nachricht konnte nicht gesendet werden.",
        variant: "destructive"
      });
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
    setActiveConversation: handleSetActiveConversation,
    sendMessage,
    markAsRead,
    createConversation,
    fetchConversations,
    fetchMessages
  };
};