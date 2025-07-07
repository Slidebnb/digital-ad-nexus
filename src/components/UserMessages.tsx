import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  User,
  Clock,
  Search,
  MoreVertical
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";

export function UserMessages() {
  const { user } = useAuth();
  const { 
    conversations, 
    loading, 
    setActiveConversationId, 
    startConversation 
  } = useChat();
  const [searchTerm, setSearchTerm] = useState("");

  const getOtherUserId = (conversation: any) => {
    if (!user) return null;
    return conversation.sender_id === user.id 
      ? conversation.recipient_id 
      : conversation.sender_id;
  };

  const filteredConversations = conversations.filter(conv =>
    conv.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-48 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Nachrichten</h2>
        <Badge variant="outline">
          {conversations.length} Konversationen
        </Badge>
      </div>

      {conversations.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Konversationen durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {filteredConversations.length === 0 && conversations.length === 0 ? (
        <Card className="gradient-card">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-semibold mb-2">Noch keine Nachrichten</h3>
            <p className="text-muted-foreground mb-4">
              Hier werden Ihre Unterhaltungen mit anderen Nutzern angezeigt, 
              sobald Sie eine Anzeige kontaktieren oder jemand Sie kontaktiert.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/browse'}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Anzeigen durchsuchen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredConversations.map((conv) => (
            <Card 
              key={conv.id} 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer gradient-card"
              onClick={() => setActiveConversationId(conv.id)}
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    U
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate">
                      Benutzer {getOtherUserId(conv)}
                    </h3>
                    <div className="flex items-center gap-2">
                      {conv.unread_by_recipient && conv.recipient_id === user?.id && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conv.last_message_at || conv.created_at || '')}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.last_message || 'Keine Nachrichten'}
                  </p>
                </div>
                
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredConversations.length === 0 && conversations.length > 0 && (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">Keine Ergebnisse gefunden</h3>
          <p className="text-muted-foreground">
            Versuchen Sie andere Suchbegriffe
          </p>
        </Card>
      )}
    </div>
  );
}