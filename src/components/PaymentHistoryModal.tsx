import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCryptoPayments } from "@/hooks/useCryptoPayments";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { 
  History, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  Copy,
  Filter,
  Search
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentHistoryModalProps {
  children: React.ReactNode;
}

export function PaymentHistoryModal({ children }: PaymentHistoryModalProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cryptoFilter, setCryptoFilter] = useState<string>("all");
  const { payments, fetchPayments, loading } = useCryptoPayments();
  const { getCryptoSymbol, formatCryptoAmount } = useCryptoPrices();

  useEffect(() => {
    if (open) {
      fetchPayments();
    }
  }, [open, fetchPayments]);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.transaction_hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.payment_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesCrypto = cryptoFilter === "all" || payment.cryptocurrency === cryptoFilter;
    
    return matchesSearch && matchesStatus && matchesCrypto;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'failed': return <AlertTriangle className="h-3 w-3" />;
      case 'cancelled': return <AlertTriangle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Bestätigt';
      case 'pending': return 'Ausstehend';
      case 'failed': return 'Fehlgeschlagen';
      case 'cancelled': return 'Abgebrochen';
      default: return status;
    }
  };

  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'boost': return 'Anzeige Boost';
      case 'premium': return 'Premium Abo';
      case 'escrow': return 'Escrow';
      default: return type;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopiert!",
      description: "Text wurde in die Zwischenablage kopiert.",
    });
  };

  const openBlockchainExplorer = (hash: string, crypto: string) => {
    let url = '';
    switch (crypto) {
      case 'BTC':
        url = `https://blockstream.info/tx/${hash}`;
        break;
      case 'ETH':
        url = `https://etherscan.io/tx/${hash}`;
        break;
      case 'SOL':
        url = `https://solscan.io/tx/${hash}`;
        break;
    }
    if (url) window.open(url, '_blank');
  };

  // Calculate statistics
  const stats = {
    total: payments.length,
    confirmed: payments.filter(p => p.status === 'confirmed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    totalValue: payments.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + p.amount_eur, 0)
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Zahlungshistorie
          </DialogTitle>
          <DialogDescription>
            Übersicht über alle Ihre Kryptowährungs-Zahlungen und deren Status
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="payments">Zahlungen</TabsTrigger>
            <TabsTrigger value="statistics">Statistiken</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Suche nach Transaktion oder Typ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="confirmed">Bestätigt</SelectItem>
                  <SelectItem value="pending">Ausstehend</SelectItem>
                  <SelectItem value="failed">Fehlgeschlagen</SelectItem>
                  <SelectItem value="cancelled">Abgebrochen</SelectItem>
                </SelectContent>
              </Select>
              <Select value={cryptoFilter} onValueChange={setCryptoFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Coin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Coins</SelectItem>
                  <SelectItem value="SOL">SOL</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payments List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredPayments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Keine Zahlungen gefunden</h3>
                  <p className="text-sm text-muted-foreground">
                    {payments.length === 0 
                      ? "Sie haben noch keine Krypto-Zahlungen getätigt."
                      : "Keine Zahlungen entsprechen Ihren Filterkriterien."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredPayments.map((payment) => (
                  <Card key={payment.id} className="transition-all hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{getPaymentTypeText(payment.payment_type)}</span>
                              <Badge className={getStatusColor(payment.status)}>
                                {getStatusIcon(payment.status)}
                                <span className="ml-1">{getStatusText(payment.status)}</span>
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>
                                {getCryptoSymbol(payment.cryptocurrency)} {formatCryptoAmount(payment.amount_crypto, payment.cryptocurrency)} {payment.cryptocurrency}
                              </span>
                              <span>€{payment.amount_eur.toFixed(2)}</span>
                              <span>{new Date(payment.created_at!).toLocaleDateString('de-DE')}</span>
                            </div>
                            
                            {payment.transaction_hash && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted-foreground font-mono">
                                  {payment.transaction_hash.slice(0, 10)}...{payment.transaction_hash.slice(-10)}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(payment.transaction_hash!)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openBlockchainExplorer(payment.transaction_hash!, payment.cryptocurrency)}
                                  className="h-6 w-6 p-0"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium">€{payment.amount_eur.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.cryptocurrency}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Gesamt Zahlungen</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
                  <div className="text-sm text-muted-foreground">Bestätigt</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-muted-foreground">Ausstehend</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">€{stats.totalValue.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Gesamtwert</div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Types Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Zahlungstypen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['boost', 'premium', 'escrow'].map(type => {
                    const typePayments = payments.filter(p => p.payment_type === type);
                    const typeValue = typePayments.reduce((sum, p) => sum + (p.status === 'confirmed' ? p.amount_eur : 0), 0);
                    
                    return (
                      <div key={type} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-medium">{getPaymentTypeText(type)}</div>
                          <div className="text-sm text-muted-foreground">{typePayments.length} Zahlungen</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">€{typeValue.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            {typePayments.filter(p => p.status === 'confirmed').length} erfolgreich
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}