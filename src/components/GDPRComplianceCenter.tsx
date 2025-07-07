import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  Download, 
  Trash2, 
  FileText, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GDPRConsent {
  id: string;
  consent_type: 'essential' | 'analytics' | 'marketing' | 'functional';
  granted: boolean;
  timestamp: string;
  ip_address: string;
  user_agent: string;
}

interface DataExportRequest {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requested_at: string;
  completed_at?: string;
  download_url?: string;
}

export function GDPRComplianceCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [consents, setConsents] = useState<GDPRConsent[]>([]);
  const [exportRequest, setExportRequest] = useState<DataExportRequest | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data für Demo-Zwecke
  const mockConsents: GDPRConsent[] = [
    {
      id: '1',
      consent_type: 'essential',
      granted: true,
      timestamp: new Date().toISOString(),
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0...'
    },
    {
      id: '2', 
      consent_type: 'analytics',
      granted: true,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0...'
    },
    {
      id: '3',
      consent_type: 'marketing',
      granted: false,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0...'
    }
  ];

  useEffect(() => {
    // In einer echten App würden wir hier die Daten von der API laden
    setConsents(mockConsents);
    setLoading(false);
  }, []);

  const updateConsent = async (consentType: string, granted: boolean) => {
    try {
      // Hier würde normalerweise eine API-Anfrage stattfinden
      setConsents(prev => 
        prev.map(consent => 
          consent.consent_type === consentType 
            ? { ...consent, granted, timestamp: new Date().toISOString() }
            : consent
        )
      );
      
      toast({
        title: "Einverständnis aktualisiert",
        description: `${consentType} Einverständnis wurde ${granted ? 'erteilt' : 'widerrufen'}.`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Einverständnis konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  };

  const requestDataExport = async () => {
    try {
      const newRequest: DataExportRequest = {
        id: 'export_' + Date.now(),
        status: 'pending',
        requested_at: new Date().toISOString()
      };
      
      setExportRequest(newRequest);
      
      // Simuliere Verarbeitung
      setTimeout(() => {
        setExportRequest(prev => prev ? { 
          ...prev, 
          status: 'completed',
          completed_at: new Date().toISOString(),
          download_url: '/exports/user-data.zip'
        } : null);
      }, 3000);
      
      toast({
        title: "Datenexport angefordert",
        description: "Ihre Anfrage wird bearbeitet. Sie erhalten eine E-Mail wenn der Export bereit ist.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Datenexport konnte nicht angefordert werden.",
        variant: "destructive"
      });
    }
  };

  const requestDataDeletion = async () => {
    try {
      // Hier würde normalerweise ein Löschantrag gestellt werden
      toast({
        title: "Löschantrag eingereicht",
        description: "Ihr Löschantrag wurde eingereicht und wird binnen 30 Tagen bearbeitet.",
      });
    } catch (error) {
      toast({
        title: "Fehler", 
        description: "Löschantrag konnte nicht eingereicht werden.",
        variant: "destructive"
      });
    }
  };

  const getConsentStatusBadge = (granted: boolean) => {
    return granted ? (
      <Badge variant="default" className="bg-success text-success-foreground">
        <CheckCircle className="h-3 w-3 mr-1" />
        Erteilt
      </Badge>
    ) : (
      <Badge variant="secondary">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Widerrufen
      </Badge>
    );
  };

  const getConsentDescription = (type: string) => {
    switch (type) {
      case 'essential':
        return 'Notwendig für die Grundfunktionen der Plattform';
      case 'analytics':
        return 'Hilft uns die Plattform zu verbessern';
      case 'marketing':
        return 'Für personalisierte Werbung und Angebote';
      case 'functional':
        return 'Für erweiterte Funktionen und Personalisierung';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>DSGVO Compliance Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Lade Compliance-Daten...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            DSGVO Compliance Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Verwalten Sie Ihre Datenschutzeinstellungen gemäß der Datenschutz-Grundverordnung (DSGVO).
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Übertragbarkeit Ihrer Daten.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="consents" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="consents">Einverständnisse</TabsTrigger>
              <TabsTrigger value="data-export">Datenexport</TabsTrigger>
              <TabsTrigger value="data-deletion">Datenlöschung</TabsTrigger>
              <TabsTrigger value="audit-log">Audit-Log</TabsTrigger>
            </TabsList>

            {/* Consent Management */}
            <TabsContent value="consents" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Einverständnis-Verwaltung</h3>
                <p className="text-sm text-muted-foreground">
                  Verwalten Sie Ihre Einverständnisse für verschiedene Datenverarbeitungen.
                </p>
                
                {consents.map((consent) => (
                  <div key={consent.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium capitalize">{consent.consent_type}</h4>
                        {getConsentStatusBadge(consent.granted)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getConsentDescription(consent.consent_type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Letzte Änderung: {new Date(consent.timestamp).toLocaleString('de-DE')}
                      </p>
                    </div>
                    
                    <Switch
                      checked={consent.granted}
                      onCheckedChange={(checked) => updateConsent(consent.consent_type, checked)}
                      disabled={consent.consent_type === 'essential'} // Essential kann nicht deaktiviert werden
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Data Export */}
            <TabsContent value="data-export" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Datenexport (Recht auf Übertragbarkeit)</h3>
                <p className="text-sm text-muted-foreground">
                  Exportieren Sie alle Ihre persönlichen Daten in einem maschinenlesbaren Format.
                </p>
                
                {exportRequest ? (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Export-Anfrage</h4>
                      <Badge variant={
                        exportRequest.status === 'completed' ? 'default' :
                        exportRequest.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {exportRequest.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {exportRequest.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {exportRequest.status === 'failed' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {exportRequest.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Angefordert am: {new Date(exportRequest.requested_at).toLocaleString('de-DE')}
                    </p>
                    {exportRequest.status === 'completed' && exportRequest.download_url && (
                      <Button size="sm" className="mt-2">
                        <Download className="h-4 w-4 mr-2" />
                        Herunterladen
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button onClick={requestDataExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Datenexport anfordern
                  </Button>
                )}
              </div>
            </TabsContent>

            {/* Data Deletion */}
            <TabsContent value="data-deletion" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Datenlöschung (Recht auf Vergessenwerden)</h3>
                <p className="text-sm text-muted-foreground">
                  Beantragen Sie die vollständige Löschung Ihrer persönlichen Daten.
                </p>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Wichtiger Hinweis:</strong> Die Löschung Ihrer Daten ist unwiderruflich.
                    Bestimmte Daten müssen aus rechtlichen Gründen (z.B. Steuergesetze) aufbewahrt werden.
                    Nach der Löschung können Sie sich nicht mehr anmelden und verlieren Zugang zu allen Daten.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Was wird gelöscht:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Profildaten und Einstellungen</li>
                    <li>• Chat-Nachrichten und Unterhaltungen</li>
                    <li>• Favoriten und Preisalarme</li>
                    <li>• Upload-Dateien und Bilder</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Was aufbewahrt wird (gesetzlich erforderlich):</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Handelshistorie (10 Jahre)</li>
                    <li>• KYC/AML Dokumentation (5 Jahre)</li>
                    <li>• Rechnungs- und Steuerdaten (10 Jahre)</li>
                  </ul>
                </div>
                
                <Button variant="destructive" onClick={requestDataDeletion}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschung beantragen
                </Button>
              </div>
            </TabsContent>

            {/* Audit Log */}
            <TabsContent value="audit-log" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Audit-Log (Datenverarbeitungsnachweis)</h3>
                <p className="text-sm text-muted-foreground">
                  Einsicht in alle Datenverarbeitungen die mit Ihren Daten durchgeführt wurden.
                </p>
                
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {[
                      { action: 'Login', time: '2024-01-07 10:30:00', details: 'Erfolgreiche Anmeldung von IP 192.168.1.1' },
                      { action: 'Profil aktualisiert', time: '2024-01-07 10:25:00', details: 'Telefonnummer geändert' },
                      { action: 'Datenexport', time: '2024-01-06 15:20:00', details: 'Vollständiger Datenexport angefordert' },
                      { action: 'Einverständnis geändert', time: '2024-01-06 14:10:00', details: 'Marketing-Einverständnis widerrufen' },
                      { action: 'KYC Verifizierung', time: '2024-01-05 09:15:00', details: 'Identitätsdokument hochgeladen' }
                    ].map((log, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{log.action}</h4>
                          <span className="text-xs text-muted-foreground">{log.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}