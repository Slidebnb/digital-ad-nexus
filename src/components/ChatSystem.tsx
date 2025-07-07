import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Send, 
  Users, 
  Clock, 
  Trash2, 
  MoreVertical,
  Check,
  CheckCheck
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ChatSystem() {
  const { user } = useAuth();
  const { 
    conversations, 
    messages, 
    loading,
    activeConversationId,
    setActiveConversationId,
    sendMessage
  } = useChat();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;

    const messageToSend = newMessage;
    setNewMessage(""); // Clear input immediately for better UX
    
    try {
      await sendMessage(activeConversationId, messageToSend);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setNewMessage(messageToSend); // Restore message on error
    }
  };


  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    
    if (diffHours < 1) {
      return 'Gerade eben';
    } else if (diffHours < 24) {
      return date.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit',
        year: '2-digit'
      });
    }
  };

  const getMessageStatus = (message: any) => {
    if (message.sender_id !== user?.id) return null;
    
    if (message.read_at) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    } else {
      return <Check className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const activeConversationData = conversations.find(conv => conv.id === activeConversationId);
  
  const getOtherUserId = (conversation: any) => {
    if (!user) return null;
    return conversation.sender_id === user.id 
      ? conversation.recipient_id 
      : conversation.sender_id;
  };

  if (loading) {
    return (
      <Card className="h-[600px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Nachrichten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4 h-full">
            <div className="h-full bg-muted rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0 pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Nachrichten
            {conversations.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {conversations.filter(c => c.unread_by_recipient && c.recipient_id === user?.id).length}
              </Badge>
            )}
          </div>
          {activeConversationData && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback>
                  U
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                Benutzer {getOtherUserId(activeConversationData)}
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex min-h-0 p-0">
        {/* Conversations List */}
        <div className="w-1/3 border-r bg-muted/20">
          <div className="p-3 border-b bg-background/50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Unterhaltungen ({conversations.length})
            </div>
          </div>
          
          <ScrollArea className="h-full">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium mb-1">Keine Unterhaltungen</p>
                <p className="text-xs">Senden Sie eine Nachricht über eine Anzeige</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      "group relative p-3 rounded-lg transition-all cursor-pointer border",
                      activeConversationId === conv.id 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'hover:bg-muted border-transparent'
                    )}
                    onClick={() => setActiveConversationId(conv.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback>
                            U
                          </AvatarFallback>
                        </Avatar>
                        {conv.unread_by_recipient && conv.recipient_id === user?.id && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                            !
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn(
                            "font-medium text-sm truncate",
                            conv.unread_by_recipient && conv.recipient_id === user?.id && activeConversationId !== conv.id && "font-bold"
                          )}>
                            Benutzer {getOtherUserId(conv)}
                          </span>
                        </div>
                        
                        <p className={cn(
                          "text-xs truncate mb-1",
                          activeConversationId === conv.id 
                            ? 'text-primary-foreground/80' 
                            : 'text-muted-foreground'
                        )}>
                          {conv.last_message || 'Keine Nachrichten'}
                        </p>
                        
                        <div className={cn(
                          "flex items-center gap-1 text-xs",
                          activeConversationId === conv.id 
                            ? 'text-primary-foreground/60' 
                            : 'text-muted-foreground'
                        )}>
                          <Clock className="h-3 w-3" />
                          {formatTime(conv.last_message_at || conv.created_at || '')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          {activeConversationId ? (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Noch keine Nachrichten</p>
                      <p className="text-xs">Schreiben Sie die erste Nachricht!</p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isOwn = message.sender_id === user?.id;
                      const showDate = index === 0 || 
                        new Date(messages[index - 1].created_at || '').toDateString() !== 
                        new Date(message.created_at || '').toDateString();
                      
                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <Separator className="flex-1" />
                              <span className="px-3 text-xs text-muted-foreground bg-background">
                                {new Date(message.created_at || '').toLocaleDateString('de-DE', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                              <Separator className="flex-1" />
                            </div>
                          )}
                          
                          <div className={cn(
                            "flex gap-3",
                            isOwn ? 'justify-end' : 'justify-start'
                          )}>
                            {!isOwn && (
                              <Avatar className="h-8 w-8 mt-1">
                                <AvatarImage src="" />
                                <AvatarFallback>
                                  U
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div className={cn(
                              "max-w-[70%] space-y-1",
                              isOwn && "items-end"
                            )}>
                              <div
                                className={cn(
                                  "rounded-2xl px-4 py-2 break-words",
                                  isOwn
                                    ? 'bg-primary text-primary-foreground rounded-br-md'
                                    : 'bg-muted rounded-bl-md'
                                )}
                              >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              </div>
                              
                              <div className={cn(
                                "flex items-center gap-1 px-2",
                                isOwn ? 'justify-end' : 'justify-start'
                              )}>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(message.created_at || '')}
                                </span>
                                {getMessageStatus(message)}
                              </div>
                            </div>
                            
                            {isOwn && (
                              <Avatar className="h-8 w-8 mt-1">
                                <AvatarImage src={user?.user_metadata?.avatar_url} />
                                <AvatarFallback>
                                  {user?.user_metadata?.display_name?.[0] || user?.email?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-background">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nachricht eingeben..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!newMessage.trim()}
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Drücken Sie Enter zum Senden • Shift+Enter für neue Zeile
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">Willkommen bei den Nachrichten</h3>
                <p className="text-muted-foreground mb-4">
                  Wählen Sie eine Unterhaltung aus, um zu chatten
                </p>
                <p className="text-sm text-muted-foreground">
                  Neue Unterhaltungen beginnen automatisch, wenn Sie über eine Anzeige Kontakt aufnehmen
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}