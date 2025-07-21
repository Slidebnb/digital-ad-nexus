
import { useState, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CryptoDashboardErrorBoundary } from "@/components/CryptoDashboardErrorBoundary";
import { LazyLoadingWrapper } from "@/components/LazyLoadingWrapper";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useCryptoPaymentsRealtime } from "@/hooks/useCryptoPaymentsRealtime";
import { 
  Coins, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  Radio,
  AlertTriangle
} from "lucide-react";

// Lazy load heavy components
const CryptoHubSolanaPayment = React.lazy(() => 
  import("@/components/CryptoHubSolanaPayment").then(module => ({ 
    default: module.CryptoHubSolanaPayment 
  })).catch(error => {
    console.error('Failed to load CryptoHubSolanaPayment:', error);
    return { default: () => <div>Component konnte nicht geladen werden</div> };
  })
);

const PaymentHistoryModal = React.lazy(() => 
  import("@/components/PaymentHistoryModal").then(module => ({ 
    default: module.PaymentHistoryModal 
  })).catch(error => {
    console.error('Failed to load PaymentHistoryModal:', error);
    return { default: ({ children }: { children: React.ReactNode }) => <>{children}</> };
  })
);

export function CryptoDashboardSection() {
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'boost' | 'premium'>('boost');
  
  // Hook usage with error handling
  const { 
    prices, 
    loading: pricesLoading, 
    getCryptoSymbol,
    error: pricesError 
  } = useCryptoPrices();
  
  const { 
    payments, 
    getPendingPayments, 
    getConfirmedPayments, 
    error: paymentsError 
  } = useCryptoPaymentsRealtime();

  // Error handling
  if (pricesError || paymentsError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Krypto-Daten konnten nicht geladen werden: {pricesError || paymentsError}
          <Button variant="outline" size="sm" className="ml-2" onClick={() => window.location.reload()}>
            Neu laden
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const getSolanaAmount = (mode: string) => {
    const eurAmounts = { boost: 29.99, premium: 99.99 };
    const solPrice = prices.SOL?.price_eur || 150;
    return {
      sol: eurAmounts[mode as keyof typeof eurAmounts] / solPrice,
      eur: eurAmounts[mode as keyof typeof eurAmounts]
    };
  };

  // Nur echte Zahlungen für Boost und Premium
  const pendingPayments = getPendingPayments().filter(p => 
    p.payment_type === 'boost' || p.payment_type === 'premium'
  );
  const confirmedPayments = getConfirmedPayments().filter(p => 
    p.payment_type === 'boost' || p.payment_type === 'premium'
  );
  const totalServiceVolume = confirmedPayments.reduce((sum, p) => sum + (p.amount_eur || 0), 0);

  return (
    <CryptoDashboardErrorBoundary>
      <div className="space-y-6">
        {/* Service Payment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Service Ausgaben</p>
                  <p className="text-2xl font-bold">€{totalServiceVolume.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Boost & Premium</p>
                </div>
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Erfolgreiche Zahlungen</p>
                  <p className="text-2xl font-bold">{confirmedPayments.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ausstehend</p>
                  <p className="text-2xl font-bold">{pendingPayments.length}</p>
                </div>
                <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SOL Kurs für Zahlungen */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              SOL Kurs
              <div className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full animate-pulse ml-auto">
                <Radio className="h-3 w-3" />
                LIVE
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pricesLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {getCryptoSymbol('SOL') || 'SOL'}
                  </div>
                  <div>
                    <div className="font-medium">Solana (SOL)</div>
                    <div className="text-sm text-muted-foreground">
                      Für Boost & Premium Zahlungen
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">
                    €{prices.SOL?.price_eur?.toFixed(2) || '0.00'}
                  </div>
                  {prices.SOL?.change_24h && (
                    <div className={`flex items-center gap-1 text-sm ${
                      prices.SOL.change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {prices.SOL.change_24h >= 0 ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {prices.SOL.change_24h >= 0 ? '+' : ''}{prices.SOL.change_24h.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SOL Payment Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Mode Selection */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                SOL Zahlung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant={selectedPaymentMode === 'boost' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setSelectedPaymentMode('boost')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    B
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">Anzeige Boosten</div>
                    <div className="text-xs text-muted-foreground">€29.99</div>
                  </div>
                </div>
              </Button>
              
              <Button
                variant={selectedPaymentMode === 'premium' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setSelectedPaymentMode('premium')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    P
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">Premium Features</div>
                    <div className="text-xs text-muted-foreground">€99.99</div>
                  </div>
                </div>
              </Button>

              <LazyLoadingWrapper>
                <PaymentHistoryModal>
                  <Button variant="outline" className="w-full">
                    <Clock className="h-4 w-4 mr-2" />
                    Zahlungshistorie
                  </Button>
                </PaymentHistoryModal>
              </LazyLoadingWrapper>
            </CardContent>
          </Card>

          {/* Active Payment */}
          <ErrorBoundary>
            <LazyLoadingWrapper>
              <CryptoHubSolanaPayment
                mode={selectedPaymentMode}
                amount={getSolanaAmount(selectedPaymentMode)}
                onPaymentComplete={() => {
                  console.log(`${selectedPaymentMode} payment completed`);
                }}
              />
            </LazyLoadingWrapper>
          </ErrorBoundary>
        </div>
      </div>
    </CryptoDashboardErrorBoundary>
  );
}
