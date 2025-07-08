import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useCryptoWallet } from "@/hooks/useCryptoWallet";
import { useCryptoPayments } from "@/hooks/useCryptoPayments";
import { WalletConnectModal } from "./WalletConnectModal";
import { QRCodeGenerator } from "./QRCodeGenerator";
import { 
  TrendingUp, 
  Wallet, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Smartphone,
  Copy,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CryptoPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentType: 'boost' | 'premium' | 'escrow';
  eurAmount: number;
  title: string;
  description: string;
  onPaymentComplete?: (paymentId: string) => void;
  adId?: string;
  packageId?: number;
  subscriptionId?: string;
}

export function CryptoPaymentModal({
  open,
  onOpenChange,
  paymentType,
  eurAmount,
  title,
  description,
  onPaymentComplete,
  adId,
  packageId,
  subscriptionId
}: CryptoPaymentModalProps) {
  const { prices, loading: pricesLoading, convertEurToCrypto, formatCryptoAmount, getCryptoSymbol } = useCryptoPrices();
  const { connections, getWallet } = useCryptoWallet();
  const { processBoostPayment, processPremiumPayment, loading: paymentLoading } = useCryptoPayments();
  
  const [selectedCrypto, setSelectedCrypto] = useState<string>("");
  const [paymentStep, setPaymentStep] = useState<'select' | 'confirm' | 'processing' | 'success' | 'failed'>('select');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes

  const availableCryptos = ['SOL', 'BTC', 'ETH'].filter(crypto => 
    connections[crypto]?.connected && prices[crypto]
  );

  useEffect(() => {
    if (paymentStep === 'processing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [paymentStep, timeLeft]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCryptoSelect = (crypto: string) => {
    setSelectedCrypto(crypto);
    setPaymentStep('confirm');
  };

  const handlePaymentConfirm = async () => {
    if (!selectedCrypto) return;

    const wallet = getWallet(selectedCrypto);
    if (!wallet) {
      toast({
        title: "Wallet nicht gefunden",
        description: "Bitte verbinden Sie erst Ihre Wallet.",
        variant: "destructive"
      });
      return;
    }

    const cryptoAmount = convertEurToCrypto(eurAmount, selectedCrypto);
    const exchangeRate = prices[selectedCrypto]?.price_eur || 0;

    setPaymentStep('processing');

    try {
      let paymentId: string | null = null;

      if (paymentType === 'boost' && adId && packageId) {
        paymentId = await processBoostPayment(
          adId,
          packageId,
          selectedCrypto,
          wallet.wallet_address,
          cryptoAmount,
          eurAmount,
          exchangeRate
        );
      } else if (paymentType === 'premium' && subscriptionId) {
        paymentId = await processPremiumPayment(
          subscriptionId,
          'premium',
          selectedCrypto,
          wallet.wallet_address,
          cryptoAmount,
          eurAmount,
          exchangeRate
        );
      }

      if (paymentId) {
        setPaymentId(paymentId);
        // Simulate payment processing
        setTimeout(() => {
          setPaymentStep('success');
          onPaymentComplete?.(paymentId);
        }, 5000);
      } else {
        setPaymentStep('failed');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentStep('failed');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopiert!",
      description: "Text wurde in die Zwischenablage kopiert.",
    });
  };

  const resetPayment = () => {
    setPaymentStep('select');
    setSelectedCrypto("");
    setPaymentId(null);
    setTimeLeft(1800);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Amount */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Betrag</div>
                  <div className="text-2xl font-bold text-primary">€{eurAmount.toFixed(2)}</div>
                </div>
                {selectedCrypto && prices[selectedCrypto] && (
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Entspricht</div>
                    <div className="text-xl font-bold">
                      {getCryptoSymbol(selectedCrypto)} {formatCryptoAmount(convertEurToCrypto(eurAmount, selectedCrypto), selectedCrypto)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Select Cryptocurrency */}
          {paymentStep === 'select' && (
            <div className="space-y-4">
              <h3 className="font-medium">Zahlungsmethode wählen</h3>
              
              {availableCryptos.length === 0 ? (
                <Card className="border-warning bg-warning/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Wallet className="h-5 w-5 text-warning" />
                      <div>
                        <div className="font-medium">Keine Wallets verbunden</div>
                        <div className="text-sm text-muted-foreground">
                          Verbinden Sie mindestens eine Wallet um mit Krypto zu bezahlen.
                        </div>
                      </div>
                      <WalletConnectModal>
                        <Button size="sm">Wallet verbinden</Button>
                      </WalletConnectModal>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {availableCryptos.map((crypto) => {
                    const price = prices[crypto];
                    const cryptoAmount = convertEurToCrypto(eurAmount, crypto);
                    
                    return (
                      <Card 
                        key={crypto}
                        className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                        onClick={() => handleCryptoSelect(crypto)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{crypto}</CardTitle>
                            <Badge variant="secondary">Verbunden</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-lg font-bold">
                              {getCryptoSymbol(crypto)} {formatCryptoAmount(cryptoAmount, crypto)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              €{price?.price_eur.toFixed(2)} / {crypto}
                            </div>
                            {price?.change_24h && (
                              <div className={`text-xs flex items-center gap-1 ${
                                price.change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                <TrendingUp className="h-3 w-3" />
                                {price.change_24h >= 0 ? '+' : ''}{price.change_24h.toFixed(2)}% (24h)
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Confirm Payment */}
          {paymentStep === 'confirm' && selectedCrypto && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Zahlung bestätigen</h3>
                <Button variant="outline" size="sm" onClick={() => setPaymentStep('select')}>
                  Zurück
                </Button>
              </div>

              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Kryptowährung:</span>
                      <span className="font-medium">{selectedCrypto}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Betrag:</span>
                      <span className="font-medium">
                        {getCryptoSymbol(selectedCrypto)} {formatCryptoAmount(convertEurToCrypto(eurAmount, selectedCrypto), selectedCrypto)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">EUR Gegenwert:</span>
                      <span className="font-medium">€{eurAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Wechselkurs:</span>
                      <span className="text-sm text-muted-foreground">
                        1 {selectedCrypto} = €{prices[selectedCrypto]?.price_eur.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Die Zahlung läuft in 30 Minuten ab. Stellen Sie sicher, dass Sie genügend {selectedCrypto} in Ihrer Wallet haben.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={resetPayment}>
                  Abbrechen
                </Button>
                <Button onClick={handlePaymentConfirm} disabled={paymentLoading}>
                  {paymentLoading ? "Wird verarbeitet..." : "Zahlung bestätigen"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Processing Payment */}
          {paymentStep === 'processing' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="font-medium mb-2">Zahlung wird verarbeitet...</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ihre Transaktion wird auf der Blockchain bestätigt.
                </p>
                
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="h-4 w-4" />
                  Verbleibende Zeit: {formatTime(timeLeft)}
                </div>
                
                <Progress value={75} className="w-full max-w-md mx-auto" />
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Zahlung erstellt</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Blockchain-Übertragung</span>
                      <div className="animate-spin rounded-full h-4 w-4 border-b border-primary"></div>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Bestätigung abwarten</span>
                      <div className="w-4 h-4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Payment Option */}
              <Card className="border-purple-200 bg-purple-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-purple-500" />
                    <div>
                      <div className="font-medium">Mobile Payment</div>
                      <div className="text-sm text-muted-foreground">
                        Scannen Sie den QR-Code mit Ihrer Mobile Wallet
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Success */}
          {paymentStep === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-green-700 mb-2">Zahlung erfolgreich!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ihre {selectedCrypto} Zahlung wurde erfolgreich verarbeitet.
                </p>
                {paymentId && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Payment ID</div>
                    <div className="font-mono text-sm flex items-center gap-2">
                      {paymentId.slice(0, 8)}...{paymentId.slice(-8)}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(paymentId)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <Button onClick={() => onOpenChange(false)} className="w-full">
                Schließen
              </Button>
            </div>
          )}

          {/* Step 5: Failed */}
          {paymentStep === 'failed' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-red-700 mb-2">Zahlung fehlgeschlagen</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Die Zahlung konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                  Schließen
                </Button>
                <Button onClick={resetPayment} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Erneut versuchen
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}