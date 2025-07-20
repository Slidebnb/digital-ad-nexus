
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, CheckCircle, Clock, Loader2, Smartphone, QrCode, Wallet } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import QRCode from 'qrcode.react';

interface BoostPackage {
  id: number;
  name: string;
  description: string;
  price_eur: number;
  price_sol: number;
  duration_days: number;
  features: string[];
}

interface EnhancedSolanaPaymentProps {
  adId: string;
  boostPackage: BoostPackage;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

const SOLANA_WALLET_ADDRESS = '6rGVhxNk6LrR9SDnVX3aKMYLEYFG7q6KMiKVj6CCsqWz';

export const EnhancedSolanaPayment: React.FC<EnhancedSolanaPaymentProps> = ({
  adId,
  boostPackage,
  onPaymentSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'processing' | 'confirmed' | 'failed'>('waiting');
  const [paymentId, setPaymentId] = useState<string>('');
  const [showQR, setShowQR] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const pollingRef = useRef<NodeJS.Timeout>();
  const timerRef = useRef<NodeJS.Timeout>();

  // Generate Solana Pay URI
  const generateSolanaPayURI = () => {
    const amount = boostPackage.price_sol;
    const label = encodeURIComponent(`Boost: ${boostPackage.name}`);
    const message = encodeURIComponent(`Boost your ad for ${boostPackage.duration_days} days`);
    
    return `solana:${SOLANA_WALLET_ADDRESS}?amount=${amount}&label=${label}&message=${message}`;
  };

  const solanaPayURI = generateSolanaPayURI();

  // Timer countdown
  useEffect(() => {
    if (paymentStatus === 'waiting' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, paymentStatus]);

  // Create payment record
  const createPayment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht angemeldet');

      const { data, error } = await supabase
        .from('crypto_payments')
        .insert({
          user_id: user.id,
          payment_type: 'boost',
          ad_id: adId,
          boost_package_id: boostPackage.id,
          cryptocurrency: 'SOL',
          amount_crypto: boostPackage.price_sol,
          amount_eur: boostPackage.price_eur,
          wallet_address: SOLANA_WALLET_ADDRESS,
          blockchain_network: 'solana',
          status: 'pending',
          exchange_rate: boostPackage.price_eur / boostPackage.price_sol,
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      setPaymentId(data.id);
      return data.id;
    } catch (error) {
      console.error('Fehler beim Erstellen der Zahlung:', error);
      toast({
        title: "Fehler",
        description: "Zahlungsanfrage konnte nicht erstellt werden.",
        variant: "destructive"
      });
      return null;
    }
  };

  // Start automatic payment monitoring
  const startPaymentMonitoring = async () => {
    setPaymentStatus('processing');
    
    let currentPaymentId = paymentId;
    if (!currentPaymentId) {
      currentPaymentId = await createPayment();
      if (!currentPaymentId) return;
    }

    // Start polling for payment confirmation
    const pollPayment = async () => {
      try {
        const { data, error } = await supabase
          .from('crypto_payments')
          .select('status, transaction_hash, confirmed_at')
          .eq('id', currentPaymentId)
          .single();

        if (error) throw error;

        if (data.status === 'confirmed') {
          setPaymentStatus('confirmed');
          if (pollingRef.current) clearInterval(pollingRef.current);
          
          toast({
            title: "Zahlung bestätigt!",
            description: "Ihre Anzeige wurde erfolgreich geboostet.",
          });
          
          setTimeout(() => {
            onPaymentSuccess();
          }, 2000);
        }
      } catch (error) {
        console.error('Fehler beim Überwachen der Zahlung:', error);
      }
    };

    // Poll every 5 seconds
    pollingRef.current = setInterval(pollPayment, 5000);
    
    // Stop polling after 30 minutes
    setTimeout(() => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        if (paymentStatus === 'processing') {
          setPaymentStatus('failed');
          toast({
            title: "Timeout",
            description: "Zahlung nicht rechtzeitig eingegangen.",
            variant: "destructive"
          });
        }
      }
    }, 30 * 60 * 1000);
  };

  useEffect(() => {
    // Auto-start monitoring when component mounts
    startPaymentMonitoring();
    
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopiert!",
      description: `${label} wurde in die Zwischenablage kopiert.`,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const openSolanaWallet = () => {
    // Try to open various Solana wallets
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Mobile wallet deep links
      window.location.href = `phantom://browse/${encodeURIComponent(solanaPayURI)}`;
      
      // Fallback to app store if wallet not installed
      setTimeout(() => {
        window.open('https://phantom.app/download', '_blank');
      }, 1000);
    } else {
      // Desktop - try to open wallet extension
      if (window.solana) {
        toast({
          title: "Wallet erkannt",
          description: "Bitte bestätigen Sie die Transaktion in Ihrer Wallet.",
        });
      } else {
        window.open('https://phantom.app/download', '_blank');
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-green-400 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">SOL</span>
            </div>
            Automatische Solana Zahlung
          </CardTitle>
          <CardDescription>
            Scannen Sie den QR-Code oder öffnen Sie automatisch Ihre Wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Timer */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Zahlung läuft ab in:</span>
            <Badge variant={timeLeft < 300 ? "destructive" : "secondary"} className="font-mono">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(timeLeft)}
            </Badge>
          </div>

          {/* Payment Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Betrag (SOL)</label>
              <div className="text-2xl font-bold text-primary">
                {boostPackage.price_sol.toFixed(4)} SOL
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Betrag (EUR)</label>
              <div className="text-lg text-muted-foreground">
                €{boostPackage.price_eur.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Payment Methods Toggle */}
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
              <div className="flex justify-center p-6 bg-white rounded-lg">
                <QRCode 
                  value={solanaPayURI} 
                  size={200}
                  level="M"
                  includeMargin
                />
              </div>
              
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Scannen Sie den QR-Code mit Ihrer Solana Wallet
                </p>
                
                <div className="flex gap-2 justify-center">
                  <Button onClick={openSolanaWallet} className="flex-1 max-w-xs">
                    <Smartphone className="h-4 w-4 mr-2" />
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
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm">Zahlung wird verarbeitet...</span>
              </>
            )}
            {paymentStatus === 'confirmed' && (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-700">Zahlung bestätigt! Anzeige wird geboostet...</span>
              </>
            )}
            {paymentStatus === 'failed' && (
              <>
                <Clock className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">Zahlung fehlgeschlagen oder abgelaufen</span>
              </>
            )}
          </div>

          {/* Package Features */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Enthaltene Features</label>
            <div className="flex flex-wrap gap-2">
              {boostPackage.features.map((feature, index) => (
                <Badge key={index} variant="secondary">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {paymentStatus === 'failed' && (
              <Button
                onClick={() => {
                  setPaymentStatus('waiting');
                  setTimeLeft(1800);
                  startPaymentMonitoring();
                }}
                className="flex-1"
              >
                Erneut versuchen
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={paymentStatus === 'processing'}
            >
              Abbrechen
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
            <p><strong>So funktioniert's:</strong></p>
            <p>1. QR-Code scannen oder Wallet automatisch öffnen</p>
            <p>2. Transaktion in Ihrer Wallet bestätigen</p>
            <p>3. Warten auf automatische Bestätigung (1-2 Minuten)</p>
            <p>4. Ihr Boost wird automatisch aktiviert!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
