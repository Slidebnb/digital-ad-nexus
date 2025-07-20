import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CryptoWalletManager } from "@/components/CryptoWalletManager";
import { PaymentHistoryModal } from "@/components/PaymentHistoryModal";
import { CryptoPaymentModal } from "@/components/CryptoPaymentModal";
import { CryptoAnalyticsDashboard } from "@/components/CryptoAnalyticsDashboard";
import { CryptoHubSolanaPayment } from "@/components/CryptoHubSolanaPayment";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useCryptoWallet } from "@/hooks/useCryptoWallet";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  BarChart3,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  Radio,
  Bell,
  Zap
} from "lucide-react";

export default function CryptoHub() {
  const { user, loading: authLoading } = useAuth();
  const { prices, loading: pricesLoading, getCryptoSymbol } = useCryptoPrices();
  const { wallets, connections } = useCryptoWallet();
  const { unreadCount } = useRealtimeNotifications();
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [solanaPaymentMode, setSolanaPaymentMode] = useState<'test' | 'boost' | 'premium'>('test');

  if (authLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const supportedCryptos = ['SOL', 'BTC', 'ETH'];

  const getSolanaAmount = (mode: string) => {
    const eurAmounts = { test: 9.99, boost: 29.99, premium: 99.99 };
    const solPrice = prices.SOL?.price_eur || 150; // Fallback price
    return {
      sol: eurAmounts[mode as keyof typeof eurAmounts] / solPrice,
      eur: eurAmounts[mode as keyof typeof eurAmounts]
    };
  };

  return (
    <PageLayout className="container mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold mb-2">Crypto Hub</h1>
            <div className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full animate-pulse">
              <Radio className="h-3 w-3" />
              LIVE
            </div>
          </div>
          <p className="text-muted-foreground">
            Echtzeit-Verwaltung Ihrer Kryptowährungen, Wallets und Zahlungen
          </p>
        </div>
        <div className="flex gap-3">
          <PaymentHistoryModal>
            <Button variant="outline" className="relative">
              <Clock className="h-4 w-4 mr-2" />
              Zahlungshistorie
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PaymentHistoryModal>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="payments">SOL Zahlung</TabsTrigger>
          <TabsTrigger value="prices">Kurse</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Connected Wallets Overview */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Verbundene Wallets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {supportedCryptos.map((crypto) => {
                  const connection = connections[crypto];
                  const price = prices[crypto];
                  
                  return (
                    <Card key={crypto} className={`transition-all hover:shadow-md ${connection?.connected ? 'border-green-200 bg-green-50/30' : 'border-muted'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                              crypto === 'BTC' ? 'bg-orange-500' :
                              crypto === 'ETH' ? 'bg-blue-500' :
                              'bg-purple-500'
                            }`}>
                              {getCryptoSymbol(crypto) || crypto}
                            </div>
                            <div>
                              <div className="font-medium">{crypto}</div>
                              {price && (
                                <div className="text-sm text-muted-foreground">
                                  €{price.price_eur.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                          {connection?.connected ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Verbunden
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              Nicht verbunden
                            </Badge>
                          )}
                        </div>
                        
                        {connection?.connected && (
                          <div className="text-xs font-mono text-muted-foreground mb-3">
                            {connection.address.slice(0, 6)}...{connection.address.slice(-4)}
                          </div>
                        )}

                        {price?.change_24h && (
                          <div className={`flex items-center gap-1 text-sm ${
                            price.change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {price.change_24h >= 0 ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3" />
                            )}
                            {price.change_24h >= 0 ? '+' : ''}{price.change_24h.toFixed(2)}% (24h)
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="gradient-card cursor-pointer hover:shadow-lg transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Wallet verbinden</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Verbinden Sie Ihre Crypto-Wallets für einfache Zahlungen
                </p>
                <Button variant="outline" className="w-full">
                  Wallet hinzufügen
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="gradient-card cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setSolanaPaymentMode('boost')}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">SOL Zahlung</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Direkte Solana-Zahlungen mit QR-Code
                </p>
                <Button variant="outline" className="w-full">
                  SOL zahlen
                </Button>
              </CardContent>
            </Card>

            <Card className="gradient-card cursor-pointer hover:shadow-lg transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Zahlungshistorie</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Verwalten Sie Ihre Transaktionen und Zahlungen
                </p>
                <PaymentHistoryModal>
                  <Button variant="outline" className="w-full">
                    Historie anzeigen
                  </Button>
                </PaymentHistoryModal>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SOL Payment Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Mode Selection */}
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Zahlungsmodus wählen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant={solanaPaymentMode === 'test' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSolanaPaymentMode('test')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      T
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Test-Zahlung</div>
                      <div className="text-sm text-muted-foreground">€9.99 Demo</div>
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant={solanaPaymentMode === 'boost' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSolanaPaymentMode('boost')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      B
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Anzeige Boosten</div>
                      <div className="text-sm text-muted-foreground">€29.99</div>
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant={solanaPaymentMode === 'premium' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSolanaPaymentMode('premium')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      P
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Premium Features</div>
                      <div className="text-sm text-muted-foreground">€99.99</div>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Active Payment */}
            <CryptoHubSolanaPayment
              mode={solanaPaymentMode}
              amount={getSolanaAmount(solanaPaymentMode)}
              onPaymentComplete={() => {
                console.log(`${solanaPaymentMode} payment completed`);
              }}
            />
          </div>
        </TabsContent>

        {/* Prices Tab */}
        <TabsContent value="prices" className="space-y-6">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Live Kryptowährungs-Kurse
                <div className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full animate-pulse ml-auto">
                  <Radio className="h-3 w-3" />
                  LIVE
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pricesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {supportedCryptos.map((crypto) => {
                    const price = prices[crypto];
                    if (!price) return null;
                    
                    return (
                      <div key={crypto} className="flex items-center justify-between p-4 border rounded-lg hover-scale transition-all animate-fade-in">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            crypto === 'BTC' ? 'bg-orange-500 animate-pulse' :
                            crypto === 'ETH' ? 'bg-blue-500 animate-pulse' :
                            'bg-purple-500 animate-pulse'
                          }`}>
                            {getCryptoSymbol(crypto) || crypto}
                          </div>
                          <div>
                            <div className="font-medium">{crypto}</div>
                            <div className="text-sm text-muted-foreground">
                              Market Cap: €{price.market_cap?.toLocaleString() || 'N/A'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold animate-pulse text-primary">
                            €{price.price_eur.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${price.price_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        
                        {price.change_24h && (
                          <div className={`flex items-center gap-1 animate-fade-in ${
                            price.change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {price.change_24h >= 0 ? (
                              <TrendingUp className="h-4 w-4 animate-bounce" />
                            ) : (
                              <TrendingDown className="h-4 w-4 animate-bounce" />
                            )}
                            <span className="font-medium">
                              {price.change_24h >= 0 ? '+' : ''}{price.change_24h.toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallets Tab */}
        <TabsContent value="wallets">
          <CryptoWalletManager />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <CryptoAnalyticsDashboard />
        </TabsContent>
      </Tabs>

      {/* Test Payment Modal */}
      <CryptoPaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        paymentType="boost"
        eurAmount={9.99}
        title="Test Crypto-Zahlung"
        description="Demo-Zahlung zum Testen des Systems"
        onPaymentComplete={(paymentId) => {
          console.log('Payment completed:', paymentId);
          setShowPaymentModal(false);
        }}
      />
    </PageLayout>
  );
}
