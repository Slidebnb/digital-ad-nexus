import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, X } from 'lucide-react';
import { usePWANotifications } from '@/hooks/usePWA';
import { useAuth } from '@/hooks/useAuth';

export function NotificationPermissionPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);
  const { isSupported, permission, requestPermission } = usePWANotifications();
  const { user } = useAuth();

  useEffect(() => {
    // Show prompt only if:
    // - User is logged in
    // - Notifications are supported
    // - Permission not yet granted or denied
    // - Haven't prompted before in this session
    if (user && isSupported && permission === 'default' && !hasPrompted) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [user, isSupported, permission, hasPrompted]);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    setHasPrompted(true);
    setIsVisible(false);
    
    if (granted) {
      console.log('Notification permission granted');
    }
  };

  const handleDismiss = () => {
    setHasPrompted(true);
    setIsVisible(false);
  };

  if (!isVisible || !user || !isSupported || permission !== 'default') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-primary/20 bg-card/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm">Benachrichtigungen</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-xs mb-3">
            Aktiviere Push-Benachrichtigungen für neue Nachrichten, Preisalarme und wichtige Updates.
          </CardDescription>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={handleDismiss}
            >
              Später
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1 text-xs"
              onClick={handleRequestPermission}
            >
              Aktivieren
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}