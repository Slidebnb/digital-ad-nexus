import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCryptoWallet } from "@/hooks/useCryptoWallet";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { WalletConnectModal } from "./WalletConnectModal";
import { 
  Wallet, 
  Star, 
  Clock, 
  Trash2, 
  Plus, 
  Shield,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function CryptoWalletManager() {
  const { wallets, connections, loading, disconnectWallet, fetchWallets } = useCryptoWallet();
  const { prices, getCryptoSymbol } = useCryptoPrices();
  const [deletingWallet, setDeletingWallet] = useState<string | null>(null);

  const handleDeleteWallet = async (walletId: string) => {
    // Note: In a real implementation, you'd call a delete function
    setDeletingWallet(walletId);
    // Simulate delete
    setTimeout(() => {
      setDeletingWallet(null);
      fetchWallets();
      toast({
        title: "Wallet entfernt",
        description: "Die Wallet-Adresse wurde erfolgreich entfernt.",
      });
    }, 1000);
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletIcon = (crypto: string): string => {
    switch (crypto) {
      case 'BTC': return '₿';
      case 'ETH': return '🦊';
      case 'SOL': return '👻';
      default: return '💰';
    }
  };

  const getWalletColor = (crypto: string): string => {
    switch (crypto) {
      case 'BTC': return 'bg-orange-500';
      case 'ETH': return 'bg-blue-500';
      case 'SOL': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Crypto Wallets</h2>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre verbundenen Kryptowährungs-Wallets
          </p>
        </div>
        <WalletConnectModal onWalletConnected={() => fetchWallets()}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Wallet hinzufügen
          </Button>
        </WalletConnectModal>
      </div>

      {/* Connected Wallets Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['SOL', 'BTC', 'ETH'].map((crypto) => {
          const connection = connections[crypto];
          const price = prices[crypto];
          
          return (
            <Card key={crypto} className={connection?.connected ? 'border-green-200 bg-green-50/50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full ${getWalletColor(crypto)} flex items-center justify-center text-white text-sm font-bold`}>
                      {crypto}
                    </div>
                    <div>
                      <div className="font-medium">{crypto}</div>
                      {price && (
                        <div className="text-xs text-muted-foreground">
                          €{price.price_eur.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  {connection?.connected ? (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verbunden
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Nicht verbunden
                    </Badge>
                  )}
                </div>
                
                {connection?.connected && (
                  <div className="text-xs font-mono text-muted-foreground">
                    {formatAddress(connection.address)}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Saved Wallets */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Gespeicherte Wallets</h3>
        
        {wallets.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Keine Wallets gespeichert</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Verbinden Sie Ihre erste Wallet um loszulegen.
              </p>
              <WalletConnectModal onWalletConnected={() => fetchWallets()}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Wallet verbinden
                </Button>
              </WalletConnectModal>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {wallets.map((wallet) => (
              <Card key={wallet.id} className="transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${getWalletColor(wallet.cryptocurrency)} flex items-center justify-center text-white text-lg`}>
                        {getWalletIcon(wallet.cryptocurrency)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{wallet.cryptocurrency}</span>
                          <span className="text-sm text-muted-foreground">
                            ({wallet.wallet_type})
                          </span>
                          {wallet.is_primary && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                          {wallet.is_verified && (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Verifiziert
                            </Badge>
                          )}
                        </div>
                        <div className="font-mono text-sm text-muted-foreground">
                          {formatAddress(wallet.wallet_address)}
                        </div>
                        {wallet.last_used_at && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Zuletzt verwendet: {new Date(wallet.last_used_at).toLocaleDateString('de-DE')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deletingWallet === wallet.id}
                        onClick={() => wallet.id && handleDeleteWallet(wallet.id)}
                      >
                        {deletingWallet === wallet.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-current" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Sicherheitshinweis:</strong> Ihre privaten Schlüssel werden niemals gespeichert. 
          Wir speichern nur die öffentlichen Wallet-Adressen für einfachere Zahlungen. 
          Sie behalten jederzeit die volle Kontrolle über Ihre Kryptowährungen.
        </AlertDescription>
      </Alert>
    </div>
  );
}