import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BoostPackage {
  id: number;
  name: string;
  description: string;
  price_eur: number;
  price_sol: number;
  duration_days: number;
  features: string[];
}

interface SolanaBoostPaymentProps {
  adId: string;
  boostPackage: BoostPackage;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

const SOLANA_WALLET_ADDRESS = '6rGVhxNk6LrR9SDnVX3aKMYLEYFG7q6KMiKVj6CCsqWz';

export const SolanaBoostPayment: React.FC<SolanaBoostPaymentProps> = ({
  adId,
  boostPackage,
  onPaymentSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'processing' | 'confirmed' | 'failed'>('waiting');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopiert!",
      description: `${label} wurde in die Zwischenablage kopiert.`,
    });
  };

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
          exchange_rate: boostPackage.price_eur / boostPackage.price_sol, // EUR/SOL rate
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 Minuten
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

  const handlePaymentSubmitted = async () => {
    if (!transactionHash.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie die Transaktions-ID ein.",
        variant: "destructive"
      });
      return;
    }

    setPaymentStatus('processing');

    try {
      let currentPaymentId = paymentId;
      if (!currentPaymentId) {
        currentPaymentId = await createPayment();
        if (!currentPaymentId) return;
      }

      // Update payment with transaction hash
      const { error: updateError } = await supabase
        .from('crypto_payments')
        .update({
          transaction_hash: transactionHash.trim(),
          status: 'processing'
        })
        .eq('id', currentPaymentId);

      if (updateError) throw updateError;

      // Call payment processor to verify transaction
      const { data, error } = await supabase.functions.invoke('crypto-payment-processor', {
        body: {
          paymentId: currentPaymentId,
          transactionHash: transactionHash.trim(),
          blockchain: 'solana',
          confirmations: 1 // Solana confirmations start at 1
        }
      });

      if (error) throw error;

      if (data.status === 'confirmed') {
        setPaymentStatus('confirmed');
        toast({
          title: "Zahlung bestätigt!",
          description: "Ihre Anzeige wurde erfolgreich geboostet.",
        });
        setTimeout(() => {
          onPaymentSuccess();
        }, 2000);
      } else {
        // Start monitoring for confirmations
        monitorPayment(currentPaymentId);
      }

    } catch (error) {
      console.error('Fehler bei der Zahlungsverarbeitung:', error);
      setPaymentStatus('failed');
      toast({
        title: "Fehler",
        description: "Transaktion konnte nicht verifiziert werden. Bitte überprüfen Sie die Transaktions-ID.",
        variant: "destructive"
      });
    }
  };

  const monitorPayment = async (paymentId: string) => {
    const maxAttempts = 10;
    let attempts = 0;

    const checkPayment = async () => {
      try {
        const { data, error } = await supabase
          .from('crypto_payments')
          .select('status, confirmation_count')
          .eq('id', paymentId)
          .single();

        if (error) throw error;

        if (data.status === 'confirmed') {
          setPaymentStatus('confirmed');
          toast({
            title: "Zahlung bestätigt!",
            description: "Ihre Anzeige wurde erfolgreich geboostet.",
          });
          setTimeout(() => {
            onPaymentSuccess();
          }, 2000);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkPayment, 30000); // Check every 30 seconds
        } else {
          setPaymentStatus('failed');
          toast({
            title: "Timeout",
            description: "Transaktion konnte nicht rechtzeitig bestätigt werden.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Fehler beim Überwachen der Zahlung:', error);
      }
    };

    setTimeout(checkPayment, 30000); // First check after 30 seconds
  };

  const getSolanaExplorerUrl = (hash: string) => {
    return `https://solscan.io/tx/${hash}`;
  };

  const formatSolAmount = (amount: number) => {
    return amount.toFixed(4);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-green-400 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">SOL</span>
            </div>
            Solana Zahlung - {boostPackage.name}
          </CardTitle>
          <CardDescription>
            Senden Sie SOL an die unten angegebene Adresse und geben Sie die Transaktions-ID ein.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Betrag (SOL)</label>
              <div className="text-2xl font-bold text-primary">
                {formatSolAmount(boostPackage.price_sol)} SOL
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Betrag (EUR)</label>
              <div className="text-lg text-muted-foreground">
                €{boostPackage.price_eur.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Wallet Address */}
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

          {/* Transaction Hash Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Transaktions-ID (nach dem Senden eingeben)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Transaktions-ID hier eingeben..."
                className="flex-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                disabled={paymentStatus === 'processing' || paymentStatus === 'confirmed'}
              />
              {transactionHash && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getSolanaExplorerUrl(transactionHash), '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Payment Status */}
          {paymentStatus !== 'waiting' && (
            <div className="flex items-center gap-2 p-3 rounded-lg border">
              {paymentStatus === 'processing' && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-sm">Transaktion wird überprüft...</span>
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
                  <span className="text-sm text-red-700">Transaktion konnte nicht bestätigt werden</span>
                </>
              )}
            </div>
          )}

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
            <Button
              onClick={handlePaymentSubmitted}
              disabled={!transactionHash.trim() || paymentStatus === 'processing' || paymentStatus === 'confirmed'}
              className="flex-1"
            >
              {paymentStatus === 'processing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Überprüfung...
                </>
              ) : paymentStatus === 'confirmed' ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Bestätigt
                </>
              ) : (
                'Zahlung überprüfen'
              )}
            </Button>
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
            <p><strong>Anleitung:</strong></p>
            <p>1. Kopieren Sie die Wallet-Adresse</p>
            <p>2. Senden Sie exakt {formatSolAmount(boostPackage.price_sol)} SOL von Ihrer Wallet</p>
            <p>3. Geben Sie die Transaktions-ID ein und klicken Sie auf "Zahlung überprüfen"</p>
            <p>4. Warten Sie auf die Bestätigung (kann bis zu 2 Minuten dauern)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};