import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useMessagesRealtime } from "@/hooks/useMessagesRealtime";
import { useAuth } from "@/hooks/useAuth";
import {
  MessageCircle,
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Clock,
  AlertCircle
} from "lucide-react";

export function ModernMessageSystem() {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    unreadCount,
    loading,
    typingUsers,
    sendMessage,
    markAsRead,
    subscribeToConversation,
    fetchMessages
  } = useMessagesRealtime();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeConversationId]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    if (activeConversationId) {
      fetchMessages(activeConversationId);
      unsubscribe = subscribeToConversation(activeConversationId);
      markAsRead(activeConversationId);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeConversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;

    try {
      await sendMessage(activeConversationId, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getOtherUserFromConversation = (conversation: any) => {
    if (!user) return null;
    return conversation.sender_id === user.id 
      ? conversation.profiles_recipient 
      : conversation.profiles_sender;
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    
    if (diffHours < 1) {
      return `vor ${Math.floor(diffHours * 60)} Min`;
    } else if (diffHours < 24) {
      return date.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit', 
        minute: '2-digit'
      });
    }
  };

  const getMessageStatus = (message: any) => {
    if (message.sender_id !== user?.id) return null;
    
    if (message.read_at) {
      return <CheckCheck className="h-3 w-3 text-primary" />;
    } else {
      return <Check className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];
  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherUserFromConversation(conv);
    const userName = otherUser?.full_name || otherUser?.email || 'Unbekannter Nutzer';
    return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           conv.last_message?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <Card className="h-[600px] gradient-card">
        <CardContent className="p-6 flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[700px] gradient-card overflow-hidden">
      <div className="flex h-full">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Nachrichten
              </CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Konversationen suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </CardHeader>
          
          <ScrollArea className="flex-1 px-4 pb-4">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  Keine Konversationen gefunden
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conversation) => {
                  const otherUser = getOtherUserFromConversation(conversation);
                  const isActive = conversation.id === activeConversationId;
                  const hasUnread = conversation.unread_by_recipient && 
                                   conversation.recipient_id === user?.id;

                  return (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-accent/50 ${
                        isActive ? 'bg-accent border border-primary/20' : ''
                      }`}
                      onClick={() => setActiveConversationId(conversation.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={otherUser?.avatar_url || ""} />
                            <AvatarFallback className="text-xs">
                              {otherUser?.full_name?.[0] || otherUser?.email?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          {hasUnread && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-medium truncate ${
                              hasUnread ? 'font-semibold' : ''
                            }`}>
                              {otherUser?.full_name || otherUser?.email || 'Unbekannter Nutzer'}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(conversation.last_message_at || conversation.created_at)}
                            </span>
                          </div>
                          <p className={`text-xs truncate ${
                            hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'
                          }`}>
                            {conversation.last_message || 'Neue Konversation'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getOtherUserFromConversation(activeConversation)?.avatar_url || ""} />
                      <AvatarFallback>
                        {getOtherUserFromConversation(activeConversation)?.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {getOtherUserFromConversation(activeConversation)?.full_name || 'Unbekannter Nutzer'}
                      </h3>
                      {typingUsers[activeConversationId] && typingUsers[activeConversationId].length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Schreibt...
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {activeMessages.map((message, index) => {
                    const isOwn = message.sender_id === user?.id;
                    const showTime = index === 0 || 
                      new Date(message.created_at).getTime() - 
                      new Date(activeMessages[index - 1].created_at).getTime() > 300000; // 5 minutes

                    return (
                      <div key={message.id}>
                        {showTime && (
                          <div className="text-center mb-4">
                            <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full">
                              {formatMessageTime(message.created_at)}
                            </span>
                          </div>
                        )}
                        
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
                            <div className={`p-3 rounded-lg ${
                              isOwn 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}>
                              <p className="text-sm break-words">{message.content}</p>
                              <div className={`flex items-center gap-1 mt-1 ${
                                isOwn ? 'justify-end' : 'justify-start'
                              }`}>
                                <span className={`text-xs ${
                                  isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                }`}>
                                  {new Date(message.created_at).toLocaleTimeString('de-DE', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {isOwn && getMessageStatus(message)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Nachricht schreiben..."
                      className="pr-10"
                    />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Wählen Sie eine Konversation</h3>
                <p className="text-muted-foreground">
                  Klicken Sie auf eine Konversation, um Nachrichten zu sehen
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}