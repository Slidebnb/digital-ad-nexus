import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCryptoWallet } from "@/hooks/useCryptoWallet";
import { Wallet, Smartphone, Shield, CheckCircle, AlertCircle } from "lucide-react";

interface WalletConnectModalProps {
  children: React.ReactNode;
  onWalletConnected?: (crypto: string, address: string) => void;
}

export function WalletConnectModal({ children, onWalletConnected }: WalletConnectModalProps) {
  const [open, setOpen] = useState(false);
  const { 
    connections, 
    loading, 
    connectMetaMask, 
    connectPhantom, 
    connectUnisat,
    saveWallet,
    disconnectWallet 
  } = useCryptoWallet();

  const handleConnect = async (crypto: string, connectFn: () => Promise<string | null>) => {
    const address = await connectFn();
    if (address) {
      const walletType = getWalletType(crypto);
      await saveWallet(address, crypto, walletType, true);
      onWalletConnected?.(crypto, address);
    }
  };

  const getWalletType = (crypto: string): string => {
    switch (crypto) {
      case 'ETH': return 'metamask';
      case 'SOL': return 'phantom';
      case 'BTC': return 'unisat';
      default: return 'unknown';
    }
  };

  const walletConfigs = [
    {
      crypto: 'ETH',
      name: 'Ethereum',
      wallet: 'MetaMask',
      icon: '🦊',
      color: 'bg-blue-500',
      description: 'Connect your MetaMask wallet for Ethereum payments',
      installUrl: 'https://metamask.io/download/',
      connectFn: connectMetaMask,
      available: typeof window !== 'undefined' && !!window.ethereum
    },
    {
      crypto: 'SOL',
      name: 'Solana',
      wallet: 'Phantom',
      icon: '👻',
      color: 'bg-purple-500',
      description: 'Connect your Phantom wallet for Solana payments',
      installUrl: 'https://phantom.app/',
      connectFn: connectPhantom,
      available: typeof window !== 'undefined' && !!window.solana?.isPhantom
    },
    {
      crypto: 'BTC',
      name: 'Bitcoin',
      wallet: 'Unisat',
      icon: '₿',
      color: 'bg-orange-500',
      description: 'Connect your Unisat wallet for Bitcoin payments',
      installUrl: 'https://unisat.io/',
      connectFn: connectUnisat,
      available: typeof window !== 'undefined' && !!window.unisat
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Crypto Wallet verbinden
          </DialogTitle>
          <DialogDescription>
            Verbinden Sie Ihre Wallets um mit Kryptowährungen zu bezahlen. Unterstützte Coins: SOL, BTC, ETH
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Connected Wallets */}
          {Object.values(connections).some(c => c.connected) && (
            <>
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">Verbundene Wallets</h3>
                {Object.entries(connections).map(([crypto, connection]) => 
                  connection.connected && (
                    <Card key={crypto} className="border-green-200 bg-green-50/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${walletConfigs.find(w => w.crypto === crypto)?.color} flex items-center justify-center text-white text-sm font-bold`}>
                              {walletConfigs.find(w => w.crypto === crypto)?.crypto}
                            </div>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {crypto} - {connection.type}
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </div>
                              <div className="text-sm text-muted-foreground font-mono">
                                {connection.address.slice(0, 6)}...{connection.address.slice(-4)}
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => disconnectWallet(crypto)}
                          >
                            Trennen
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Available Wallets */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">Verfügbare Wallets</h3>
            <div className="grid gap-4">
              {walletConfigs.map((config) => {
                const isConnected = connections[config.crypto]?.connected;
                
                return (
                  <Card 
                    key={config.crypto}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isConnected ? 'opacity-50' : 'hover:border-primary/50'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center text-white text-lg`}>
                            {config.icon}
                          </div>
                          <div>
                            <CardTitle className="text-base">{config.name}</CardTitle>
                            <CardDescription className="text-sm">{config.wallet} Wallet</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {config.available ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Verfügbar
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Nicht installiert
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4">
                        {config.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Shield className="h-3 w-3" />
                            Sicher & Verschlüsselt
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Smartphone className="h-3 w-3" />
                            Mobile Support
                          </div>
                        </div>
                        
                        {config.available ? (
                          <Button 
                            size="sm"
                            disabled={loading || isConnected}
                            onClick={() => handleConnect(config.crypto, config.connectFn)}
                          >
                            {loading ? "Verbinden..." : isConnected ? "Verbunden" : "Verbinden"}
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(config.installUrl, '_blank')}
                          >
                            Installieren
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Security Notice */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Sicherheitshinweis</h4>
                  <p className="text-sm text-blue-700">
                    Ihre Wallet-Verbindungen sind sicher und verschlüsselt. Wir speichern niemals Ihre privaten Schlüssel oder Seed-Phrasen. 
                    Sie behalten jederzeit die volle Kontrolle über Ihre Kryptowährungen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}