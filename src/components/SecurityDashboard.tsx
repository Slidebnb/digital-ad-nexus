import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Key, 
  Smartphone, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Lock,
  Unlock,
  Download,
  RefreshCw,
  Monitor,
  MapPin,
  Clock
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
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
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
    tradeConfirmation: true,
    withdrawalConfirmation: true,
    ipRestriction: false,
    sessionTimeout: 30
  });

  useEffect(() => {
    fetchSecurityData();
  }, [user]);

  const fetchSecurityData = async () => {
    if (!user) return;

    try {
      // Profil-Sicherheitsdaten laden
      const { data: profile } = await supabase
        .from('profiles')
        .select('two_factor_enabled, backup_codes, notification_settings')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setTwoFactorEnabled(profile.two_factor_enabled || false);
        setBackupCodes(profile.backup_codes || []);
        
        if (profile.notification_settings && typeof profile.notification_settings === 'object') {
          const notificationSettings = profile.notification_settings as Record<string, any>;
          setSecuritySettings(prev => ({
            ...prev,
            ...notificationSettings
          }));
        }
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

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
    setShowBackupCodes(true);
    
    toast({
      title: "Backup-Codes generiert",
      description: "Speichern Sie diese Codes sicher ab!"
    });
  };

  const enable2FA = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          two_factor_enabled: true,
          backup_codes: backupCodes.length > 0 ? backupCodes : undefined
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      setTwoFactorEnabled(true);
      if (backupCodes.length === 0) {
        generateBackupCodes();
      }

      toast({
        title: "2FA aktiviert",
        description: "Zwei-Faktor-Authentifizierung wurde erfolgreich aktiviert"
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "2FA konnte nicht aktiviert werden",
        variant: "destructive"
      });
    }
  };

  const disable2FA = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          two_factor_enabled: false,
          backup_codes: null
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      setTwoFactorEnabled(false);
      setBackupCodes([]);
      setShowBackupCodes(false);

      toast({
        title: "2FA deaktiviert",
        description: "Zwei-Faktor-Authentifizierung wurde deaktiviert"
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "2FA konnte nicht deaktiviert werden",
        variant: "destructive"
      });
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
        description: "Ihre Sicherheitseinstellungen wurden aktualisiert"
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

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h2 className="text-2xl font-semibold">Sicherheit</h2>
      </div>

      {/* Zwei-Faktor-Authentifizierung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Zwei-Faktor-Authentifizierung
          </CardTitle>
          <CardDescription>
            Zusätzliche Sicherheit für Ihr Konto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">2FA Status</div>
              <div className="text-sm text-muted-foreground">
                {twoFactorEnabled ? 'Aktiviert' : 'Deaktiviert'}
              </div>
            </div>
            <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
              {twoFactorEnabled ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertTriangle className="h-3 w-3 mr-1" />
              )}
              {twoFactorEnabled ? 'Sicher' : 'Nicht sicher'}
            </Badge>
          </div>

          {!twoFactorEnabled ? (
            <div className="space-y-3">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Aktivieren Sie 2FA für zusätzliche Kontosicherheit
                </AlertDescription>
              </Alert>
              <Button onClick={enable2FA} className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                2FA aktivieren
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Backup Codes */}
              {backupCodes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Backup-Codes</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBackupCodes(!showBackupCodes)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {showBackupCodes && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadBackupCodes}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {showBackupCodes && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                        {backupCodes.map((code, index) => (
                          <div key={index} className="p-2 bg-background rounded">
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={generateBackupCodes}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Neue Codes
                </Button>
                <Button variant="destructive" onClick={disable2FA}>
                  <Unlock className="h-4 w-4 mr-2" />
                  2FA deaktivieren
                </Button>
              </div>
            </div>
          )}
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
              />
            </div>
            <div>
              <Label>Neues Passwort</Label>
              <Input
                type="password"
                value={passwordChange.newPassword}
                onChange={(e) => setPasswordChange(prev => ({ ...prev, newPassword: e.target.value }))}
              />
            </div>
            <div>
              <Label>Passwort bestätigen</Label>
              <Input
                type="password"
                value={passwordChange.confirmPassword}
                onChange={(e) => setPasswordChange(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>
            <Button onClick={changePassword} className="w-full">
              Passwort ändern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sicherheitseinstellungen */}
      <Card>
        <CardHeader>
          <CardTitle>Benachrichtigungseinstellungen</CardTitle>
          <CardDescription>
            Konfigurieren Sie Ihre Sicherheitsbenachrichtigungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">E-Mail-Benachrichtigungen</div>
                <div className="text-sm text-muted-foreground">
                  Benachrichtigungen per E-Mail erhalten
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
                <div className="font-medium">Trade-Bestätigung</div>
                <div className="text-sm text-muted-foreground">
                  Alle Trades per E-Mail bestätigen
                </div>
              </div>
              <Switch
                checked={securitySettings.tradeConfirmation}
                onCheckedChange={(checked) => 
                  updateSecuritySettings({ ...securitySettings, tradeConfirmation: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Abhebungs-Bestätigung</div>
                <div className="text-sm text-muted-foreground">
                  Alle Abhebungen per E-Mail bestätigen
                </div>
              </div>
              <Switch
                checked={securitySettings.withdrawalConfirmation}
                onCheckedChange={(checked) => 
                  updateSecuritySettings({ ...securitySettings, withdrawalConfirmation: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aktive Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Aktive Sessions
          </CardTitle>
          <CardDescription>
            Verwalten Sie Ihre aktiven Anmeldungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <span className="font-medium">{session.user_agent}</span>
                  {session.is_current && (
                    <Badge variant="default" className="text-xs">Aktuell</Badge>
                  )}
                </div>
                {!session.is_current && (
                  <Button variant="destructive" size="sm">
                    Beenden
                  </Button>
                )}
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  {session.location} • {session.ip_address}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Letzte Aktivität: {new Date(session.last_active).toLocaleString('de-DE')}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}