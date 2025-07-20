import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CryptoHubSolanaPayment } from "@/components/CryptoHubSolanaPayment";
import { PaymentHistoryModal } from "@/components/PaymentHistoryModal";
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
  Radio
} from "lucide-react";

export function CryptoDashboardSection() {
  const { prices, loading: pricesLoading, getCryptoSymbol } = useCryptoPrices();
  const { payments, getPendingPayments, getConfirmedPayments, getTotalVolume } = useCryptoPaymentsRealtime();
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'boost' | 'premium'>('boost');

  const supportedCryptos = ['SOL', 'BTC', 'ETH'];

  const getSolanaAmount = (mode: string) => {
    const eurAmounts = { boost: 29.99, premium: 99.99 };
    const solPrice = prices.SOL?.price_eur || 150;
    return {
      sol: eurAmounts[mode as keyof typeof eurAmounts] / solPrice,
      eur: eurAmounts[mode as keyof typeof eurAmounts]
    };
  };

  const pendingPayments = getPendingPayments();
  const confirmedPayments = getConfirmedPayments();
  const totalVolume = getTotalVolume();

  return (
    <div className="space-y-6">
      {/* Crypto Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt Volumen</p>
                <p className="text-2xl font-bold">€{totalVolume.toFixed(2)}</p>
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
                <p className="text-sm text-muted-foreground">Bestätigte Zahlungen</p>
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

      {/* Live Crypto Prices */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Live Krypto-Kurse
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {supportedCryptos.map((crypto) => {
                const price = prices[crypto];
                if (!price) return null;
                
                return (
                  <div key={crypto} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        crypto === 'BTC' ? 'bg-orange-500' :
                        crypto === 'ETH' ? 'bg-blue-500' :
                        'bg-purple-500'
                      }`}>
                        {getCryptoSymbol(crypto) || crypto}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{crypto}</div>
                        <div className="text-xs text-muted-foreground">
                          €{price.price_eur.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    {price.change_24h && (
                      <div className={`flex items-center gap-1 text-xs ${
                        price.change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {price.change_24h >= 0 ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {price.change_24h >= 0 ? '+' : ''}{price.change_24h.toFixed(1)}%
                      </div>
                    )}
                  </div>
                );
              })}
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

            <PaymentHistoryModal>
              <Button variant="outline" className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                Zahlungshistorie
              </Button>
            </PaymentHistoryModal>
          </CardContent>
        </Card>

        {/* Active Payment */}
        <CryptoHubSolanaPayment
          mode={selectedPaymentMode}
          amount={getSolanaAmount(selectedPaymentMode)}
          onPaymentComplete={() => {
            console.log(`${selectedPaymentMode} payment completed`);
          }}
        />
      </div>
    </div>
  );
}