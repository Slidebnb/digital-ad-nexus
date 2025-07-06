import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Send, 
  User,
  Clock
} from "lucide-react";

export function UserMessages() {
  // TODO: Load real messages from Supabase
  const conversations = [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Nachrichten</h2>
        <Badge variant="outline">
          {conversations.length} Konversationen
        </Badge>
      </div>

      {conversations.length === 0 ? (
        <Card className="gradient-card">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-semibold mb-2">Noch keine Nachrichten</h3>
            <p className="text-muted-foreground mb-4">
              Hier werden Ihre Unterhaltungen mit anderen Nutzern angezeigt, 
              sobald Sie eine Anzeige kontaktieren oder jemand Sie kontaktiert.
            </p>
            <Button variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Anzeigen durchsuchen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {/* Messages will be listed here */}
        </div>
      )}

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-base">💡 Tipp</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Das Realtime-Chat-System wird implementiert. Sie können dann direkt 
            mit Käufern und Verkäufern kommunizieren, ohne Ihre Kontaktdaten preisgeben zu müssen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}