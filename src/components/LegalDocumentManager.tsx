import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Save, 
  Eye, 
  Download, 
  History,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LegalDocument {
  id: string;
  type: 'privacy_policy' | 'terms_of_service' | 'imprint' | 'cookie_policy' | 'aml_policy';
  title: string;
  content: string;
  version: string;
  lastUpdated: string;
  status: 'draft' | 'published' | 'archived';
  language: string;
}

export function LegalDocumentManager() {
  const { toast } = useToast();
  const [activeDocument, setActiveDocument] = useState<string>('privacy_policy');
  const [editMode, setEditMode] = useState(false);

  // Mock documents
  const [documents, setDocuments] = useState<LegalDocument[]>([
    {
      id: '1',
      type: 'privacy_policy',
      title: 'Datenschutzerklärung',
      content: `# Datenschutzerklärung für KRYPTOANZEIGEN.DE

## 1. Verantwortlicher
KRYPTOANZEIGEN.DE
Max Mustermann
Musterstraße 123
12345 Musterstadt
E-Mail: datenschutz@kryptoanzeigen.de

## 2. Erhebung und Speicherung personenbezogener Daten
Wir erheben und verwenden Ihre personenbezogenen Daten ausschließlich im Rahmen der gesetzlichen Bestimmungen...`,
      version: '2.1',
      lastUpdated: '2024-01-15',
      status: 'published',
      language: 'de'
    },
    {
      id: '2',
      type: 'terms_of_service',
      title: 'Allgemeine Geschäftsbedingungen',
      content: `# Allgemeine Geschäftsbedingungen (AGB)

## § 1 Geltungsbereich
Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge über die Nutzung der Plattform KRYPTOANZEIGEN.DE...`,
      version: '1.8',
      lastUpdated: '2024-01-10',
      status: 'published',
      language: 'de'
    },
    {
      id: '3',
      type: 'imprint',
      title: 'Impressum',
      content: `# Impressum

## Angaben gemäß § 5 TMG
KRYPTOANZEIGEN.DE
Max Mustermann
Musterstraße 123
12345 Musterstadt

## Kontakt
Telefon: +49 123 456789
E-Mail: info@kryptoanzeigen.de

## Umsatzsteuer-ID
Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: DE123456789`,
      version: '1.2',
      lastUpdated: '2024-01-05',
      status: 'published',
      language: 'de'
    }
  ]);

  const currentDocument = documents.find(doc => doc.type === activeDocument);

  const documentTypes = [
    { key: 'privacy_policy', name: 'Datenschutzerklärung', icon: '🛡️' },
    { key: 'terms_of_service', name: 'AGB', icon: '📋' },
    { key: 'imprint', name: 'Impressum', icon: '🏢' },
    { key: 'cookie_policy', name: 'Cookie-Richtlinien', icon: '🍪' },
    { key: 'aml_policy', name: 'AML-Richtlinien', icon: '🔍' }
  ];

  const saveDocument = () => {
    toast({
      title: "Dokument gespeichert",
      description: "Die Änderungen wurden erfolgreich gespeichert.",
    });
    setEditMode(false);
  };

  const publishDocument = () => {
    toast({
      title: "Dokument veröffentlicht",
      description: "Das Dokument ist jetzt öffentlich verfügbar.",
    });
  };

  const generateDocument = (type: string) => {
    toast({
      title: "Dokument wird generiert",
      description: "Ein neues Dokument wird basierend auf aktuellen Gesetzen erstellt.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rechtliche Dokumente verwalten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Wichtig:</strong> Alle rechtlichen Dokumente sollten regelmäßig von einem Rechtsanwalt 
              überprüft werden. Diese Vorlagen dienen nur als Ausgangspunkt.
            </AlertDescription>
          </Alert>

          <Tabs value={activeDocument} onValueChange={setActiveDocument}>
            <TabsList className="grid w-full grid-cols-5">
              {documentTypes.map((type) => (
                <TabsTrigger key={type.key} value={type.key} className="text-xs">
                  <span className="mr-1">{type.icon}</span>
                  {type.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {documentTypes.map((type) => (
              <TabsContent key={type.key} value={type.key} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{type.name}</h3>
                    {currentDocument && (
                      <>
                        <Badge variant={currentDocument.status === 'published' ? 'default' : 'secondary'}>
                          {currentDocument.status === 'published' ? 'Veröffentlicht' : currentDocument.status}
                        </Badge>
                        <Badge variant="outline">
                          Version {currentDocument.version}
                        </Badge>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {currentDocument ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditMode(!editMode)}
                        >
                          {editMode ? 'Vorschau' : 'Bearbeiten'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={publishDocument}
                          disabled={currentDocument.status === 'published'}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Veröffentlichen
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={() => generateDocument(type.key)}
                      >
                        Dokument erstellen
                      </Button>
                    )}
                  </div>
                </div>

                {currentDocument ? (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Dokumentinhalt</CardTitle>
                            {editMode && (
                              <Button onClick={saveDocument} size="sm">
                                <Save className="h-4 w-4 mr-2" />
                                Speichern
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {editMode ? (
                            <Textarea
                              value={currentDocument.content}
                              onChange={() => {}}
                              className="min-h-[500px] font-mono text-sm"
                              placeholder="Dokumentinhalt hier eingeben..."
                            />
                          ) : (
                            <div className="prose prose-sm max-w-none">
                              <pre className="whitespace-pre-wrap text-sm">
                                {currentDocument.content}
                              </pre>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Dokumentinfo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <label className="text-sm font-medium">Version</label>
                            <Input
                              value={currentDocument.version}
                              onChange={() => {}}
                              disabled={!editMode}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Sprache</label>
                            <Input
                              value={currentDocument.language}
                              onChange={() => {}}
                              disabled={!editMode}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Letztes Update</label>
                            <Input
                              value={currentDocument.lastUpdated}
                              disabled
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <Badge 
                              variant={currentDocument.status === 'published' ? 'default' : 'secondary'}
                              className="w-full justify-center"
                            >
                              {currentDocument.status === 'published' ? 'Veröffentlicht' : currentDocument.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Compliance Check</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">DSGVO Konformität</span>
                              <CheckCircle className="h-4 w-4 text-success" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">TMG Konformität</span>
                              <CheckCircle className="h-4 w-4 text-success" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Aktualität</span>
                              <CheckCircle className="h-4 w-4 text-success" />
                            </div>
                            {type.key === 'privacy_policy' && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Cookie Banner</span>
                                <CheckCircle className="h-4 w-4 text-success" />
                              </div>
                            )}
                          </div>
                          <Button variant="outline" className="w-full" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Vollständige Prüfung
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Versionshistorie</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>v{currentDocument.version}</span>
                              <span>{currentDocument.lastUpdated}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>v2.0</span>
                              <span>2023-12-15</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>v1.9</span>
                              <span>2023-11-20</span>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full mt-3" size="sm">
                            <History className="h-4 w-4 mr-2" />
                            Alle Versionen
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Kein Dokument vorhanden</h3>
                      <p className="text-muted-foreground mb-4">
                        Erstellen Sie ein neues {type.name} basierend auf aktuellen rechtlichen Anforderungen.
                      </p>
                      <Button
                        variant="gradient"
                        onClick={() => generateDocument(type.key)}
                      >
                        Dokument erstellen
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}