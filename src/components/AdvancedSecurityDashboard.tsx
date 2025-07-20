import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Smartphone,
  Key,
  Eye,
  Lock,
  Settings
} from "lucide-react";
import { TwoFactorSetup } from "./TwoFactorSetup";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface SecurityEvent {
  id: string;
  type: "login" | "password_change" | "2fa_enable" | "suspicious_activity";
  timestamp: string;
  ip_address: string;
  location: string;
  user_agent: string;
  status: "success" | "failed" | "blocked";
}

interface SecurityStatus {
  passwordStrength: "weak" | "medium" | "strong";
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  securityScore: number;
  lastPasswordChange: string;
  activeSessionsCount: number;
}

export function AdvancedSecurityDashboard() {
  const { user } = useAuth();
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    passwordStrength: "medium",
    twoFactorEnabled: false,
    emailVerified: false,
    phoneVerified: false,
    securityScore: 65,
    lastPasswordChange: "2024-01-15",
    activeSessionsCount: 3
  });
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSecurityData();
    }
  }, [user]);

  const loadSecurityData = async () => {
    try {
      // Load security status
      const { data: profile } = await supabase
        .from("profiles")
        .select("two_factor_enabled, phone, verified")
        .eq("user_id", user!.id)
        .single();

      if (profile) {
        setSecurityStatus(prev => ({
          ...prev,
          twoFactorEnabled: profile.two_factor_enabled || false,
          emailVerified: user!.email_confirmed_at != null,
          phoneVerified: !!profile.phone,
          securityScore: calculateSecurityScore({
            twoFactor: profile.two_factor_enabled,
            emailVerified: user!.email_confirmed_at != null,
            phoneVerified: !!profile.phone
          })
        }));
      }

      // Simulate security events (in production, these would come from your security logs)
      const mockEvents: SecurityEvent[] = [
        {
          id: "1",
          type: "login",
          timestamp: new Date().toISOString(),
          ip_address: "192.168.1.1",
          location: "Berlin, Deutschland",
          user_agent: "Chrome 120.0.0.0",
          status: "success"
        },
        {
          id: "2",
          type: "login",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          ip_address: "10.0.0.1",
          location: "München, Deutschland",
          user_agent: "Firefox 121.0.0.0",
          status: "success"
        },
        {
          id: "3",
          type: "suspicious_activity",
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          ip_address: "203.0.113.1",
          location: "Unbekannt",
          user_agent: "Bot/1.0",
          status: "blocked"
        }
      ];
      setSecurityEvents(mockEvents);

    } catch (error) {
      console.error("Error loading security data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSecurityScore = (factors: {
    twoFactor?: boolean;
    emailVerified?: boolean;
    phoneVerified?: boolean;
  }) => {
    let score = 30; // Base score
    if (factors.emailVerified) score += 20;
    if (factors.phoneVerified) score += 15;
    if (factors.twoFactor) score += 35;
    return Math.min(score, 100);
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getSecurityScoreLabel = (score: number) => {
    if (score >= 80) return "Hoch";
    if (score >= 60) return "Mittel";
    return "Niedrig";
  };

  const getEventIcon = (type: SecurityEvent["type"], status: SecurityEvent["status"]) => {
    if (status === "blocked") return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (status === "failed") return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    
    switch (type) {
      case "login":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "2fa_enable":
        return <Shield className="h-4 w-4 text-blue-500" />;
      case "password_change":
        return <Key className="h-4 w-4 text-blue-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventLabel = (type: SecurityEvent["type"]) => {
    switch (type) {
      case "login": return "Anmeldung";
      case "password_change": return "Passwort geändert";
      case "2fa_enable": return "2FA aktiviert";
      case "suspicious_activity": return "Verdächtige Aktivität";
      default: return "Unbekannt";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sicherheits-Score</p>
                <p className={`text-2xl font-bold ${getSecurityScoreColor(securityStatus.securityScore)}`}>
                  {securityStatus.securityScore}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {getSecurityScoreLabel(securityStatus.securityScore)}
                </p>
              </div>
              <Shield className={`h-8 w-8 ${getSecurityScoreColor(securityStatus.securityScore)}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">2FA Status</p>
                <p className="text-2xl font-bold">
                  {securityStatus.twoFactorEnabled ? (
                    <Badge variant="default" className="bg-green-500">Aktiv</Badge>
                  ) : (
                    <Badge variant="destructive">Inaktiv</Badge>
                  )}
                </p>
              </div>
              <Lock className={`h-8 w-8 ${securityStatus.twoFactorEnabled ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aktive Sessions</p>
                <p className="text-2xl font-bold">{securityStatus.activeSessionsCount}</p>
                <p className="text-xs text-muted-foreground">Geräte</p>
              </div>
              <Smartphone className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Letztes Passwort</p>
                <p className="text-2xl font-bold">45d</p>
                <p className="text-xs text-muted-foreground">vor</p>
              </div>
              <Key className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Recommendations */}
      {securityStatus.securityScore < 80 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Sicherheitsempfehlungen:</strong>
            <ul className="mt-2 space-y-1">
              {!securityStatus.twoFactorEnabled && (
                <li>• Zwei-Faktor-Authentifizierung aktivieren (+35 Punkte)</li>
              )}
              {!securityStatus.phoneVerified && (
                <li>• Telefonnummer verifizieren (+15 Punkte)</li>
              )}
              {!securityStatus.emailVerified && (
                <li>• E-Mail-Adresse verifizieren (+20 Punkte)</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="2fa">Zwei-Faktor Auth</TabsTrigger>
          <TabsTrigger value="activity">Aktivität</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sicherheitseinstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${securityStatus.emailVerified ? 'text-green-500' : 'text-gray-400'}`} />
                    <span>E-Mail verifiziert</span>
                  </div>
                  <Badge variant={securityStatus.emailVerified ? "default" : "secondary"}>
                    {securityStatus.emailVerified ? "Ja" : "Nein"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${securityStatus.phoneVerified ? 'text-green-500' : 'text-gray-400'}`} />
                    <span>Telefon verifiziert</span>
                  </div>
                  <Badge variant={securityStatus.phoneVerified ? "default" : "secondary"}>
                    {securityStatus.phoneVerified ? "Ja" : "Nein"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className={`h-4 w-4 ${securityStatus.twoFactorEnabled ? 'text-green-500' : 'text-gray-400'}`} />
                    <span>2FA aktiviert</span>
                  </div>
                  <Badge variant={securityStatus.twoFactorEnabled ? "default" : "secondary"}>
                    {securityStatus.twoFactorEnabled ? "Ja" : "Nein"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schnellaktionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Key className="h-4 w-4 mr-2" />
                  Passwort ändern
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Sessions verwalten
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  Datenschutz-Einstellungen
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Erweiterte Einstellungen
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="2fa">
          <TwoFactorSetup />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sicherheitsaktivität</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getEventIcon(event.type, event.status)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{getEventLabel(event.type)}</p>
                        <Badge variant={
                          event.status === "success" ? "default" :
                          event.status === "failed" ? "secondary" : "destructive"
                        }>
                          {event.status === "success" ? "Erfolgreich" :
                           event.status === "failed" ? "Fehlgeschlagen" : "Blockiert"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {new Date(event.timestamp).toLocaleString("de-DE")}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {event.location} • {event.ip_address}
                        </div>
                        <div className="text-xs">
                          {event.user_agent}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Aktive Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Smartphone className="h-5 w-5 text-green-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Aktueller Browser</p>
                      <Badge variant="default">Aktiv</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Chrome 120.0.0.0 • Berlin, Deutschland</p>
                      <p>192.168.1.1 • Zuletzt aktiv: Jetzt</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Smartphone className="h-5 w-5 text-blue-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Mobile App</p>
                      <Button variant="outline" size="sm">Beenden</Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>iOS App • München, Deutschland</p>
                      <p>10.0.0.1 • Zuletzt aktiv: vor 2 Stunden</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Smartphone className="h-5 w-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Firefox Browser</p>
                      <Button variant="outline" size="sm">Beenden</Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Firefox 121.0.0.0 • Hamburg, Deutschland</p>
                      <p>172.16.0.1 • Zuletzt aktiv: vor 1 Tag</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <Button variant="destructive" size="sm">
                  Alle anderen Sessions beenden
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}