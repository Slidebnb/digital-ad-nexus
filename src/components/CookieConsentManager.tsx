import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Cookie, Settings, Shield, Eye, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CookieCategory {
  id: string;
  name: string;
  description: string;
  essential: boolean;
  enabled: boolean;
  cookies: string[];
}

export function CookieConsentManager() {
  const { toast } = useToast();
  const [showBanner, setShowBanner] = useState(false);
  const [categories, setCategories] = useState<CookieCategory[]>([
    {
      id: 'essential',
      name: 'Notwendige Cookies',
      description: 'Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.',
      essential: true,
      enabled: true,
      cookies: ['session_id', 'csrf_token', 'auth_token']
    },
    {
      id: 'functional',
      name: 'Funktionale Cookies',
      description: 'Diese Cookies ermöglichen erweiterte Funktionen und Personalisierung.',
      essential: false,
      enabled: false,
      cookies: ['theme_preference', 'language_setting', 'sidebar_state']
    },
    {
      id: 'analytics',
      name: 'Analyse Cookies',
      description: 'Diese Cookies helfen uns zu verstehen, wie Sie unsere Website nutzen.',
      essential: false,
      enabled: false,
      cookies: ['google_analytics', 'user_tracking', 'page_views']
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      description: 'Diese Cookies werden für Werbung und Marketing-Zwecke verwendet.',
      essential: false,
      enabled: false,
      cookies: ['ad_tracking', 'conversion_tracking', 'personalized_ads']
    }
  ]);

  useEffect(() => {
    // Prüfe ob bereits eine Cookie-Einverständnis vorhanden ist
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Zeige Banner nach 2 Sekunden
      setTimeout(() => setShowBanner(true), 2000);
    } else {
      // Lade gespeicherte Einstellungen
      try {
        const savedPreferences = JSON.parse(consent);
        setCategories(prev => 
          prev.map(cat => ({
            ...cat,
            enabled: savedPreferences[cat.id] !== false
          }))
        );
      } catch (error) {
        console.error('Error loading cookie preferences:', error);
      }
    }
  }, []);

  const savePreferences = (preferences?: Record<string, boolean>) => {
    const prefs = preferences || categories.reduce((acc, cat) => {
      acc[cat.id] = cat.enabled;
      return acc;
    }, {} as Record<string, boolean>);

    localStorage.setItem('cookie_consent', JSON.stringify(prefs));
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    
    setShowBanner(false);
    
    toast({
      title: "Cookie-Einstellungen gespeichert",
      description: "Ihre Cookie-Präferenzen wurden erfolgreich gespeichert.",
    });
  };

  const acceptAll = () => {
    const allAccepted = categories.reduce((acc, cat) => {
      acc[cat.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setCategories(prev => prev.map(cat => ({ ...cat, enabled: true })));
    savePreferences(allAccepted);
  };

  const acceptEssentialOnly = () => {
    const essentialOnly = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.essential;
      return acc;
    }, {} as Record<string, boolean>);
    
    setCategories(prev => 
      prev.map(cat => ({ ...cat, enabled: cat.essential }))
    );
    savePreferences(essentialOnly);
  };

  const toggleCategory = (categoryId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId && !cat.essential
          ? { ...cat, enabled: !cat.enabled }
          : cat
      )
    );
  };

  const CookieBanner = () => {
    if (!showBanner) return null;

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50 p-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Cookie className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Cookie-Einstellungen</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Wir verwenden Cookies, um Ihre Erfahrung zu verbessern und unsere Website zu optimieren. 
                Sie können Ihre Präferenzen anpassen oder alle Cookies akzeptieren.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Einstellungen
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Cookie className="h-5 w-5" />
                      Cookie-Einstellungen
                    </DialogTitle>
                  </DialogHeader>
                  <CookieSettingsContent />
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm" onClick={acceptEssentialOnly}>
                Nur notwendige
              </Button>
              <Button size="sm" onClick={acceptAll}>
                Alle akzeptieren
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CookieSettingsContent = () => (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Sie können Ihre Cookie-Einstellungen jederzeit ändern. 
          Notwendige Cookies können nicht deaktiviert werden, da sie für die Grundfunktionen der Website erforderlich sind.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{category.name}</h4>
                    {category.essential && (
                      <Badge variant="secondary" className="text-xs">
                        Erforderlich
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {category.description}
                  </p>
                  
                  <details className="text-sm">
                    <summary className="cursor-pointer text-primary hover:underline">
                      Cookie-Details anzeigen
                    </summary>
                    <div className="mt-2 space-y-1">
                      {category.cookies.map((cookie) => (
                        <div key={cookie} className="text-xs text-muted-foreground">
                          • {cookie}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
                
                <Switch
                  checked={category.enabled}
                  onCheckedChange={() => toggleCategory(category.id)}
                  disabled={category.essential}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
        <Button variant="outline" onClick={acceptEssentialOnly} className="flex-1">
          Nur notwendige Cookies
        </Button>
        <Button onClick={() => savePreferences()} className="flex-1">
          Einstellungen speichern
        </Button>
        <Button onClick={acceptAll} className="flex-1">
          Alle akzeptieren
        </Button>
      </div>
    </div>
  );

  return (
    <CookieBanner />
  );
}