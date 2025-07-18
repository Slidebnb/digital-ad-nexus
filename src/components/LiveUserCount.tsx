import { Users, Wifi } from 'lucide-react';
import { useUserPresence } from '@/hooks/useUserPresence';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function LiveUserCount() {
  const { userCount, onlineUsers } = useUserPresence();

  // Nur anzeigen wenn tatsächlich Nutzer online sind
  if (userCount === 0) {
    return null;
  }

  return (
    <Card className="border-success/20 bg-success/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Wifi className="h-4 w-4 text-success" />
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-success rounded-full animate-pulse" />
            </div>
            <span className="text-sm font-medium">LIVE</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {userCount} {userCount === 1 ? 'Nutzer' : 'Nutzer'} online
            </span>
          </div>
          
          <Badge variant="secondary" className="ml-auto">
            Echtzeit
          </Badge>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          Aktive Nutzer browsen die Plattform
        </div>
      </CardContent>
    </Card>
  );
}