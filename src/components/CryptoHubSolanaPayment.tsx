import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCodeCanvas } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { 
  Zap, 
  Copy, 
  CheckCircle, 
  Timer,
  AlertCircle,
  Wallet,
  ExternalLink 
} from "lucide-react";

interface CryptoHubSolanaPaymentProps {
  mode: 'boost' | 'premium';
  amount: { sol: number; eur: number };
  onPaymentComplete?: () => void;
}

export function CryptoHubSolanaPayment({ mode, amount, onPaymentComplete }: CryptoHubSolanaPaymentProps) {
  const { toast } = useToast();
  const { prices } = useCryptoPrices();
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'confirming' | 'completed'>('pending');

  // Demo wallet address - in production this would be generated per payment
  const walletAddress = "So11111111111111111111111111111111111111112";

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Kopiert!",
        description: "Wallet-Adresse wurde kopiert",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Fehler",
        description: "Kopieren fehlgeschlagen",
        variant: "destructive"
      });
    }
  };

  const handlePaymentDemo = () => {
    setPaymentStatus('confirming');
    toast({
      title: "Demo-Zahlung gestartet",
      description: "Simulation einer SOL-Zahlung...",
    });
    
    setTimeout(() => {
      setPaymentStatus('completed');
      onPaymentComplete?.();
      toast({
        title: "Zahlung erfolgreich!",
        description: `${mode === 'boost' ? 'Anzeige wird geboostet' : 'Premium Features aktiviert'}`,
      });
    }, 3000);
  };

  const qrValue = `solana:${walletAddress}?amount=${amount.sol}&reference=${mode}-${Date.now()}`;

  return (
    <Card className="gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          SOL Zahlung - {mode === 'boost' ? 'Boost' : 'Premium'}
          <Badge variant={paymentStatus === 'completed' ? 'default' : 'secondary'}>
            {paymentStatus === 'pending' && 'Ausstehend'}
            {paymentStatus === 'confirming' && 'Bestätigung...'}
            {paymentStatus === 'completed' && 'Abgeschlossen'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentStatus === 'completed' ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Zahlung erfolgreich!</h3>
            <p className="text-muted-foreground">
              {mode === 'boost' ? 'Ihre Anzeige wird geboostet' : 'Premium Features sind aktiv'}
            </p>
          </div>
        ) : (
          <>
            {/* Payment Amount */}
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{amount.sol.toFixed(4)} SOL</div>
              <div className="text-sm text-muted-foreground">≈ €{amount.eur.toFixed(2)}</div>
              {prices.SOL && (
                <div className="text-xs text-muted-foreground mt-1">
                  1 SOL = €{prices.SOL.price_eur.toFixed(2)}
                </div>
              )}
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <Timer className="h-4 w-4" />
              <span>Zeit verbleibt: {formatTime(timeRemaining)}</span>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeCanvas 
                  value={qrValue}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
            </div>

            {/* Wallet Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Wallet-Adresse:</label>
              <div className="flex gap-2">
                <div className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                  {walletAddress}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(walletAddress)}
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 text-orange-500" />
                <div>
                  <p className="font-medium">Zahlungsanweisungen:</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>QR-Code mit Solana Wallet scannen</li>
                    <li>Betrag automatisch ausgefüllt</li>
                    <li>Transaktion bestätigen</li>
                    <li>Warten auf Blockchain-Bestätigung</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.open('https://phantom.app', '_blank')}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Phantom Wallet
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
              <Button 
                variant="default" 
                className="flex-1"
                onClick={handlePaymentDemo}
                disabled={paymentStatus === 'confirming'}
              >
                {paymentStatus === 'confirming' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Bestätigung...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Demo Zahlung
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}