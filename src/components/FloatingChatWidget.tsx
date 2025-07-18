import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  const quickMessages = [
    "Wie funktioniert die Plattform?",
    "Ist der Handel sicher?",
    "Welche Gebühren fallen an?",
    "Wie verifiziere ich mich?"
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 group"
        >
          <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80">
      <Card className="shadow-2xl border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live Support
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              Hallo! 👋 Womit können wir dir helfen?
            </p>
          </div>
          
          <div className="space-y-2">
            {quickMessages.map((msg, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full text-xs justify-start h-8"
                onClick={() => setMessage(msg)}
              >
                {msg}
              </Button>
            ))}
          </div>
          
          {user ? (
            <div className="flex gap-2">
              <Input
                placeholder="Nachricht schreiben..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="text-sm"
              />
              <Button size="sm" className="px-3">
                <Send className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Melde dich an für direkten Support
              </p>
              <Button asChild size="sm" className="w-full">
                <Link to="/login">Anmelden</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}