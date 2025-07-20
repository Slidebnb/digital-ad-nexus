
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentStatusTrackerProps {
  paymentId: string;
  onStatusChange?: (status: string) => void;
}

interface PaymentInfo {
  id: string;
  status: string;
  cryptocurrency: string;
  amount_crypto: number;
  amount_eur: number;
  transaction_hash?: string;
  confirmed_at?: string;
  created_at: string;
  blockchain_network: string;
}

export const PaymentStatusTracker: React.FC<PaymentStatusTrackerProps> = ({
  paymentId,
  onStatusChange
}) => {
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentStatus();
    
    // Set up real-time subscription
    const channel = supabase
      .channel(`payment-status-${paymentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'crypto_payments',
          filter: `id=eq.${paymentId}`
        },
        (payload) => {
          const updatedPayment = payload.new as PaymentInfo;
          setPayment(updatedPayment);
          onStatusChange?.(updatedPayment.status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [paymentId]);

  const fetchPaymentStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) throw error;
      setPayment(data);
    } catch (error) {
      console.error('Error fetching payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Wartend</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Verarbeitung</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Bestätigt</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fehlgeschlagen</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Warten auf Blockchain-Transaktion...';
      case 'processing':
        return 'Transaktion wird auf der Blockchain verarbeitet...';
      case 'confirmed':
        return 'Zahlung erfolgreich bestätigt und verarbeitet!';
      case 'failed':
        return 'Zahlung konnte nicht verarbeitet werden.';
      default:
        return 'Status unbekannt';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Lade Zahlungsstatus...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!payment) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Zahlung nicht gefunden.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(payment.status)}
          Zahlungsstatus
        </CardTitle>
        <CardDescription>
          {getStatusDescription(payment.status)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          {getStatusBadge(payment.status)}
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Kryptowährung:</span>
            <div className="font-medium">{payment.cryptocurrency}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Betrag:</span>
            <div className="font-medium">
              {payment.amount_crypto} {payment.cryptocurrency}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">EUR Betrag:</span>
            <div className="font-medium">€{payment.amount_eur}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Netzwerk:</span>
            <div className="font-medium capitalize">{payment.blockchain_network}</div>
          </div>
        </div>

        {/* Transaction Hash */}
        {payment.transaction_hash && (
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Transaktions-Hash:</span>
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              <code className="text-xs flex-1 break-all">
                {payment.transaction_hash}
              </code>
              <a
                href={`https://explorer.solana.com/tx/${payment.transaction_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
          <div>Erstellt: {new Date(payment.created_at).toLocaleString('de-DE')}</div>
          {payment.confirmed_at && (
            <div>Bestätigt: {new Date(payment.confirmed_at).toLocaleString('de-DE')}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
