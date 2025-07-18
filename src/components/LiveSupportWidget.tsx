import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function LiveSupportWidget() {
  return (
    <Card className="border-green-200 bg-green-50 dark:bg-green-950/10 dark:border-green-800">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <MessageCircle className="h-4 w-4 text-green-600" />
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <span className="text-sm font-semibold text-green-800 dark:text-green-200">
            Live Support
          </span>
          <Badge variant="secondary" className="ml-auto text-xs bg-green-100 text-green-800">
            Online
          </Badge>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
            <Clock className="h-3 w-3" />
            <span>Durchschnittlich &lt;2min Antwortzeit</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
            <Users className="h-3 w-3" />
            <span>3 Support-Agents verfügbar</span>
          </div>
        </div>
        
        <Button size="sm" className="w-full h-7 text-xs bg-green-600 hover:bg-green-700">
          Chat starten
        </Button>
      </CardContent>
    </Card>
  );
}