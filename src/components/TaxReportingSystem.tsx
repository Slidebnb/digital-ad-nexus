import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  FileText, 
  Download, 
  Calculator, 
  TrendingUp, 
  TrendingDown,
  Calendar as CalendarIcon,
  Euro,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface TaxReportData {
  year: number;
  totalTrades: number;
  totalVolume: number;
  totalProfit: number;
  totalLoss: number;
  netResult: number;
  taxableGains: number;
  estimatedTax: number;
}

interface TradeForTax {
  id: string;
  date: string;
  type: 'buy' | 'sell';
  coin: string;
  amount: number;
  priceEur: number;
  totalEur: number;
  feesEur: number;
  profitLoss?: number;
  taxRelevant: boolean;
}

export function TaxReportingSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<TaxReportData | null>(null);
  const [trades, setTrades] = useState<TradeForTax[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(selectedYear, 0, 1),
    to: new Date(selectedYear, 11, 31)
  });

  // Mock Daten für Demo
  const mockReportData: TaxReportData = {
    year: selectedYear,
    totalTrades: 47,
    totalVolume: 125430.50,
    totalProfit: 8750.30,
    totalLoss: 2140.80,
    netResult: 6609.50,
    taxableGains: 6609.50,
    estimatedTax: 1652.38 // 25% Abgeltungssteuer
  };

  const mockTrades: TradeForTax[] = [
    {
      id: '1',
      date: '2024-01-15',
      type: 'sell',
      coin: 'BTC',
      amount: 0.5,
      priceEur: 42000,
      totalEur: 21000,
      feesEur: 25.00,
      profitLoss: 2500.00,
      taxRelevant: true
    },
    {
      id: '2',
      date: '2024-01-10', 
      type: 'buy',
      coin: 'BTC',
      amount: 0.5,
      priceEur: 37000,
      totalEur: 18500,
      feesEur: 22.50,
      taxRelevant: true
    },
    {
      id: '3',
      date: '2024-02-20',
      type: 'sell',
      coin: 'ETH',
      amount: 5.0,
      priceEur: 2800,
      totalEur: 14000,
      feesEur: 18.00,
      profitLoss: 1200.00,
      taxRelevant: true
    }
  ];

  useEffect(() => {
    // Simuliere API-Aufruf
    setTimeout(() => {
      setReportData(mockReportData);
      setTrades(mockTrades);
      setLoading(false);
    }, 1000);
  }, [selectedYear]);

  const generateTaxReport = async (format: 'pdf' | 'csv' | 'xlsx') => {
    try {
      // Hier würde normalerweise ein API-Aufruf stattfinden
      toast({
        title: "Steuerbericht wird erstellt",
        description: `Ihr ${format.toUpperCase()}-Report für ${selectedYear} wird vorbereitet.`,
      });
      
      // Simuliere Download nach 2 Sekunden
      setTimeout(() => {
        toast({
          title: "Download bereit",
          description: `Steuerbericht-${selectedYear}.${format} wurde erstellt.`,
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Steuerbericht konnte nicht erstellt werden.",
        variant: "destructive"
      });
    }
  };

  const exportForTaxAdvisor = () => {
    generateTaxReport('xlsx');
  };

  const getTradeStatusBadge = (taxRelevant: boolean) => {
    return taxRelevant ? (
      <Badge variant="default" className="bg-warning text-warning-foreground">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Steuerrelevant
      </Badge>
    ) : (
      <Badge variant="secondary">
        <CheckCircle className="h-3 w-3 mr-1" />
        Nicht steuerrelevant
      </Badge>
    );
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
      {/* Header mit Jahr-Auswahl */}
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
              <Button onClick={exportForTaxAdvisor}>
                <FileText className="h-4 w-4 mr-2" />
                Für Steuerberater exportieren
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="trades">Handel-Details</TabsTrigger>
          <TabsTrigger value="reports">Berichte</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {reportData && (
            <>
              {/* Steuer-Übersicht Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="gradient-card">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{reportData.totalTrades}</div>
                    <div className="text-sm text-muted-foreground">Trades gesamt</div>
                  </CardContent>
                </Card>
                <Card className="gradient-card">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-success">{formatCurrency(reportData.totalVolume)}</div>
                    <div className="text-sm text-muted-foreground">Handelsvolumen</div>
                  </CardContent>
                </Card>
                <Card className="gradient-card">
                  <CardContent className="p-4 text-center">
                    <div className={`text-2xl font-bold ${reportData.netResult >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(reportData.netResult)}
                    </div>
                    <div className="text-sm text-muted-foreground">Netto-Ergebnis</div>
                  </CardContent>
                </Card>
                <Card className="gradient-card">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-warning">{formatCurrency(reportData.estimatedTax)}</div>
                    <div className="text-sm text-muted-foreground">Geschätzte Steuer</div>
                  </CardContent>
                </Card>
              </div>

              {/* Detaillierte Steuerberechnung */}
              <Card>
                <CardHeader>
                  <CardTitle>Steuerberechnung {selectedYear}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium text-success">Gewinne</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Realisierte Gewinne:</span>
                            <span className="font-medium text-success">{formatCurrency(reportData.totalProfit)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-destructive">Verluste</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Realisierte Verluste:</span>
                            <span className="font-medium text-destructive">-{formatCurrency(reportData.totalLoss)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-lg font-medium">
                        <span>Steuerpflichtiger Gewinn:</span>
                        <span className={reportData.taxableGains >= 0 ? 'text-success' : 'text-destructive'}>
                          {formatCurrency(reportData.taxableGains)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Abgeltungssteuer (25%):</span>
                        <span className="text-warning">{formatCurrency(reportData.estimatedTax)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-lg mt-4">
                      <p className="text-sm text-muted-foreground">
                        <strong>Hinweis:</strong> Diese Berechnung ist eine Schätzung. 
                        Für die finale Steuererklärung konsultieren Sie bitte einen Steuerberater.
                        Kryptowährungsgewinne unterliegen in Deutschland der Abgeltungssteuer von 25% + Solidaritätszuschlag.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Trades Tab */}
        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Handel-Details für Steuererklärung</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Coin</TableHead>
                      <TableHead>Menge</TableHead>
                      <TableHead>Preis (€)</TableHead>
                      <TableHead>Gesamt (€)</TableHead>
                      <TableHead>Gebühren (€)</TableHead>
                      <TableHead>Gewinn/Verlust</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trades.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell>{formatDate(trade.date)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {trade.type === 'buy' ? (
                              <TrendingUp className="h-4 w-4 text-success" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-destructive" />
                            )}
                            <span className="capitalize">{trade.type === 'buy' ? 'Kauf' : 'Verkauf'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{trade.coin}</TableCell>
                        <TableCell>{trade.amount}</TableCell>
                        <TableCell>{formatCurrency(trade.priceEur)}</TableCell>
                        <TableCell>{formatCurrency(trade.totalEur)}</TableCell>
                        <TableCell>{formatCurrency(trade.feesEur)}</TableCell>
                        <TableCell>
                          {trade.profitLoss ? (
                            <span className={trade.profitLoss >= 0 ? 'text-success font-medium' : 'text-destructive font-medium'}>
                              {trade.profitLoss >= 0 ? '+' : ''}{formatCurrency(trade.profitLoss)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getTradeStatusBadge(trade.taxRelevant)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
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
                  onClick={() => generateTaxReport('pdf')}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  PDF Bericht
                  <span className="text-xs text-muted-foreground">Für Finanzamt</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => generateTaxReport('xlsx')}
                >
                  <Download className="h-6 w-6 mb-2" />
                  Excel Export
                  <span className="text-xs text-muted-foreground">Für Steuerberater</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => generateTaxReport('csv')}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  CSV Export
                  <span className="text-xs text-muted-foreground">Für eigene Auswertung</span>
                </Button>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Verfügbare Berichte:</h4>
                <div className="space-y-2">
                  {[
                    { name: 'Jahresbericht 2024', date: '2024-12-31', type: 'Vollständig' },
                    { name: 'Q4 2024 Bericht', date: '2024-12-31', type: 'Quartalsweise' },
                    { name: 'Jahresbericht 2023', date: '2023-12-31', type: 'Vollständig' }
                  ].map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h5 className="font-medium">{report.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {report.type} • Erstellt am {formatDate(report.date)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
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
                  <h4 className="font-medium mb-2">FIFO/LIFO Methode</h4>
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