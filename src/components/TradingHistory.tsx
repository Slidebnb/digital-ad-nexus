import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Search, Filter, Download, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Trade {
  id: string;
  coin: string;
  type: 'buy' | 'sell';
  amount: number;
  price_eur: number;
  total_eur: number;
  status: 'completed' | 'pending' | 'cancelled';
  partner_name: string;
  created_at: string;
  completed_at: string | null;
}

export function TradingHistory() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Mock data - in einer echten App würde das von der API kommen
  const mockTrades: Trade[] = [
    {
      id: '1',
      coin: 'BTC',
      type: 'buy',
      amount: 0.5,
      price_eur: 42000,
      total_eur: 21000,
      status: 'completed',
      partner_name: 'Max Mustermann',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      completed_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString()
    },
    {
      id: '2',
      coin: 'ETH',
      type: 'sell',
      amount: 2.5,
      price_eur: 2580,
      total_eur: 6450,
      status: 'completed',
      partner_name: 'Anna Schmidt',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      completed_at: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString()
    },
    {
      id: '3',
      coin: 'SOL',
      type: 'buy',
      amount: 10,
      price_eur: 98.5,
      total_eur: 985,
      status: 'pending',
      partner_name: 'Peter Weber',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      completed_at: null
    },
    {
      id: '4',
      coin: 'BTC',
      type: 'sell',
      amount: 0.1,
      price_eur: 41500,
      total_eur: 4150,
      status: 'cancelled',
      partner_name: 'Lisa Mueller',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      completed_at: null
    }
  ];

  useEffect(() => {
    // Simuliere API-Aufruf
    setTimeout(() => {
      setTrades(mockTrades);
      setFilteredTrades(mockTrades);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = trades;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(trade => 
        trade.coin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.partner_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(trade => trade.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(trade => trade.type === typeFilter);
    }

    setFilteredTrades(filtered);
  }, [trades, searchTerm, statusFilter, typeFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-success text-success-foreground">Abgeschlossen</Badge>;
      case 'pending':
        return <Badge variant="secondary">Ausstehend</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Storniert</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'buy' ? 
      <TrendingUp className="h-4 w-4 text-success" /> : 
      <TrendingDown className="h-4 w-4 text-destructive" />;
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

  const exportTrades = () => {
    // In einer echten App würde hier ein CSV/Excel Export implementiert
    console.log('Exporting trades...', filteredTrades);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trading-Verlauf</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Lade Trading-Verlauf...</p>
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
            Trading-Verlauf
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportTrades}>
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
              placeholder="Nach Coin oder Partner suchen..."
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
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Typ filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Typen</SelectItem>
              <SelectItem value="buy">Kauf</SelectItem>
              <SelectItem value="sell">Verkauf</SelectItem>
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
                <TableHead>Partner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Datum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Keine Trades gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(trade.type)}
                        <span className="capitalize font-medium">
                          {trade.type === 'buy' ? 'Kauf' : 'Verkauf'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{trade.coin}</div>
                    </TableCell>
                    <TableCell>{trade.amount}</TableCell>
                    <TableCell>{formatCurrency(trade.price_eur)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(trade.total_eur)}
                    </TableCell>
                    <TableCell>{trade.partner_name}</TableCell>
                    <TableCell>{getStatusBadge(trade.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(trade.created_at)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Summary */}
        {filteredTrades.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {filteredTrades.length}
                </div>
                <div className="text-sm text-muted-foreground">Trades gesamt</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">
                  {filteredTrades.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Abgeschlossen</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">
                  {filteredTrades.filter(t => t.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">Ausstehend</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(
                    filteredTrades
                      .filter(t => t.status === 'completed')
                      .reduce((sum, t) => sum + t.total_eur, 0)
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Handelsvolumen</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}