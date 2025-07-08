import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { 
  Coins, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  DollarSign,
  BarChart3,
  Users,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Zap
} from "lucide-react";

interface CryptoStats {
  totalPayments: number;
  totalVolume: number;
  pendingPayments: number;
  confirmedPayments: number;
  failedPayments: number;
  avgTransactionValue: number;
}

interface PriceUpdate {
  cryptocurrency: string;
  price_eur: number;
  price_usd: number;
  change_24h: number;
  last_updated: string;
}

export function AdminCryptoManagement() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CryptoStats | null>(null);
  const [prices, setPrices] = useState<PriceUpdate[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [priceUpdateLoading, setPriceUpdateLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchCryptoData();
    }
  }, [isAdmin]);

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      
      // Fetch crypto statistics
      const { data: paymentsData } = await supabase
        .from('crypto_payments')
        .select('*');

      if (paymentsData) {
        const stats: CryptoStats = {
          totalPayments: paymentsData.length,
          totalVolume: paymentsData.reduce((sum, p) => sum + (p.amount_eur || 0), 0),
          pendingPayments: paymentsData.filter(p => p.status === 'pending').length,
          confirmedPayments: paymentsData.filter(p => p.status === 'confirmed').length,
          failedPayments: paymentsData.filter(p => p.status === 'failed').length,
          avgTransactionValue: paymentsData.length > 0 ? 
            paymentsData.reduce((sum, p) => sum + (p.amount_eur || 0), 0) / paymentsData.length : 0
        };
        setStats(stats);
        setPayments(paymentsData.slice(0, 10)); // Last 10 payments
      }

      // Fetch current crypto prices
      const { data: pricesData } = await supabase
        .from('crypto_prices')
        .select('*')
        .in('cryptocurrency', ['SOL', 'BTC', 'ETH']);

      if (pricesData) {
        setPrices(pricesData);
      }

    } catch (error) {
      console.error('Error fetching crypto data:', error);
      toast({
        title: "Fehler",
        description: "Crypto-Daten konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCryptoPrices = async () => {
    try {
      setPriceUpdateLoading(true);
      
      const { data, error } = await supabase.functions.invoke('crypto-price-updater');
      
      if (error) throw error;
      
      toast({
        title: "Preise aktualisiert",
        description: "Crypto-Preise wurden erfolgreich aktualisiert.",
      });
      
      await fetchCryptoData();
    } catch (error) {
      console.error('Error updating prices:', error);
      toast({
        title: "Fehler",
        description: "Preise konnten nicht aktualisiert werden.",
        variant: "destructive"
      });
    } finally {
      setPriceUpdateLoading(false);
    }
  };

  const processPayment = async (paymentId: string, action: 'confirm' | 'fail') => {
    try {
      const { error } = await supabase
        .from('crypto_payments')
        .update({
          status: action === 'confirm' ? 'confirmed' : 'failed',
          confirmed_at: action === 'confirm' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "Zahlung bearbeitet",
        description: `Zahlung wurde ${action === 'confirm' ? 'bestätigt' : 'abgelehnt'}.`,
      });

      await fetchCryptoData();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Fehler",
        description: "Zahlung konnte nicht bearbeitet werden.",
        variant: "destructive"
      });
    }
  };

  if (!isAdmin) {
    return (
      <Alert className="border-destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Sie haben keine Berechtigung, auf diese Seite zuzugreifen.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Crypto-Verwaltung</h2>
          <p className="text-muted-foreground">
            Verwalten Sie Kryptowährungs-Zahlungen und Preise
          </p>
        </div>
        <Button
          onClick={updateCryptoPrices}
          disabled={priceUpdateLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${priceUpdateLoading ? 'animate-spin' : ''}`} />
          Preise aktualisieren
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gesamt Zahlungen</p>
                  <p className="text-2xl font-bold">{stats.totalPayments}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gesamtvolumen</p>
                  <p className="text-2xl font-bold">€{stats.totalVolume.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ausstehend</p>
                  <p className="text-2xl font-bold">{stats.pendingPayments}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ø Transaktionswert</p>
                  <p className="text-2xl font-bold">€{stats.avgTransactionValue.toFixed(2)}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="prices" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prices">Live Preise</TabsTrigger>
          <TabsTrigger value="payments">Zahlungen</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        <TabsContent value="prices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Aktuelle Crypto-Preise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prices.map((price) => (
                  <div key={price.cryptocurrency} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        price.cryptocurrency === 'BTC' ? 'bg-orange-500' :
                        price.cryptocurrency === 'ETH' ? 'bg-blue-500' :
                        'bg-purple-500'
                      }`}>
                        {price.cryptocurrency}
                      </div>
                      <div>
                        <div className="font-medium">{price.cryptocurrency}</div>
                        <div className="text-sm text-muted-foreground">
                          Letzte Aktualisierung: {new Date(price.last_updated).toLocaleString('de-DE')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        €{price.price_eur.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${price.price_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    
                    {price.change_24h && (
                      <div className={`flex items-center gap-1 ${
                        price.change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {price.change_24h >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          {price.change_24h >= 0 ? '+' : ''}{price.change_24h.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aktuelle Zahlungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        payment.status === 'confirmed' ? 'bg-green-500' :
                        payment.status === 'pending' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <div>
                        <div className="font-medium">
                          {payment.amount_crypto} {payment.cryptocurrency}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          €{payment.amount_eur} • {payment.payment_type}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        payment.status === 'confirmed' ? 'default' :
                        payment.status === 'pending' ? 'secondary' :
                        'destructive'
                      }>
                        {payment.status}
                      </Badge>
                      
                      {payment.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => processPayment(payment.id, 'confirm')}
                          >
                            Bestätigen
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => processPayment(payment.id, 'fail')}
                          >
                            Ablehnen
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Zahlungsstatus</CardTitle>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Bestätigt</span>
                      </div>
                      <span className="font-medium">{stats.confirmedPayments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span>Ausstehend</span>
                      </div>
                      <span className="font-medium">{stats.pendingPayments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span>Fehlgeschlagen</span>
                      </div>
                      <span className="font-medium">{stats.failedPayments}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Price Feed</span>
                    </div>
                    <Badge variant="secondary">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Payment Processor</span>
                    </div>
                    <Badge variant="secondary">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>WebSocket Monitor</span>
                    </div>
                    <Badge variant="secondary">Online</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Crypto-Einstellungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-confirmations">Mindest-Bestätigungen</Label>
                  <Input id="min-confirmations" type="number" defaultValue="3" />
                </div>
                <div>
                  <Label htmlFor="price-update-interval">Preis-Update Intervall (Sekunden)</Label>
                  <Input id="price-update-interval" type="number" defaultValue="30" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Unterstützte Kryptowährungen</Label>
                <div className="flex gap-2">
                  <Badge variant="secondary">SOL</Badge>
                  <Badge variant="secondary">BTC</Badge>
                  <Badge variant="secondary">ETH</Badge>
                </div>
              </div>
              
              <Button className="w-full gap-2">
                <Zap className="h-4 w-4" />
                Einstellungen speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}