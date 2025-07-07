import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Shield, 
  Eye, 
  Download, 
  Search,
  Clock,
  User,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ComplianceDocument {
  id: string;
  title: string;
  type: 'privacy_policy' | 'terms_of_service' | 'aml_policy' | 'kyc_policy' | 'cookie_policy';
  version: string;
  effective_date: string;
  last_updated: string;
  language: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
}

export function AuditTrailSystem() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Mock Audit-Log Daten
  const mockAuditLogs: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      user_id: user?.id || '',
      user_email: user?.email || '',
      action: 'user_verification_approved',
      entity_type: 'verification_request',
      entity_id: 'vr_123',
      details: { document_type: 'id_card', admin_notes: 'Dokument validiert' },
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0...',
      severity: 'medium'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user_id: user?.id || '',
      user_email: user?.email || '',
      action: 'data_export_requested',
      entity_type: 'gdpr_request',
      entity_id: 'gdpr_456',
      details: { export_type: 'full_data', file_format: 'json' },
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0...',
      severity: 'low'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      user_id: user?.id || '',
      user_email: user?.email || '',
      action: 'large_transaction_flagged',
      entity_type: 'transaction',
      entity_id: 'tx_789',
      details: { amount: 50000, currency: 'EUR', auto_flagged: true },
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0...',
      severity: 'high'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      user_id: user?.id || '',
      user_email: user?.email || '',
      action: 'admin_login',
      entity_type: 'authentication',
      entity_id: 'auth_101',
      details: { login_method: 'password', two_fa_used: true },
      ip_address: '10.0.0.5',
      user_agent: 'Mozilla/5.0...',
      severity: 'medium'
    }
  ];

  // Mock Compliance-Dokumente
  const mockDocuments: ComplianceDocument[] = [
    {
      id: '1',
      title: 'Datenschutzerklärung',
      type: 'privacy_policy',
      version: '2.1',
      effective_date: '2024-01-01',
      last_updated: '2024-01-15',
      language: 'de',
      content: '...',
      status: 'published'
    },
    {
      id: '2',
      title: 'Allgemeine Geschäftsbedingungen',
      type: 'terms_of_service',
      version: '1.8',
      effective_date: '2024-01-01',
      last_updated: '2024-01-10',
      language: 'de',
      content: '...',
      status: 'published'
    },
    {
      id: '3',
      title: 'Anti-Geldwäsche Richtlinien',
      type: 'aml_policy',
      version: '1.3',
      effective_date: '2024-01-01',
      last_updated: '2024-01-05',
      language: 'de',
      content: '...',
      status: 'published'
    },
    {
      id: '4',
      title: 'KYC-Verfahren',
      type: 'kyc_policy',
      version: '1.5',
      effective_date: '2024-01-01',
      last_updated: '2024-01-08',
      language: 'de',
      content: '...',
      status: 'published'
    }
  ];

  useEffect(() => {
    // Simuliere API-Aufruf
    setTimeout(() => {
      setAuditLogs(mockAuditLogs);
      setDocuments(mockDocuments);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter);
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    
    return matchesSearch && matchesAction && matchesSeverity;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Kritisch</Badge>;
      case 'high':
        return <Badge variant="destructive">Hoch</Badge>;
      case 'medium':
        return <Badge variant="secondary">Mittel</Badge>;
      case 'low':
        return <Badge variant="outline">Niedrig</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'privacy_policy':
        return 'Datenschutzerklärung';
      case 'terms_of_service':
        return 'AGB';
      case 'aml_policy':
        return 'AML-Richtlinien';
      case 'kyc_policy':
        return 'KYC-Verfahren';
      case 'cookie_policy':
        return 'Cookie-Richtlinien';
      default:
        return type;
    }
  };

  const getActionName = (action: string) => {
    switch (action) {
      case 'user_verification_approved':
        return 'Benutzer-Verifizierung genehmigt';
      case 'data_export_requested':
        return 'Datenexport angefordert';
      case 'large_transaction_flagged':
        return 'Große Transaktion markiert';
      case 'admin_login':
        return 'Admin-Anmeldung';
      default:
        return action.replace(/_/g, ' ');
    }
  };

  const exportAuditLog = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      toast({
        title: "Export wird erstellt",
        description: `Audit-Log wird als ${format.toUpperCase()} exportiert.`,
      });
      
      // Hier würde normalerweise ein API-Aufruf stattfinden
      setTimeout(() => {
        toast({
          title: "Export abgeschlossen",
          description: `audit-log-${new Date().toISOString().split('T')[0]}.${format} wurde erstellt.`,
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Export konnte nicht erstellt werden.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit-Trail System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Lade Audit-Daten...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Audit-Trail & Compliance System
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => exportAuditLog('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => exportAuditLog('json')}>
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="audit-logs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="audit-logs">Audit-Logs</TabsTrigger>
          <TabsTrigger value="compliance-docs">Compliance-Dokumente</TabsTrigger>
          <TabsTrigger value="monitoring">Überwachung</TabsTrigger>
        </TabsList>

        {/* Audit Logs Tab */}
        <TabsContent value="audit-logs" className="space-y-4">
          {/* Filter Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Suche nach Aktion, Benutzer oder Entität..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Aktion filtern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Aktionen</SelectItem>
                    <SelectItem value="login">Anmeldungen</SelectItem>
                    <SelectItem value="verification">Verifizierungen</SelectItem>
                    <SelectItem value="transaction">Transaktionen</SelectItem>
                    <SelectItem value="export">Datenexporte</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Schweregrad filtern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Schweregrade</SelectItem>
                    <SelectItem value="critical">Kritisch</SelectItem>
                    <SelectItem value="high">Hoch</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="low">Niedrig</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Audit-Protokoll ({filteredLogs.length} Einträge)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zeitstempel</TableHead>
                      <TableHead>Benutzer</TableHead>
                      <TableHead>Aktion</TableHead>
                      <TableHead>Entität</TableHead>
                      <TableHead>Schweregrad</TableHead>
                      <TableHead>IP-Adresse</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(log.timestamp).toLocaleString('de-DE')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{log.user_email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{getActionName(log.action)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.entity_type}</Badge>
                        </TableCell>
                        <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                        <TableCell className="font-mono text-sm">{log.ip_address}</TableCell>
                        <TableCell>
                          <details className="text-sm">
                            <summary className="cursor-pointer text-primary hover:underline">
                              Details anzeigen
                            </summary>
                            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Documents Tab */}
        <TabsContent value="compliance-docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance-Dokumente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{doc.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {getDocumentTypeName(doc.type)} • Version {doc.version}
                          </p>
                        </div>
                        <Badge variant={doc.status === 'published' ? 'default' : 'secondary'}>
                          {doc.status === 'published' ? 'Veröffentlicht' : doc.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Gültig ab:</span>
                          <span>{new Date(doc.effective_date).toLocaleDateString('de-DE')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Aktualisiert:</span>
                          <span>{new Date(doc.last_updated).toLocaleDateString('de-DE')}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Anzeigen
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">99.8%</div>
                <div className="text-sm text-muted-foreground">System-Verfügbarkeit</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{filteredLogs.length}</div>
                <div className="text-sm text-muted-foreground">Audit-Einträge heute</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning">3</div>
                <div className="text-sm text-muted-foreground">Compliance-Warnungen</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Compliance-Überwachung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg border-warning/20 bg-warning/5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <h4 className="font-medium text-warning">Datenschutzerklärung veraltet</h4>
                      <p className="text-sm text-muted-foreground">
                        Die Datenschutzerklärung wurde seit 90 Tagen nicht aktualisiert. 
                        Überprüfung empfohlen.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg border-success/20 bg-success/5">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <h4 className="font-medium text-success">KYC-Compliance erfüllt</h4>
                      <p className="text-sm text-muted-foreground">
                        Alle KYC-Verfahren entsprechen den aktuellen Richtlinien.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}