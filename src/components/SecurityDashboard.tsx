
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Key, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
}

interface LoginSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export function SecurityDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Defensive State-Initialisierung
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    emailNotifications: true,
    loginNotifications: true,
    suspiciousActivityAlerts: true
  });
  
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Mock data für Demo-Zwecke mit Error Handling
  useEffect(() => {
    const loadSecurityData = async () => {
      try {
        setLoading(true);
        
        // Simuliere API-Aufruf mit Delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock Sessions
        const mockSessions: LoginSession[] = [
          {
            id: '1',
            device: 'Chrome auf Windows',
            location: 'Berlin, Deutschland',
            lastActive: new Date().toISOString(),
            current: true
          },
          {
            id: '2',
            device: 'Safari auf iPhone',
            location: 'Hamburg, Deutschland',
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            current: false
          }
        ];
        
        setSessions(mockSessions);
        
        // Mock Settings (könnte aus Supabase kommen)
        setSettings({
          twoFactorEnabled: false,
          emailNotifications: true,
          loginNotifications: true,
          suspiciousActivityAlerts: true
        });
        
      } catch (error) {
        console.error('Fehler beim Laden der Sicherheitsdaten:', error);
        toast({
          title: "Fehler",
          description: "Sicherheitsdaten konnten nicht geladen werden.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadSecurityData();
    }
  }, [user, toast]);

  const handleSettingChange = async (key: keyof SecuritySettings, value: boolean) => {
    try {
      setSettings(prev => ({ ...prev, [key]: value }));
      
      // Hier würde normalerweise ein API-Aufruf stattfinden
      await new Promise(resolve => setTimeout(resolve, 300));
      
      toast({
        title: "Einstellung gespeichert",
        description: `${key} wurde ${value ? 'aktiviert' : 'deaktiviert'}.`
      });
    } catch (error) {
      console.error('Fehler beim Speichern der Einstellung:', error);
      toast({
        title: "Fehler",
        description: "Einstellung konnte nicht gespeichert werden.",
        variant: "destructive"
      });
      // Revert bei Fehler
      setSettings(prev => ({ ...prev, [key]: !value }));
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Fehler",
        description: "Die neuen Passwörter stimmen nicht überein.",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Fehler",
        description: "Das neue Passwort muss mindestens 8 Zeichen lang sein.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      
      // Simuliere Passwort-Änderung
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Passwort geändert",
        description: "Ihr Passwort wurde erfolgreich geändert."
      });
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      console.error('Fehler beim Ändern des Passworts:', error);
      toast({
        title: "Fehler",
        description: "Passwort konnte nicht geändert werden.",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      toast({
        title: "Sitzung beendet",
        description: "Die Sitzung wurde erfolgreich beendet."
      });
    } catch (error) {
      console.error('Fehler beim Beenden der Sitzung:', error);
      toast({
        title: "Fehler",
        description: "Sitzung konnte nicht beendet werden.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Sicherheit</h2>
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

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Anmeldung erforderlich</h3>
          <p className="text-sm text-muted-foreground">
            Sie müssen angemeldet sein, um Ihre Sicherheitseinstellungen zu verwalten.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getSecurityScore = () => {
    let score = 0;
    if (settings.twoFactorEnabled) score += 40;
    if (settings.emailNotifications) score += 20;
    if (settings.loginNotifications) score += 20;
    if (settings.suspiciousActivityAlerts) score += 20;
    return score;
  };

  const securityScore = getSecurityScore();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h2 className="text-2xl font-semibold">Sicherheit</h2>
      </div>

      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sicherheitsstatus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold">{securityScore}%</div>
              <p className="text-sm text-muted-foreground">Sicherheitsscore</p>
            </div>
            <Badge variant={securityScore >= 80 ? "default" : securityScore >= 60 ? "secondary" : "destructive"}>
              {securityScore >= 80 ? "Sehr sicher" : securityScore >= 60 ? "Gut" : "Verbesserung nötig"}
            </Badge>
          </div>
          
          {securityScore < 80 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Aktivieren Sie die Zwei-Faktor-Authentifizierung für maximale Sicherheit.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Zwei-Faktor-Authentifizierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">2FA aktivieren</p>
              <p className="text-sm text-muted-foreground">
                Zusätzliche Sicherheit durch SMS oder Authenticator-App
              </p>
            </div>
            <Switch
              checked={settings.twoFactorEnabled}
              onCheckedChange={(checked) => handleSettingChange('twoFactorEnabled', checked)}
            />
          </div>
          
          {!settings.twoFactorEnabled && (
            <Button variant="outline" className="w-full">
              <Key className="h-4 w-4 mr-2" />
              2FA einrichten
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Passwort ändern
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-password">Aktuelles Passwort</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Aktuelles Passwort eingeben"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="new-password">Neues Passwort</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Neues Passwort eingeben"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="confirm-password">Neues Passwort bestätigen</Label>
            <Input
              id="confirm-password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Neues Passwort bestätigen"
            />
          </div>
          
          <Button 
            onClick={handlePasswordChange} 
            disabled={isChangingPassword}
            className="w-full"
          >
            {isChangingPassword ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Wird geändert...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Passwort ändern
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Benachrichtigungseinstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">E-Mail-Benachrichtigungen</p>
              <p className="text-sm text-muted-foreground">
                Benachrichtigungen über wichtige Kontoupdates
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Login-Benachrichtigungen</p>
              <p className="text-sm text-muted-foreground">
                Benachrichtigung bei neuen Anmeldungen
              </p>
            </div>
            <Switch
              checked={settings.loginNotifications}
              onCheckedChange={(checked) => handleSettingChange('loginNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Verdächtige Aktivitäten</p>
              <p className="text-sm text-muted-foreground">
                Warnung bei ungewöhnlichen Kontoaktivitäten
              </p>
            </div>
            <Switch
              checked={settings.suspiciousActivityAlerts}
              onCheckedChange={(checked) => handleSettingChange('suspiciousActivityAlerts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Aktive Sitzungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{session.device}</p>
                    {session.current && (
                      <Badge variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Aktuell
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{session.location}</p>
                  <p className="text-xs text-muted-foreground">
                    Zuletzt aktiv: {new Date(session.lastActive).toLocaleString('de-DE')}
                  </p>
                </div>
                
                {!session.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTerminateSession(session.id)}
                  >
                    Beenden
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
