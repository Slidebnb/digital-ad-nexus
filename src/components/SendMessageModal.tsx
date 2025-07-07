import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MessageCircle, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SendMessageModalProps {
  recipientId: string;
  recipientName: string;
  adTitle: string;
  adId: string;
}

export function SendMessageModal({ 
  recipientId, 
  recipientName, 
  adTitle, 
  adId 
}: SendMessageModalProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState(`Interesse an: ${adTitle}`);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!user || !message.trim()) return;

    setSending(true);
    try {
      // Erstelle oder finde Konversation
      let conversationId;
      
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .maybeSingle();

      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            sender_id: user.id,
            recipient_id: recipientId,
            last_message: message.substring(0, 100),
            last_message_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (convError) throw convError;
        conversationId = newConversation.id;
      }

      // Sende Nachricht
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: `**${subject}**\n\n${message}\n\n---\nBezogen auf Anzeige: ${adTitle}`,
          message_type: 'text'
        });

      if (messageError) throw messageError;

      // Update Konversation
      await supabase
        .from('conversations')
        .update({
          last_message: message.substring(0, 100),
          last_message_at: new Date().toISOString(),
          unread_by_recipient: true
        })
        .eq('id', conversationId);

      toast({
        title: "Nachricht gesendet",
        description: `Ihre Nachricht wurde an ${recipientName} gesendet.`
      });

      setMessage("");
      setSubject(`Interesse an: ${adTitle}`);
      setOpen(false);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Fehler beim Senden",
        description: "Die Nachricht konnte nicht gesendet werden.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <Button className="w-full" size="lg" onClick={() => window.location.href = '/login'}>
        <MessageCircle className="h-5 w-5 mr-2" />
        Anmelden um Nachricht zu senden
      </Button>
    );
  }

  if (user.id === recipientId) {
    return (
      <Button className="w-full" size="lg" disabled>
        <MessageCircle className="h-5 w-5 mr-2" />
        Eigene Anzeige
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <MessageCircle className="h-5 w-5 mr-2" />
          Nachricht senden
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nachricht an {recipientName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="subject">Betreff</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Betreff eingeben..."
            />
          </div>
          <div>
            <Label htmlFor="message">Nachricht</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ihre Nachricht eingeben..."
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sending}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Wird gesendet..." : "Senden"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={sending}
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}