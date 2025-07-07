import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Calculator, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Euro
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useComplianceData } from '@/hooks/useComplianceData';
import { useToast } from '@/hooks/use-toast';

export function TaxReportingSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    taxReports,
    loading,
    generateTaxReport
  } = useComplianceData();
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleGenerateReport = async () => {
    const reportId = await generateTaxReport(selectedYear);
    
    if (!reportId) {
      toast({
        title: "Fehler",
        description: "Steuer-Report konnte nicht generiert werden.",
        variant: "destructive"
      });
    }
  };

  const downloadReport = (format: 'pdf' | 'csv' | 'xlsx') => {
    toast({
      title: "Download wird vorbereitet",
      description: `${format.toUpperCase()}-Export wird erstellt...`,
    });
    
    // Simuliere Download
    setTimeout(() => {
      toast({
        title: "Download bereit",
        description: `Steuerbericht-${selectedYear}.${format} wurde erstellt.`,
      });
    }, 1500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Steuer-Reporting System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Lade Steuerdaten...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Steuer-Reporting System
            </CardTitle>
            <div className="flex items-center gap-4">
              <Select 
                value={selectedYear.toString()} 
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2023, 2022, 2021].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleGenerateReport}>
                <FileText className="h-4 w-4 mr-2" />
                Report erstellen
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="reports">Berichte</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Steuer-Übersicht Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="gradient-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{taxReports.length}</div>
                <div className="text-sm text-muted-foreground">Verfügbare Reports</div>
              </CardContent>
            </Card>
            <Card className="gradient-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">
                  {taxReports.length > 0 ? formatCurrency(taxReports[0]?.total_volume_eur || 0) : '€0'}
                </div>
                <div className="text-sm text-muted-foreground">Handelsvolumen</div>
              </CardContent>
            </Card>
            <Card className="gradient-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning">
                  {taxReports.length > 0 ? formatCurrency(taxReports[0]?.total_profit_eur || 0) : '€0'}
                </div>
                <div className="text-sm text-muted-foreground">Gesamtgewinn</div>
              </CardContent>
            </Card>
            <Card className="gradient-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent">
                  {taxReports.length > 0 ? formatCurrency(taxReports[0]?.tax_liability_eur || 0) : '€0'}
                </div>
                <div className="text-sm text-muted-foreground">Steuerlast</div>
              </CardContent>
            </Card>
          </div>

          {/* Aktueller Report */}
          {taxReports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Aktueller Steuer-Report {selectedYear}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-success">Gewinne & Verluste</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Gesamtgewinn:</span>
                          <span className="font-medium text-success">
                            {formatCurrency(taxReports[0].total_profit_eur)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Gesamtverlust:</span>
                          <span className="font-medium text-destructive">
                            {formatCurrency(taxReports[0].total_loss_eur)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-primary">Trading-Statistiken</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Anzahl Trades:</span>
                          <span className="font-medium">{taxReports[0].total_trades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Gesamtvolumen:</span>
                          <span className="font-medium">
                            {formatCurrency(taxReports[0].total_volume_eur)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Geschätzte Steuerlast:</span>
                      <span className="text-warning">
                        {formatCurrency(taxReports[0].tax_liability_eur)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg mt-4">
                    <p className="text-sm text-muted-foreground">
                      <strong>Hinweis:</strong> Diese Berechnung basiert auf der deutschen Steuergesetzgebung. 
                      Für die finale Steuererklärung konsultieren Sie bitte einen Steuerberater.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Steuerbericht-Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => downloadReport('pdf')}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  PDF Bericht
                  <span className="text-xs text-muted-foreground">Für Finanzamt</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => downloadReport('xlsx')}
                >
                  <Download className="h-6 w-6 mb-2" />
                  Excel Export
                  <span className="text-xs text-muted-foreground">Für Steuerberater</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => downloadReport('csv')}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  CSV Export
                  <span className="text-xs text-muted-foreground">Für eigene Auswertung</span>
                </Button>
              </div>

              {/* Verfügbare Reports */}
              <div className="space-y-4">
                <h4 className="font-medium">Verfügbare Steuer-Reports:</h4>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Jahr</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead>Trades</TableHead>
                        <TableHead>Volumen</TableHead>
                        <TableHead>Gewinn</TableHead>
                        <TableHead>Verlust</TableHead>
                        <TableHead>Steuerlast</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taxReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>{report.report_year}</TableCell>
                          <TableCell className="capitalize">{report.report_type}</TableCell>
                          <TableCell>{report.total_trades}</TableCell>
                          <TableCell>{formatCurrency(report.total_volume_eur)}</TableCell>
                          <TableCell className="text-success">
                            {formatCurrency(report.total_profit_eur)}
                          </TableCell>
                          <TableCell className="text-destructive">
                            {formatCurrency(report.total_loss_eur)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(report.tax_liability_eur)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={report.status === 'generated' ? 'default' : 'secondary'}>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {report.status === 'generated' ? 'Verfügbar' : report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => downloadReport('pdf')}>
                                <Download className="h-4 w-4 mr-2" />
                                PDF
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => downloadReport('csv')}>
                                <Download className="h-4 w-4 mr-2" />
                                CSV
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Steuer-Einstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Steuerliche Behandlung</h4>
                  <Select defaultValue="private">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Privatvermögen (Abgeltungssteuer)</SelectItem>
                      <SelectItem value="business">Gewerblich (Einkommensteuer)</SelectItem>
                      <SelectItem value="speculation">Spekulationsgeschäft</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Bestimmt die steuerliche Behandlung Ihrer Krypto-Trades
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Freibetrag</h4>
                  <Select defaultValue="801">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="801">801 € (Einzelperson)</SelectItem>
                      <SelectItem value="1602">1.602 € (Verheiratet)</SelectItem>
                      <SelectItem value="0">Kein Freibetrag</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sparerpauschbetrag für Kapitalerträge
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Berechnungsmethode</h4>
                  <Select defaultValue="fifo">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fifo">FIFO (First In, First Out)</SelectItem>
                      <SelectItem value="lifo">LIFO (Last In, First Out)</SelectItem>
                      <SelectItem value="specific">Spezifische Identifikation</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Methode zur Gewinn-/Verlustberechnung bei Verkäufen
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}