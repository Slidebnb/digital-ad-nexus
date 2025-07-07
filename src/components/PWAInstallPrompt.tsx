import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Smartphone, Bell, Check, X } from "lucide-react";
import { usePWAInstall, usePWANotifications } from "@/hooks/usePWA";
import { useToast } from "@/hooks/use-toast";

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const { isSupported, permission, requestPermission } = usePWANotifications();
  const { toast } = useToast();

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      toast({
        title: "App installiert!",
        description: "KryptoAnzeigen.de wurde erfolgreich auf Ihrem Gerät installiert."
      });
    }
  };

  const handleNotificationPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast({
        title: "Benachrichtigungen aktiviert",
        description: "Sie erhalten jetzt Push-Benachrichtigungen für neue Anzeigen."
      });
    }
  };

  if (isInstalled) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">App installiert</p>
              <p className="text-sm text-green-600">KryptoAnzeigen.de läuft als App auf Ihrem Gerät.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isInstallable) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Smartphone className="h-5 w-5" />
          Mobile App verfügbar
          <Badge variant="secondary">PWA</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Installieren Sie KryptoAnzeigen.de als App für die beste Nutzererfahrung:
          </p>
          
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Schnellerer Zugriff vom Homescreen</li>
            <li>• Offline-Funktionalität</li>
            <li>• Push-Benachrichtigungen für neue Anzeigen</li>
            <li>• Optimiert für mobile Geräte</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleInstall}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            App installieren
          </Button>
          
          {isSupported && permission === 'default' && (
            <Button 
              variant="outline"
              onClick={handleNotificationPermission}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Benachrichtigungen erlauben
            </Button>
          )}
        </div>

        {permission === 'denied' && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <X className="h-4 w-4" />
            <span>Benachrichtigungen wurden blockiert. Sie können diese in den Browser-Einstellungen aktivieren.</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p>DSGVO-konform: Alle Daten bleiben lokal auf Ihrem Gerät gespeichert.</p>
        </div>
      </CardContent>
    </Card>
  );
}