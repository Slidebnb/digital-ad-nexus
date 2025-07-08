import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useCryptoWallet } from "@/hooks/useCryptoWallet";
import { toast } from "@/hooks/use-toast";
import { 
  Shield, 
  Lock, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  DollarSign,
  Handshake,
  FileText,
  Coins,
  Plus
} from "lucide-react";

interface EscrowTransaction {
  id: string;
  buyer_id: string;
  seller_id: string;
  ad_id: string;
  amount_crypto: number;
  amount_eur: number;
  cryptocurrency: string;
  status: 'created' | 'funded' | 'released' | 'disputed' | 'cancelled';
  escrow_address: string;
  terms: string;
  created_at: string;
  expires_at: string;
  buyer_confirmed: boolean;
  seller_confirmed: boolean;
}

export function CryptoEscrowSystem() {
  const { user } = useAuth();
  const { prices, convertEurToCrypto, formatCryptoAmount, getCryptoSymbol } = useCryptoPrices();
  const { connections, getWallet } = useCryptoWallet();
  
  const [escrows, setEscrows] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  
  // Create new escrow form
  const [newEscrow, setNewEscrow] = useState({
    sellerId: '',
    adId: '',
    amount: 0,
    cryptocurrency: 'SOL',
    terms: ''
  });

  useEffect(() => {
    if (user) {
      fetchEscrows();
    }
  }, [user]);

  const fetchEscrows = async () => {
    if (!user) return;
    
    try {
      // Simplified - use crypto_payments instead of non-existent escrow_transactions
      const { data, error } = await supabase
        .from('crypto_payments')
        .select('*')
        .eq('payment_type', 'escrow')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match interface
      const transformedData = (data || []).map(payment => ({
        id: payment.id,
        buyer_id: payment.user_id,
        seller_id: 'unknown',
        ad_id: payment.ad_id || 'unknown',
        amount_crypto: payment.amount_crypto,
        amount_eur: payment.amount_eur,
        cryptocurrency: payment.cryptocurrency,
        status: payment.status as any,
        escrow_address: payment.wallet_address,
        terms: 'Standard terms',
        created_at: payment.created_at,
        expires_at: payment.expires_at || new Date().toISOString(),
        buyer_confirmed: payment.status === 'confirmed',
        seller_confirmed: payment.status === 'confirmed'
      }));
      
      setEscrows(transformedData);
    } catch (error) {
      console.error('Error fetching escrows:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEscrow = async () => {
    // Simplified demo version
    toast({
      title: "Demo-Feature",
      description: "Escrow-System ist in der Demo-Version. Vollständige Integration folgt.",
    });
  };

  const confirmEscrow = async (escrowId: string, action: 'buyer_confirm' | 'seller_confirm') => {
    toast({
      title: "Demo-Feature",
      description: "Escrow-Bestätigung ist in der Demo-Version.",
    });
  };

  const releaseEscrow = async (escrowId: string) => {
    toast({
      title: "Demo-Feature", 
      description: "Escrow-Freigabe ist in der Demo-Version.",
    });
  };

  const generateEscrowAddress = (): string => {
    return 'escrow_' + Math.random().toString(36).substring(2, 15);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'bg-blue-100 text-blue-800';
      case 'funded': return 'bg-yellow-100 text-yellow-800';
      case 'released': return 'bg-green-100 text-green-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created': return <Clock className="h-4 w-4" />;
      case 'funded': return <Lock className="h-4 w-4" />;
      case 'released': return <CheckCircle className="h-4 w-4" />;
      case 'disputed': return <AlertTriangle className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Crypto Escrow System</h2>
        <p className="text-muted-foreground">
          Sichere P2P-Transaktionen mit Kryptowährungen
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Aktive Escrows</TabsTrigger>
          <TabsTrigger value="create">Neues Escrow</TabsTrigger>
          <TabsTrigger value="history">Historie</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {escrows.filter(e => ['created', 'funded'].includes(e.status)).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Keine aktiven Escrows</h3>
                <p className="text-sm text-muted-foreground">
                  Sie haben derzeit keine aktiven Escrow-Transaktionen.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {escrows.filter(e => ['created', 'funded'].includes(e.status)).map((escrow) => (
                <Card key={escrow.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Demo Escrow #{escrow.id.slice(0, 8)}
                      </CardTitle>
                      <Badge className={getStatusColor(escrow.status)}>
                        {getStatusIcon(escrow.status)}
                        <span className="ml-1 capitalize">{escrow.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Betrag</p>
                        <p className="font-medium">
                          {getCryptoSymbol(escrow.cryptocurrency)} {formatCryptoAmount(escrow.amount_crypto, escrow.cryptocurrency)}
                        </p>
                        <p className="text-sm text-muted-foreground">€{escrow.amount_eur}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Käufer</p>
                        <p className="font-medium">
                          {user?.id === escrow.buyer_id ? 'Sie' : 'Unbekannt'}
                        </p>
                        <div className="flex items-center gap-1 text-xs">
                          {escrow.buyer_confirmed ? (
                            <>
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-green-600">Bestätigt</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 text-yellow-500" />
                              <span className="text-yellow-600">Ausstehend</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Verkäufer</p>
                        <p className="font-medium">
                          {user?.id === escrow.seller_id ? 'Sie' : 'Unbekannt'}
                        </p>
                        <div className="flex items-center gap-1 text-xs">
                          {escrow.seller_confirmed ? (
                            <>
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-green-600">Bestätigt</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 text-yellow-500" />
                              <span className="text-yellow-600">Ausstehend</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Läuft ab</p>
                        <p className="font-medium">
                          {new Date(escrow.expires_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>

                    {escrow.terms && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Bedingungen</p>
                        <p className="text-sm bg-muted p-2 rounded">{escrow.terms}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {user?.id === escrow.buyer_id && !escrow.buyer_confirmed && (
                        <Button
                          size="sm"
                          onClick={() => confirmEscrow(escrow.id, 'buyer_confirm')}
                        >
                          Als Käufer bestätigen
                        </Button>
                      )}
                      
                      {user?.id === escrow.seller_id && !escrow.seller_confirmed && (
                        <Button
                          size="sm"
                          onClick={() => confirmEscrow(escrow.id, 'seller_confirm')}
                        >
                          Als Verkäufer bestätigen
                        </Button>
                      )}
                      
                      {user?.id === escrow.buyer_id && 
                       escrow.buyer_confirmed && 
                       escrow.seller_confirmed && 
                       escrow.status === 'funded' && (
                        <Button
                          size="sm"
                          onClick={() => releaseEscrow(escrow.id)}
                        >
                          Mittel freigeben
                        </Button>
                      )}
                    </div>

                    {escrow.buyer_confirmed && escrow.seller_confirmed && escrow.status === 'created' && (
                      <Alert>
                        <Handshake className="h-4 w-4" />
                        <AlertDescription>
                          Beide Parteien haben bestätigt. Der Käufer kann nun die Mittel einzahlen.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Neues Escrow erstellen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="seller-id">Verkäufer ID</Label>
                  <Input
                    id="seller-id"
                    value={newEscrow.sellerId}
                    onChange={(e) => setNewEscrow({...newEscrow, sellerId: e.target.value})}
                    placeholder="UUID des Verkäufers"
                  />
                </div>
                <div>
                  <Label htmlFor="ad-id">Anzeigen ID</Label>
                  <Input
                    id="ad-id"
                    value={newEscrow.adId}
                    onChange={(e) => setNewEscrow({...newEscrow, adId: e.target.value})}
                    placeholder="UUID der Anzeige"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Betrag (EUR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newEscrow.amount}
                    onChange={(e) => setNewEscrow({...newEscrow, amount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="crypto">Kryptowährung</Label>
                  <select
                    id="crypto"
                    value={newEscrow.cryptocurrency}
                    onChange={(e) => setNewEscrow({...newEscrow, cryptocurrency: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="SOL">Solana (SOL)</option>
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                  </select>
                </div>
              </div>

              {newEscrow.amount > 0 && prices[newEscrow.cryptocurrency] && (
                <Alert>
                  <Coins className="h-4 w-4" />
                  <AlertDescription>
                    Entspricht ca. {getCryptoSymbol(newEscrow.cryptocurrency)} {formatCryptoAmount(convertEurToCrypto(newEscrow.amount, newEscrow.cryptocurrency), newEscrow.cryptocurrency)} 
                    {' '}bei aktuellem Kurs von €{prices[newEscrow.cryptocurrency].price_eur.toFixed(2)}
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="terms">Bedingungen (optional)</Label>
                <Textarea
                  id="terms"
                  value={newEscrow.terms}
                  onChange={(e) => setNewEscrow({...newEscrow, terms: e.target.value})}
                  placeholder="Beschreiben Sie die Bedingungen für diese Transaktion..."
                  rows={4}
                />
              </div>

              <Button onClick={createEscrow} className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Escrow erstellen
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {escrows.filter(e => ['released', 'cancelled', 'disputed'].includes(e.status)).map((escrow) => (
              <Card key={escrow.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Demo Escrow #{escrow.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {getCryptoSymbol(escrow.cryptocurrency)} {formatCryptoAmount(escrow.amount_crypto, escrow.cryptocurrency)} •
                        {new Date(escrow.created_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(escrow.status)}>
                      {getStatusIcon(escrow.status)}
                      <span className="ml-1 capitalize">{escrow.status}</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}