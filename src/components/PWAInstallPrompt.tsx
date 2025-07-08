import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Smartphone, Bell, Check, X, Zap, Shield, Wifi } from "lucide-react";
import { usePWAInstall, usePWANotifications } from "@/hooks/usePWA";
import { useToast } from "@/hooks/use-toast";

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const { isSupported, permission, requestPermission } = usePWANotifications();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

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
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">App erfolgreich installiert</p>
                <p className="text-sm text-green-600 dark:text-green-400">KryptoAnzeigen.de läuft jetzt nativ auf Ihrem Gerät.</p>
              </div>
            </div>
            {permission === 'granted' && (
              <Badge variant="secondary" className="text-xs">
                <Bell className="h-3 w-3 mr-1" />
                Push aktiv
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isInstallable) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-purple-50/50 dark:via-purple-950/50 to-blue-50/30 dark:to-blue-950/30 dark:from-primary/10 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-primary/5 pointer-events-none" />
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <Smartphone className="h-4 w-4 text-primary" />
            </div>
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent font-bold">
              Native App verfügbar
            </span>
            <div className="flex gap-1">
              <Badge variant="secondary" className="text-xs">PWA</Badge>
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Schnell
              </Badge>
            </div>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-primary"
          >
            {isExpanded ? 'Weniger' : 'Mehr'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 relative">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Installieren Sie KryptoAnzeigen.de als native App für ein optimales Erlebnis:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
              <Zap className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Blitzschneller Start</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
              <Wifi className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Offline verfügbar</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
              <Shield className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Native Sicherheit</span>
            </div>
          </div>

          {isExpanded && (
            <Alert className="bg-primary/5 border-primary/20">
              <Bell className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Erweiterte Features:</strong> Push-Benachrichtigungen für neue Anzeigen, 
                Homescreen-Shortcuts, native Sharing-Funktionen und hardwarebeschleunigte Performance.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleInstall}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex-1 sm:flex-none"
          >
            <Download className="h-4 w-4" />
            Jetzt installieren
          </Button>
          
          {isSupported && permission === 'default' && (
            <Button 
              variant="outline"
              onClick={handleNotificationPermission}
              className="flex items-center gap-2 border-primary/30 hover:bg-primary/5 flex-1 sm:flex-none"
            >
              <Bell className="h-4 w-4" />
              Push-Benachrichtigungen
            </Button>
          )}
          
          {permission === 'granted' && (
            <Badge variant="outline" className="self-center text-green-600 border-green-200">
              <Check className="h-3 w-3 mr-1" />
              Benachrichtigungen aktiv
            </Badge>
          )}
        </div>

        {permission === 'denied' && (
          <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <X className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-700 dark:text-amber-300">
              <strong>Benachrichtigungen blockiert:</strong> Sie können Push-Benachrichtigungen 
              in Ihren Browser-Einstellungen aktivieren, um über neue Anzeigen informiert zu werden.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground pt-3 border-t border-border/50 space-y-1">
          <p className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <strong>DSGVO-konform:</strong> Alle Daten bleiben sicher auf Ihrem Gerät gespeichert.
          </p>
          <p className="text-muted-foreground/80">
            Native Performance • Offline-First • Keine Tracking-Cookies
          </p>
        </div>
      </CardContent>
    </Card>
  );
}