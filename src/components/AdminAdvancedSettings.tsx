import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, 
  Database, 
  Shield, 
  Mail, 
  Globe,
  Zap,
  AlertTriangle,
  Save,
  RefreshCw,
  Lock,
  Eye,
  Users,
  FileText,
  Server,
  Activity
} from "lucide-react";

interface SystemSettings {
  // Platform Settings
  platform_name: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  max_file_size_mb: number;
  session_timeout_hours: number;
  
  // Security Settings
  require_2fa_for_admins: boolean;
  max_login_attempts: number;
  password_min_length: number;
  ip_whitelist_enabled: boolean;
  audit_logging_enabled: boolean;
  
  // Trading Settings
  min_trade_amount: number;
  max_trade_amount: number;
  platform_fee_percentage: number;
  auto_verification_enabled: boolean;
  
  // Notification Settings
  email_notifications_enabled: boolean;
  welcome_email_enabled: boolean;
  system_alerts_enabled: boolean;
  
  // Performance Settings
  cache_ttl_minutes: number;
  api_rate_limit_per_minute: number;
  database_connection_pool_size: number;
}

export function AdminAdvancedSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings>({
    platform_name: "KryptoMarkt",
    maintenance_mode: false,
    registration_enabled: true,
    max_file_size_mb: 10,
    session_timeout_hours: 24,
    require_2fa_for_admins: true,
    max_login_attempts: 5,
    password_min_length: 8,
    ip_whitelist_enabled: false,
    audit_logging_enabled: true,
    min_trade_amount: 10,
    max_trade_amount: 50000,
    platform_fee_percentage: 2.5,
    auto_verification_enabled: false,
    email_notifications_enabled: true,
    welcome_email_enabled: true,
    system_alerts_enabled: true,
    cache_ttl_minutes: 60,
    api_rate_limit_per_minute: 100,
    database_connection_pool_size: 20
  });
  
  const [loading, setLoading] = useState(false);
  const [systemStats, setSystemStats] = useState({
    uptime: '99.9%',
    totalUsers: 1247,
    activeConnections: 23,
    storageUsed: '2.3 GB',
    lastBackup: '2 Stunden'
  });

  const [activeTab, setActiveTab] = useState("platform");

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .is('user_id', null); // System-wide settings

      if (error) throw error;

      const settingsMap = {};
      data?.forEach(setting => {
        settingsMap[setting.key] = setting.value;
      });

      setSettings(prev => ({ ...prev, ...settingsMap }));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Convert settings to array of key-value pairs
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value.toString(),
        user_id: null, // System-wide setting
        description: getSettingDescription(key)
      }));

      // Upsert settings
      for (const setting of settingsArray) {
        const { error } = await supabase
          .from('settings')
          .upsert(setting, { 
            onConflict: 'key',
            ignoreDuplicates: false 
          });
        
        if (error) throw error;
      }

      // Create admin log entry
      await supabase.from('admin_logs').insert({
        action: 'system_settings_updated',
        target_type: 'system',
        target_id: 'settings',
        details: { 
          updated_settings: Object.keys(settings),
          timestamp: new Date().toISOString()
        }
      });

      toast({
        title: "✅ Einstellungen gespeichert",
        description: "Die Systemeinstellungen wurden erfolgreich aktualisiert."
      });

    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "❌ Fehler",
        description: "Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSettingDescription = (key: string): string => {
    const descriptions = {
      platform_name: "Name der Plattform",
      maintenance_mode: "Wartungsmodus aktiviert",
      registration_enabled: "Neue Registrierungen erlauben",
      max_file_size_mb: "Maximale Upload-Größe in MB",
      session_timeout_hours: "Session Timeout in Stunden",
      require_2fa_for_admins: "2FA für Administratoren erforderlich",
      max_login_attempts: "Maximale Anmeldeversuche",
      password_min_length: "Minimale Passwort-Länge",
      ip_whitelist_enabled: "IP-Whitelist aktiviert",
      audit_logging_enabled: "Audit-Logging aktiviert",
      min_trade_amount: "Mindest-Handelsbetrag in EUR",
      max_trade_amount: "Maximum-Handelsbetrag in EUR",
      platform_fee_percentage: "Plattform-Gebühr in Prozent",
      auto_verification_enabled: "Automatische Verifizierung aktiviert",
      email_notifications_enabled: "E-Mail-Benachrichtigungen aktiviert",
      welcome_email_enabled: "Willkommens-E-Mail aktiviert",
      system_alerts_enabled: "System-Alerts aktiviert",
      cache_ttl_minutes: "Cache TTL in Minuten",
      api_rate_limit_per_minute: "API Rate Limit pro Minute",
      database_connection_pool_size: "Datenbank Connection Pool Größe"
    };
    return descriptions[key] || key;
  };

  const resetToDefaults = () => {
    if (confirm("Sind Sie sicher, dass Sie alle Einstellungen auf die Standardwerte zurücksetzen möchten?")) {
      setSettings({
        platform_name: "KryptoMarkt",
        maintenance_mode: false,
        registration_enabled: true,
        max_file_size_mb: 10,
        session_timeout_hours: 24,
        require_2fa_for_admins: true,
        max_login_attempts: 5,
        password_min_length: 8,
        ip_whitelist_enabled: false,
        audit_logging_enabled: true,
        min_trade_amount: 10,
        max_trade_amount: 50000,
        platform_fee_percentage: 2.5,
        auto_verification_enabled: false,
        email_notifications_enabled: true,
        welcome_email_enabled: true,
        system_alerts_enabled: true,
        cache_ttl_minutes: 60,
        api_rate_limit_per_minute: 100,
        database_connection_pool_size: 20
      });
      
      toast({
        title: "🔄 Auf Standardwerte zurückgesetzt",
        description: "Alle Einstellungen wurden auf die Standardwerte zurückgesetzt."
      });
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Erweiterte Systemeinstellungen</h2>
          <p className="text-muted-foreground">
            Konfiguration für produktionsreife Plattform-Verwaltung
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Zurücksetzen
          </Button>
          <Button onClick={saveSettings} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Speichert...' : 'Speichern'}
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">Uptime</span>
            </div>
            <div className="text-xl font-bold text-success">{systemStats.uptime}</div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Nutzer</span>
            </div>
            <div className="text-xl font-bold">{systemStats.totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium">Aktive Verbindungen</span>
            </div>
            <div className="text-xl font-bold">{systemStats.activeConnections}</div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Storage</span>
            </div>
            <div className="text-xl font-bold">{systemStats.storageUsed}</div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Letztes Backup</span>
            </div>
            <div className="text-xl font-bold">vor {systemStats.lastBackup}</div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="platform">
            <Globe className="h-4 w-4 mr-2" />
            Plattform
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Sicherheit
          </TabsTrigger>
          <TabsTrigger value="trading">
            <Activity className="h-4 w-4 mr-2" />
            Handel
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Mail className="h-4 w-4 mr-2" />
            Benachrichtigungen
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Zap className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Platform Settings */}
        <TabsContent value="platform" className="space-y-6">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Plattform-Konfiguration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="platform_name">Plattform-Name</Label>
                  <Input
                    id="platform_name"
                    value={settings.platform_name}
                    onChange={(e) => setSettings(prev => ({ ...prev, platform_name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_file_size">Max. Upload-Größe (MB)</Label>
                  <Input
                    id="max_file_size"
                    type="number"
                    value={settings.max_file_size_mb}
                    onChange={(e) => setSettings(prev => ({ ...prev, max_file_size_mb: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Session Timeout (Stunden)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    value={settings.session_timeout_hours}
                    onChange={(e) => setSettings(prev => ({ ...prev, session_timeout_hours: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Wartungsmodus</div>
                    <div className="text-sm text-muted-foreground">
                      Blockiert den Zugang für normale Nutzer
                    </div>
                  </div>
                  <Switch
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenance_mode: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Registrierung aktiviert</div>
                    <div className="text-sm text-muted-foreground">
                      Neue Nutzer können sich registrieren
                    </div>
                  </div>
                  <Switch
                    checked={settings.registration_enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, registration_enabled: checked }))}
                  />
                </div>
              </div>

              {settings.maintenance_mode && (
                <Alert className="border-warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Wartungsmodus aktiviert:</strong> Die Plattform ist für normale Nutzer nicht zugänglich.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sicherheitseinstellungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="max_login_attempts">Max. Anmeldeversuche</Label>
                  <Input
                    id="max_login_attempts"
                    type="number"
                    value={settings.max_login_attempts}
                    onChange={(e) => setSettings(prev => ({ ...prev, max_login_attempts: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_min_length">Min. Passwort-Länge</Label>
                  <Input
                    id="password_min_length"
                    type="number"
                    value={settings.password_min_length}
                    onChange={(e) => setSettings(prev => ({ ...prev, password_min_length: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">2FA für Administratoren</div>
                    <div className="text-sm text-muted-foreground">
                      Zwei-Faktor-Authentifizierung für Admin-Accounts erforderlich
                    </div>
                  </div>
                  <Switch
                    checked={settings.require_2fa_for_admins}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, require_2fa_for_admins: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">IP-Whitelist</div>
                    <div className="text-sm text-muted-foreground">
                      Nur erlaubte IP-Adressen können zugreifen
                    </div>
                  </div>
                  <Switch
                    checked={settings.ip_whitelist_enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, ip_whitelist_enabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Audit-Logging</div>
                    <div className="text-sm text-muted-foreground">
                      Alle Admin-Aktionen werden protokolliert
                    </div>
                  </div>
                  <Switch
                    checked={settings.audit_logging_enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, audit_logging_enabled: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trading Settings */}
        <TabsContent value="trading" className="space-y-6">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Handels-Konfiguration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="min_trade_amount">Min. Handelsbetrag (EUR)</Label>
                  <Input
                    id="min_trade_amount"
                    type="number"
                    value={settings.min_trade_amount}
                    onChange={(e) => setSettings(prev => ({ ...prev, min_trade_amount: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_trade_amount">Max. Handelsbetrag (EUR)</Label>
                  <Input
                    id="max_trade_amount"
                    type="number"
                    value={settings.max_trade_amount}
                    onChange={(e) => setSettings(prev => ({ ...prev, max_trade_amount: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform_fee">Plattform-Gebühr (%)</Label>
                  <Input
                    id="platform_fee"
                    type="number"
                    step="0.1"
                    value={settings.platform_fee_percentage}
                    onChange={(e) => setSettings(prev => ({ ...prev, platform_fee_percentage: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Automatische Verifizierung</div>
                  <div className="text-sm text-muted-foreground">
                    Bestimmte Verifizierungen automatisch genehmigen
                  </div>
                </div>
                <Switch
                  checked={settings.auto_verification_enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_verification_enabled: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Benachrichtigungseinstellungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">E-Mail-Benachrichtigungen</div>
                  <div className="text-sm text-muted-foreground">
                    System-E-Mails an Nutzer versenden
                  </div>
                </div>
                <Switch
                  checked={settings.email_notifications_enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email_notifications_enabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Willkommens-E-Mail</div>
                  <div className="text-sm text-muted-foreground">
                    Automatische Begrüßung neuer Nutzer
                  </div>
                </div>
                <Switch
                  checked={settings.welcome_email_enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, welcome_email_enabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">System-Alerts</div>
                  <div className="text-sm text-muted-foreground">
                    Wichtige System-Benachrichtigungen
                  </div>
                </div>
                <Switch
                  checked={settings.system_alerts_enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, system_alerts_enabled: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance-Optimierung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cache_ttl">Cache TTL (Minuten)</Label>
                  <Input
                    id="cache_ttl"
                    type="number"
                    value={settings.cache_ttl_minutes}
                    onChange={(e) => setSettings(prev => ({ ...prev, cache_ttl_minutes: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_rate_limit">API Rate Limit (/min)</Label>
                  <Input
                    id="api_rate_limit"
                    type="number"
                    value={settings.api_rate_limit_per_minute}
                    onChange={(e) => setSettings(prev => ({ ...prev, api_rate_limit_per_minute: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="db_pool_size">DB Connection Pool</Label>
                  <Input
                    id="db_pool_size"
                    type="number"
                    value={settings.database_connection_pool_size}
                    onChange={(e) => setSettings(prev => ({ ...prev, database_connection_pool_size: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>Performance-Tipp:</strong> Höhere Cache-TTL Werte verbessern die Performance, 
                  aber reduzieren die Aktualität der Daten. Rate Limits schützen vor API-Missbrauch.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}