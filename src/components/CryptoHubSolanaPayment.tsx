
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Wallet, QrCode, Zap, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface CryptoHubSolanaPaymentProps {
  mode: 'test' | 'boost' | 'premium';
  amount: {
    sol: number;
    eur: number;
  };
  onPaymentComplete?: () => void;
}

const SOLANA_WALLET_ADDRESS = '6rGVhxNk6LrR9SDnVX3aKMYLEYFG7q6KMiKVj6CCsqWz';

export function CryptoHubSolanaPayment({ mode, amount, onPaymentComplete }: CryptoHubSolanaPaymentProps) {
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'processing' | 'confirmed'>('waiting');
  const [showQR, setShowQR] = useState(true);

  const generateSolanaPayURI = () => {
    const label = encodeURIComponent(`${mode.toUpperCase()} Payment`);
    const message = encodeURIComponent(`Crypto payment via CryptoHub`);
    return `solana:${SOLANA_WALLET_ADDRESS}?amount=${amount.sol}&label=${label}&message=${message}`;
  };

  const solanaPayURI = generateSolanaPayURI();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopiert!",
      description: `${label} wurde in die Zwischenablage kopiert.`,
    });
  };

  const openSolanaWallet = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.location.href = `phantom://browse/${encodeURIComponent(solanaPayURI)}`;
      setTimeout(() => {
        window.open('https://phantom.app/download', '_blank');
      }, 1000);
    } else {
      if ((window as any).solana?.isPhantom) {
        toast({
          title: "Phantom Wallet erkannt",
          description: "Bitte bestätigen Sie die Transaktion in Ihrer Wallet.",
        });
      } else {
        window.open('https://phantom.app/download', '_blank');
      }
    }
    
    setPaymentStatus('processing');
    
    // Simulate payment confirmation after 10 seconds for demo
    setTimeout(() => {
      setPaymentStatus('confirmed');
      toast({
        title: "Zahlung bestätigt!",
        description: "Ihre SOL-Zahlung wurde erfolgreich verarbeitet.",
      });
      onPaymentComplete?.();
    }, 10000);
  };

  const getModeConfig = () => {
    switch (mode) {
      case 'test':
        return {
          title: 'Test SOL-Zahlung',
          description: 'Demo-Zahlung zum Testen des Systems',
          color: 'bg-blue-500'
        };
      case 'boost':
        return {
          title: 'Anzeige Boosten',
          description: 'Erhöhen Sie die Sichtbarkeit Ihrer Anzeige',
          color: 'bg-green-500'
        };
      case 'premium':
        return {
          title: 'Premium Features',
          description: 'Erweiterte Funktionen freischalten',
          color: 'bg-purple-500'
        };
    }
  };

  const config = getModeConfig();

  return (
    <Card className="gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${config.color}`}>
            <Zap className="h-4 w-4" />
          </div>
          {config.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Amount */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Betrag (SOL)</label>
            <div className="text-2xl font-bold text-primary">
              {amount.sol.toFixed(4)} SOL
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Betrag (EUR)</label>
            <div className="text-lg text-muted-foreground">
              €{amount.eur.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Payment Method Toggle */}
        <div className="flex gap-2">
          <Button
            variant={showQR ? "default" : "outline"}
            size="sm"
            onClick={() => setShowQR(true)}
          >
            <QrCode className="h-4 w-4 mr-2" />
            QR-Code
          </Button>
          <Button
            variant={!showQR ? "default" : "outline"}
            size="sm"
            onClick={() => setShowQR(false)}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Manual
          </Button>
        </div>

        {showQR ? (
          /* QR Code Payment */
          <div className="space-y-4">
            <div className="flex justify-center p-6 bg-white rounded-lg border-2 border-dashed">
              <QRCodeSVG 
                value={solanaPayURI} 
                size={200}
                level="M"
                includeMargin
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>
            
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Scannen Sie den QR-Code mit Ihrer Solana Wallet App
              </p>
              
              <div className="flex gap-2 justify-center">
                <Button onClick={openSolanaWallet} className="flex-1 max-w-xs">
                  <Wallet className="h-4 w-4 mr-2" />
                  Wallet öffnen
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(solanaPayURI, 'Payment-Link')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Manual Payment */
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Empfangsadresse</label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 text-sm font-mono break-all">
                  {SOLANA_WALLET_ADDRESS}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(SOLANA_WALLET_ADDRESS, 'Wallet-Adresse')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Betrag (SOL)</label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 text-sm font-mono">
                  {amount.sol.toFixed(4)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(amount.sol.toString(), 'Betrag')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Status */}
        <div className="flex items-center gap-2 p-3 rounded-lg border">
          {paymentStatus === 'waiting' && (
            <>
              <Clock className="h-4 w-4 animate-pulse text-blue-500" />
              <span className="text-sm">Warte auf Zahlung...</span>
            </>
          )}
          {paymentStatus === 'processing' && (
            <>
              <Clock className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm">Zahlung wird verarbeitet...</span>
            </>
          )}
          {paymentStatus === 'confirmed' && (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700">Zahlung bestätigt!</span>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
          <p><strong>So funktioniert's:</strong></p>
          <p>1. QR-Code scannen oder Wallet automatisch öffnen</p>
          <p>2. Transaktion in Ihrer Wallet bestätigen</p>
          <p>3. Automatische Blockchain-Verifikation</p>
          <p>4. Bestätigung nach erfolgreicher Zahlung</p>
        </div>
      </CardContent>
    </Card>
  );
}
