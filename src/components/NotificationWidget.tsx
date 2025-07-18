import { Card, CardContent } from '@/components/ui/card';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const notifications = [
  {
    type: 'success',
    icon: CheckCircle,
    message: 'Krypto-Preise erfolgreich aktualisiert',
    time: 'vor 2 Min',
    color: 'text-green-600'
  },
  {
    type: 'info',
    icon: Info,
    message: 'Neue Sicherheitsfeatures verfügbar',
    time: 'vor 1 Std',
    color: 'text-blue-600'
  },
  {
    type: 'warning',
    icon: AlertCircle,
    message: 'Markt-Volatilität erhöht',
    time: 'vor 3 Std',
    color: 'text-amber-600'
  }
];

export function NotificationWidget() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <Bell className="h-4 w-4 text-primary" />
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
          </div>
          <span className="text-sm font-semibold">Updates</span>
          <Badge variant="secondary" className="ml-auto text-xs">
            {notifications.length}
          </Badge>
        </div>
        
        <div className="space-y-2">
          {notifications.slice(0, 2).map((notification, index) => {
            const IconComponent = notification.icon;
            return (
              <div key={index} className="flex items-start gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                <IconComponent className={`h-3 w-3 mt-0.5 ${notification.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notification.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}