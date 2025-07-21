
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Copy, CheckCircle, QrCode } from 'lucide-react';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode.react';

interface BoostQRModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPackage?: {
    id: number;
    name: string;
    description: string;
    price_eur: number;
    duration_days: number;
    features: string[];
  };
  adId?: string;
}

const PLATFORM_WALLET = '6rGVhxNk6LrR9SDnVX3aKMYLEYFG7q6KMiKVj6CCsqWz';

export function BoostQRModal({ open, onOpenChange, selectedPackage, adId }: BoostQRModalProps) {
  const { prices } = useCryptoPrices();
  const { user } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'qr' | 'verify'>('qr');
  const [transactionSignature, setTransactionSignature] = useState('');

  if (!selectedPackage) return null;

  const solPrice = prices['SOL']?.price_eur || 164;
  const solAmount = (selectedPackage.price_eur / solPrice).toFixed(4);
  const memo = `boost_${adId}_${user?.id}`;

  const qrValue = `solana:${PLATFORM_WALLET}?amount=${solAmount}&reference=${memo}&label=Ad%20Boost`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopiert! 📋",
      description: "Text wurde in die Zwischenablage kopiert.",
    });
  };

  const handleVerifyPayment = async () => {
    if (!transactionSignature.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib die Transaktions-Signatur ein.",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessing(true);
      // TODO: Implement boost payment verification
      toast({
        title: "Boost aktiviert! 🚀",
        description: "Deine Anzeige wurde erfolgreich geboostet!",
      });
      onOpenChange(false);
      setStep('qr');
      setTransactionSignature('');
    } catch (error) {
      console.error('Boost verification failed:', error);
      toast({
        title: "Verifikation fehlgeschlagen",
        description: error instanceof Error ? error.message : "Boost konnte nicht aktiviert werden.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Zap className="h-5 w-5 text-primary" />
            Anzeige boosten
          </DialogTitle>
        </DialogHeader>

        {step === 'qr' && (
          <div className="space-y-6">
            {/* Package Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{selectedPackage.name}</h3>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {selectedPackage.duration_days} Tage
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  {selectedPackage.description}
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>{selectedPackage.price_eur}€</span>
                  <span className="text-primary">{solAmount} SOL</span>
                </div>
              </CardContent>
            </Card>

            {/* QR Code */}
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <QrCode className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">QR-Code scannen</h3>
                  <p className="text-sm text-muted-foreground">
                    Mit deiner Solana Wallet scannen
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg inline-block">
                  <QRCode
                    value={qrValue}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Empfänger:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={PLATFORM_WALLET} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(PLATFORM_WALLET)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Betrag:</Label>
                  <div className="text-lg font-bold text-primary mt-1">
                    {solAmount} SOL
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Memo:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={memo} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(memo)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>Wichtig:</strong> Sende genau {solAmount} SOL und füge das Memo hinzu für automatische Aktivierung.
              </p>
            </div>

            <Button 
              onClick={() => setStep('verify')}
              className="w-full"
            >
              Zahlung verifizieren
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
              <h3 className="font-semibold text-lg">Zahlung verifizieren</h3>
              <p className="text-muted-foreground">
                Gib die Transaktions-Signatur ein
              </p>
            </div>

            <div>
              <Label htmlFor="signature">Transaktions-Signatur</Label>
              <Input
                id="signature"
                value={transactionSignature}
                onChange={(e) => setTransactionSignature(e.target.value)}
                placeholder="Gib die Transaktions-Signatur ein..."
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('qr')}
                className="flex-1"
              >
                Zurück
              </Button>
              <Button 
                onClick={handleVerifyPayment} 
                disabled={processing || !transactionSignature.trim()}
                className="flex-1"
              >
                {processing ? 'Verifiziere...' : 'Verifizieren'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
