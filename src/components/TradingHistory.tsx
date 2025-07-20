import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Search, Download, Calendar, CreditCard, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CombinedTransaction {
  id: string;
  coin: string;
  type: 'payment' | 'trade';
  subtype?: 'buy' | 'sell';
  amount: number;
  price_eur: number;
  total_eur: number;
  status: 'completed' | 'pending' | 'cancelled' | 'failed' | 'confirmed';
  partner_name: string;
  created_at: string;
  completed_at: string | null;
  description: string;
}

export function TradingHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<CombinedTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<CombinedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchUserTransactions();
    }
  }, [user]);

  const fetchUserTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('🔍 Fetching user transactions...');

      // Hole Crypto-Payments (Zahlungen für Boosts, etc.)
      const { data: cryptoPayments, error: cryptoError } = await supabase
        .from('crypto_payments')
        .select(`
          id,
          cryptocurrency,
          amount_crypto,
          amount_eur,
          status,
          payment_type,
          created_at,
          confirmed_at,
          metadata
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (cryptoError) {
        console.error('❌ Error fetching crypto payments:', cryptoError);
      }

      // Hole Trades (Handel zwischen Usern)
      const { data: trades, error: tradesError } = await supabase
        .from('trades')
        .select(`
          id,
          currency,
          amount,
          price_eur,
          status,
          buyer_id,
          seller_id,
          created_at,
          ad_id
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (tradesError) {
        console.error('❌ Error fetching trades:', tradesError);
      }

      // Kombiniere und transformiere Daten
      const combinedTransactions: CombinedTransaction[] = [];

      // Crypto Payments hinzufügen
      if (cryptoPayments) {
        cryptoPayments.forEach(payment => {
          combinedTransactions.push({
            id: payment.id,
            coin: payment.cryptocurrency || 'N/A',
            type: 'payment',
            amount: payment.amount_crypto || 0,
            price_eur: payment.amount_eur / (payment.amount_crypto || 1),
            total_eur: payment.amount_eur || 0,
            status: payment.status === 'confirmed' ? 'completed' : payment.status as any,
            partner_name: getPaymentDescription(payment.payment_type),
            created_at: payment.created_at,
            completed_at: payment.confirmed_at,
            description: `${payment.payment_type} - ${payment.cryptocurrency}`
          });
        });
      }

      // Trades hinzufügen
      if (trades) {
        trades.forEach(trade => {
          const isUserBuyer = trade.buyer_id === user.id;
          combinedTransactions.push({
            id: trade.id,
            coin: trade.currency || 'N/A',
            type: 'trade',
            subtype: isUserBuyer ? 'buy' : 'sell',
            amount: trade.amount || 0,
            price_eur: trade.price_eur || 0,
            total_eur: (trade.amount || 0) * (trade.price_eur || 0),
            status: mapTradeStatus(trade.status),
            partner_name: isUserBuyer ? 'Verkäufer' : 'Käufer',
            created_at: trade.created_at,
            completed_at: trade.status === 'completed' ? trade.created_at : null,
            description: `${isUserBuyer ? 'Kauf' : 'Verkauf'} - ${trade.currency}`
          });
        });
      }

      // Sortiere nach Datum (neueste zuerst)
      combinedTransactions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log('✅ Transactions loaded:', {
        cryptoPayments: cryptoPayments?.length || 0,
        trades: trades?.length || 0,
        total: combinedTransactions.length
      });

      setTransactions(combinedTransactions);
      setFilteredTransactions(combinedTransactions);

    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      toast({
        title: "Fehler beim Laden",
        description: "Transaktionen konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentDescription = (paymentType: string | null): string => {
    switch (paymentType) {
      case 'boost': return 'Anzeigen-Boost';
      case 'subscription': return 'Abonnement';
      case 'premium': return 'Premium-Feature';
      default: return 'Zahlung';
    }
  };

  const mapTradeStatus = (status: string): 'completed' | 'pending' | 'cancelled' => {
    switch (status) {
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  };

  useEffect(() => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        transaction.coin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.partner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      if (typeFilter === 'payment') {
        filtered = filtered.filter(transaction => transaction.type === 'payment');
      } else if (typeFilter === 'trade') {
        filtered = filtered.filter(transaction => transaction.type === 'trade');
      } else if (typeFilter === 'buy') {
        filtered = filtered.filter(transaction => 
          transaction.type === 'trade' && transaction.subtype === 'buy'
        );
      } else if (typeFilter === 'sell') {
        filtered = filtered.filter(transaction => 
          transaction.type === 'trade' && transaction.subtype === 'sell'
        );
      }
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, statusFilter, typeFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-success text-success-foreground">Abgeschlossen</Badge>;
      case 'pending':
        return <Badge variant="secondary">Ausstehend</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Storniert</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fehlgeschlagen</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (transaction: CombinedTransaction) => {
    if (transaction.type === 'payment') {
      return <CreditCard className="h-4 w-4 text-primary" />;
    } else if (transaction.type === 'trade') {
      if (transaction.subtype === 'buy') {
        return <TrendingUp className="h-4 w-4 text-success" />;
      } else {
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      }
    }
    return <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />;
  };

  const getTypeLabel = (transaction: CombinedTransaction) => {
    if (transaction.type === 'payment') {
      return 'Zahlung';
    } else if (transaction.type === 'trade') {
      return transaction.subtype === 'buy' ? 'Kauf' : 'Verkauf';
    }
    return 'Transaktion';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const exportTransactions = () => {
    console.log('Exporting transactions...', filteredTransactions);
    toast({
      title: "Export",
      description: "Export-Feature wird demnächst verfügbar sein.",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaktions-Verlauf</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Lade Transaktions-Verlauf...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Transaktions-Verlauf
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportTransactions}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nach Coin, Partner oder Beschreibung suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Status filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="completed">Abgeschlossen</SelectItem>
              <SelectItem value="pending">Ausstehend</SelectItem>
              <SelectItem value="cancelled">Storniert</SelectItem>
              <SelectItem value="failed">Fehlgeschlagen</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Typ filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Typen</SelectItem>
              <SelectItem value="payment">Zahlungen</SelectItem>
              <SelectItem value="trade">Handel</SelectItem>
              <SelectItem value="buy">Käufe</SelectItem>
              <SelectItem value="sell">Verkäufe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Typ</TableHead>
                <TableHead>Coin</TableHead>
                <TableHead>Menge</TableHead>
                <TableHead>Preis</TableHead>
                <TableHead>Gesamt</TableHead>
                <TableHead>Beschreibung</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Datum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {transactions.length === 0 
                      ? "Noch keine Transaktionen vorhanden. Tätige deine erste Transaktion!"
                      : "Keine Transaktionen entsprechen den Filterkriterien."
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(transaction)}
                        <span className="capitalize font-medium">
                          {getTypeLabel(transaction)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{transaction.coin}</div>
                    </TableCell>
                    <TableCell>
                      {transaction.amount.toLocaleString('de-DE', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8 
                      })}
                    </TableCell>
                    <TableCell>
                      {transaction.price_eur > 0 ? formatCurrency(transaction.price_eur) : '-'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(transaction.total_eur)}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(transaction.created_at)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Summary */}
        {filteredTransactions.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {filteredTransactions.length}
                </div>
                <div className="text-sm text-muted-foreground">Transaktionen</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">
                  {filteredTransactions.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Abgeschlossen</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">
                  {filteredTransactions.filter(t => t.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">Ausstehend</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(
                    filteredTransactions
                      .filter(t => t.status === 'completed')
                      .reduce((sum, t) => sum + t.total_eur, 0)
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Gesamtvolumen</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}