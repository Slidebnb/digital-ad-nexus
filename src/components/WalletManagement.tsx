import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2, 
  QrCode,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Banknote
} from "lucide-react";

interface WalletAddress {
  id: string;
  cryptocurrency: string;
  address: string;
  label: string;
  is_verified: boolean;
  created_at: string;
}

interface PaymentMethod {
  id: string;
  method_type: string;
  details: any;
  is_verified: boolean;
  created_at: string;
}

export function WalletManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [walletAddresses, setWalletAddresses] = useState<WalletAddress[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddresses, setShowAddresses] = useState<Record<string, boolean>>({});
  
  // Neue Wallet-Adresse hinzufügen
  const [newWallet, setNewWallet] = useState({
    cryptocurrency: 'BTC',
    address: '',
    label: ''
  });

  // Neue Zahlungsmethode hinzufügen
  const [newPayment, setNewPayment] = useState({
    method_type: 'bank_transfer',
    iban: '',
    bic: '',
    bank_name: '',
    account_holder: ''
  });

  useEffect(() => {
    fetchWalletData();
  }, [user]);

  const fetchWalletData = async () => {
    if (!user) return;

    try {
      // Wallet-Adressen laden
      const { data: wallets } = await supabase
        .from('profiles')
        .select('wallet_addresses')
        .eq('user_id', user.id)
        .single();

      if (wallets?.wallet_addresses) {
        setWalletAddresses(Object.entries(wallets.wallet_addresses).map(([key, value]: [string, any]) => ({
          id: key,
          cryptocurrency: key,
          address: value.address || value,
          label: value.label || key,
          is_verified: value.is_verified || false,
          created_at: value.created_at || new Date().toISOString()
        })));
      }

      // Zahlungsmethoden laden
      const { data: payments } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id);

      if (payments) {
        setPaymentMethods(payments);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Wallet-Daten:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWalletAddress = async () => {
    if (!user || !newWallet.address || !newWallet.cryptocurrency) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus",
        variant: "destructive"
      });
      return;
    }

    try {
      const currentWallets = walletAddresses.reduce((acc, wallet) => ({
        ...acc,
        [wallet.cryptocurrency]: {
          address: wallet.address,
          label: wallet.label,
          is_verified: wallet.is_verified,
          created_at: wallet.created_at
        }
      }), {});

      const updatedWallets = {
        ...currentWallets,
        [newWallet.cryptocurrency]: {
          address: newWallet.address,
          label: newWallet.label || newWallet.cryptocurrency,
          is_verified: false,
          created_at: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('profiles')
        .update({ wallet_addresses: updatedWallets })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Wallet-Adresse hinzugefügt"
      });

      setNewWallet({ cryptocurrency: 'BTC', address: '', label: '' });
      fetchWalletData();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Wallet-Adresse konnte nicht hinzugefügt werden",
        variant: "destructive"
      });
    }
  };

  const addPaymentMethod = async () => {
    if (!user || !newPayment.iban) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          method_type: newPayment.method_type,
          details: {
            iban: newPayment.iban,
            bic: newPayment.bic,
            bank_name: newPayment.bank_name,
            account_holder: newPayment.account_holder
          }
        });

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Zahlungsmethode hinzugefügt"
      });

      setNewPayment({
        method_type: 'bank_transfer',
        iban: '',
        bic: '',
        bank_name: '',
        account_holder: ''
      });
      fetchWalletData();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Zahlungsmethode konnte nicht hinzugefügt werden",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopiert",
      description: "Adresse in Zwischenablage kopiert"
    });
  };

  const toggleAddressVisibility = (id: string) => {
    setShowAddresses(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Wallet className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Wallet & Zahlungen</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Wallet className="h-6 w-6" />
        <h2 className="text-2xl font-semibold">Wallet & Zahlungen</h2>
      </div>

      <Tabs defaultValue="wallets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wallets" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Krypto Wallets
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Bankverbindungen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Kryptowährung Adressen
              </CardTitle>
              <CardDescription>
                Verwalten Sie Ihre Wallet-Adressen für verschiedene Kryptowährungen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existierende Adressen */}
              {walletAddresses.length > 0 ? (
                <div className="space-y-3">
                  {walletAddresses.map((wallet) => (
                    <div key={wallet.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{wallet.cryptocurrency}</Badge>
                          <span className="font-medium">{wallet.label}</span>
                          {wallet.is_verified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAddressVisibility(wallet.id)}
                          >
                            {showAddresses[wallet.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(wallet.address)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {showAddresses[wallet.id] 
                          ? wallet.address 
                          : '••••••••••••••••••••••••••••••••'
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Sie haben noch keine Wallet-Adressen hinzugefügt.
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              {/* Neue Adresse hinzufügen */}
              <div className="space-y-4">
                <h4 className="font-medium">Neue Wallet-Adresse hinzufügen</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Kryptowährung</Label>
                    <select
                      className="w-full mt-1 p-2 border rounded-md"
                      value={newWallet.cryptocurrency}
                      onChange={(e) => setNewWallet(prev => ({ ...prev, cryptocurrency: e.target.value }))}
                    >
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="SOL">Solana (SOL)</option>
                      <option value="LTC">Litecoin (LTC)</option>
                      <option value="XRP">Ripple (XRP)</option>
                    </select>
                  </div>
                  <div>
                    <Label>Wallet-Adresse</Label>
                    <Input
                      placeholder="Ihre Wallet-Adresse"
                      value={newWallet.address}
                      onChange={(e) => setNewWallet(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Label (optional)</Label>
                    <Input
                      placeholder="z.B. Meine Hauptwallet"
                      value={newWallet.label}
                      onChange={(e) => setNewWallet(prev => ({ ...prev, label: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={addWalletAddress} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Wallet-Adresse hinzufügen
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Bankverbindungen
              </CardTitle>
              <CardDescription>
                Verwalten Sie Ihre Bankverbindungen für SEPA-Überweisungen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existierende Zahlungsmethoden */}
              {paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {method.method_type === 'bank_transfer' ? 'SEPA' : method.method_type}
                          </Badge>
                          <span className="font-medium">{method.details.bank_name}</span>
                          {method.is_verified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>IBAN: {method.details.iban}</div>
                        <div>Kontoinhaber: {method.details.account_holder}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Sie haben noch keine Bankverbindungen hinzugefügt.
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              {/* Neue Zahlungsmethode hinzufügen */}
              <div className="space-y-4">
                <h4 className="font-medium">Neue Bankverbindung hinzufügen</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>IBAN</Label>
                    <Input
                      placeholder="DE89 3704 0044 0532 0130 00"
                      value={newPayment.iban}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, iban: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>BIC</Label>
                    <Input
                      placeholder="COBADEFFXXX"
                      value={newPayment.bic}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, bic: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Bank</Label>
                    <Input
                      placeholder="Commerzbank AG"
                      value={newPayment.bank_name}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, bank_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Kontoinhaber</Label>
                    <Input
                      placeholder="Max Mustermann"
                      value={newPayment.account_holder}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, account_holder: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={addPaymentMethod} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Bankverbindung hinzufügen
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}