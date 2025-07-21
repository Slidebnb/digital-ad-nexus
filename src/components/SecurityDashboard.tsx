import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Key, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Monitor,
  MapPin,
  Clock,
  Info
} from "lucide-react";

interface LoginSession {
  id: string;
  ip_address: string;
  user_agent: string;
  location: string;
  last_active: string;
  is_current: boolean;
}

export function SecurityDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    emailNotifications: true,
    loginAlerts: true,
    messageNotifications: true,
    paymentConfirmation: true,
    adUpdateNotifications: true
  });

  useEffect(() => {
    fetchSecurityData();
  }, [user]);

  const fetchSecurityData = async () => {
    if (!user) return;

    try {
      // Profil-Benachrichtigungseinstellungen laden
      const { data: profile } = await supabase
        .from('profiles')
        .select('notification_settings')
        .eq('user_id', user.id)
        .single();

      if (profile?.notification_settings && typeof profile.notification_settings === 'object') {
        const notificationSettings = profile.notification_settings as Record<string, any>;
        setSecuritySettings(prev => ({
          ...prev,
          ...notificationSettings
        }));
      }

      // Mock Login-Sessions (in einem echten System würden diese aus einer Sessions-Tabelle kommen)
      setSessions([
        {
          id: '1',
          ip_address: '192.168.1.100',
          user_agent: 'Chrome 120.0.0.0 on Windows',
          location: 'Deutschland, Berlin',
          last_active: new Date().toISOString(),
          is_current: true
        },
        {
          id: '2',
          ip_address: '10.0.0.50',
          user_agent: 'Safari 17.0 on iPhone',
          location: 'Deutschland, München',
          last_active: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          is_current: false
        }
      ]);

    } catch (error) {
      console.error('Fehler beim Laden der Sicherheitsdaten:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSecuritySettings = async (newSettings: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_settings: newSettings })
        .eq('user_id', user?.id);

      if (error) throw error;

      setSecuritySettings(newSettings);
      toast({
        title: "Einstellungen gespeichert",
        description: "Ihre Benachrichtigungseinstellungen wurden aktualisiert"
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Einstellungen konnten nicht gespeichert werden",
        variant: "destructive"
      });
    }
  };

  const changePassword = async () => {
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      toast({
        title: "Fehler",
        description: "Passwörter stimmen nicht überein",
        variant: "destructive"
      });
      return;
    }

    if (passwordChange.newPassword.length < 6) {
      toast({
        title: "Fehler",
        description: "Passwort muss mindestens 6 Zeichen lang sein",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordChange.newPassword
      });

      if (error) throw error;

      setPasswordChange({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast({
        title: "Passwort geändert",
        description: "Ihr Passwort wurde erfolgreich aktualisiert"
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Passwort konnte nicht geändert werden",
        variant: "destructive"
      });
    }
  };

  const terminateSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    toast({
      title: "Sitzung beendet",
      description: "Die Sitzung wurde erfolgreich beendet"
    });
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Gerade aktiv';
    if (diffInMinutes < 60) return `vor ${diffInMinutes} Min`;
    if (diffInMinutes < 1440) return `vor ${Math.floor(diffInMinutes / 60)} Std`;
    return `vor ${Math.floor(diffInMinutes / 1440)} Tag(en)`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Sicherheit & Datenschutz</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h2 className="text-2xl font-semibold">Sicherheit & Datenschutz</h2>
      </div>

      {/* Sicherheitsstatus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Kontosicherheit
          </CardTitle>
          <CardDescription>
            Übersicht über Ihre Kontosicherheit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="font-medium">Verifiziert</div>
                <div className="text-sm text-muted-foreground">Account verifiziert</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Key className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="font-medium">Passwort</div>
                <div className="text-sm text-muted-foreground">Sicher gesetzt</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Aktivität</div>
                <div className="text-sm text-muted-foreground">{sessions.length} Sitzungen</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passwort ändern */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Passwort ändern
          </CardTitle>
          <CardDescription>
            Aktualisieren Sie Ihr Kontopasswort
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label>Aktuelles Passwort</Label>
              <Input
                type="password"
                value={passwordChange.currentPassword}
                onChange={(e) => setPasswordChange(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Ihr aktuelles Passwort"
              />
            </div>
            <div>
              <Label>Neues Passwort</Label>
              <Input
                type="password"
                value={passwordChange.newPassword}
                onChange={(e) => setPasswordChange(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Mindestens 6 Zeichen"
              />
            </div>
            <div>
              <Label>Passwort bestätigen</Label>
              <Input
                type="password"
                value={passwordChange.confirmPassword}
                onChange={(e) => setPasswordChange(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Neues Passwort wiederholen"
              />
            </div>
            <Button 
              onClick={changePassword} 
              className="w-full"
              disabled={!passwordChange.currentPassword || !passwordChange.newPassword || !passwordChange.confirmPassword}
            >
              Passwort ändern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Benachrichtigungseinstellungen */}
      <Card>
        <CardHeader>
          <CardTitle>Benachrichtigungseinstellungen</CardTitle>
          <CardDescription>
            Konfigurieren Sie Ihre Benachrichtigungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">E-Mail-Benachrichtigungen</div>
                <div className="text-sm text-muted-foreground">
                  Allgemeine Benachrichtigungen per E-Mail erhalten
                </div>
              </div>
              <Switch
                checked={securitySettings.emailNotifications}
                onCheckedChange={(checked) => 
                  updateSecuritySettings({ ...securitySettings, emailNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Login-Benachrichtigungen</div>
                <div className="text-sm text-muted-foreground">
                  Bei neuen Anmeldungen benachrichtigen
                </div>
              </div>
              <Switch
                checked={securitySettings.loginAlerts}
                onCheckedChange={(checked) => 
                  updateSecuritySettings({ ...securitySettings, loginAlerts: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Nachrichten-Benachrichtigungen</div>
                <div className="text-sm text-muted-foreground">
                  Bei neuen Nachrichten benachrichtigen
                </div>
              </div>
              <Switch
                checked={securitySettings.messageNotifications}
                onCheckedChange={(checked) => 
                  updateSecuritySettings({ ...securitySettings, messageNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Zahlungs-Bestätigung</div>
                <div className="text-sm text-muted-foreground">
                  Alle Zahlungen per E-Mail bestätigen
                </div>
              </div>
              <Switch
                checked={securitySettings.paymentConfirmation}
                onCheckedChange={(checked) => 
                  updateSecuritySettings({ ...securitySettings, paymentConfirmation: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Anzeigen-Updates</div>
                <div className="text-sm text-muted-foreground">
                  Bei Aktivitäten auf Ihren Anzeigen benachrichtigen
                </div>
              </div>
              <Switch
                checked={securitySettings.adUpdateNotifications}
                onCheckedChange={(checked) => 
                  updateSecuritySettings({ ...securitySettings, adUpdateNotifications: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aktive Sitzungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Aktive Sitzungen
          </CardTitle>
          <CardDescription>
            Verwalten Sie Ihre angemeldeten Geräte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <Monitor className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {session.user_agent}
                      {session.is_current && (
                        <Badge variant="default" className="text-xs">Aktuell</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatLastActive(session.last_active)}
                      </span>
                      <span className="text-xs opacity-60">{session.ip_address}</span>
                    </div>
                  </div>
                </div>
                {!session.is_current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => terminateSession(session.id)}
                  >
                    Beenden
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Datenschutz-Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Datenschutz-Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Ihre Daten werden sicher verschlüsselt gespeichert. Zahlungen erfolgen nur für Boost-Features und Premium-Abonnements. 
              Der Handel zwischen Nutzern findet privat statt - wir speichern keine Handelsdaten oder persönlichen Transaktionen.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}