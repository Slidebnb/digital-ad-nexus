import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CryptoWalletManager } from "@/components/CryptoWalletManager";
import { PaymentHistoryModal } from "@/components/PaymentHistoryModal";
import { CryptoPaymentModal } from "@/components/CryptoPaymentModal";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
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
  CheckCircle
} from "lucide-react";

export default function CryptoHub() {
  const { user, loading: authLoading } = useAuth();
  const { prices, loading: pricesLoading, getCryptoSymbol } = useCryptoPrices();
  const { wallets, connections } = useCryptoWallet();
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const supportedCryptos = ['SOL', 'BTC', 'ETH'];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Crypto Hub</h1>
            <p className="text-muted-foreground">
              Verwalten Sie Ihre Kryptowährungen, Wallets und Zahlungen
            </p>
          </div>
          <div className="flex gap-3">
            <PaymentHistoryModal>
              <Button variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Zahlungshistorie
              </Button>
            </PaymentHistoryModal>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="prices">Kurse</TabsTrigger>
            <TabsTrigger value="wallets">Wallets</TabsTrigger>
            <TabsTrigger value="payments">Zahlungen</TabsTrigger>
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

              <Card className="gradient-card cursor-pointer hover:shadow-lg transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Anzeige boosten</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Erhöhen Sie die Sichtbarkeit Ihrer Anzeigen mit Crypto
                  </p>
                  <Button variant="outline" className="w-full">
                    Jetzt boosten
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

          {/* Prices Tab */}
          <TabsContent value="prices" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Live Kryptowährungs-Kurse
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
                        <div key={crypto} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                              crypto === 'BTC' ? 'bg-orange-500' :
                              crypto === 'ETH' ? 'bg-blue-500' :
                              'bg-purple-500'
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

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Zahlungshistorie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Verwalten Sie Ihre Crypto-Zahlungen und Transaktionshistorie
                  </p>
                  <PaymentHistoryModal>
                    <Button className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Zahlungshistorie anzeigen
                    </Button>
                  </PaymentHistoryModal>
                </CardContent>
              </Card>
              
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Test-Zahlung
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Testen Sie das Crypto-Payment-System mit einer Demo-Zahlung
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    Test-Zahlung starten
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

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
    </div>
  );
}