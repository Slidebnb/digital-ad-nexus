import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Camera, Copy, Download, Share2 } from 'lucide-react';
import QRCode from 'qrcode';
import { useToast } from '@/hooks/use-toast';

interface WalletAddress {
  coin: string;
  address: string;
  label?: string;
}

export function QRCodeScanner() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'generate' | 'scan'>('generate');
  const [walletAddresses, setWalletAddresses] = useState<WalletAddress[]>([
    { coin: 'BTC', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', label: 'Haupt-Wallet' },
    { coin: 'ETH', address: '0x742d35Cc6134C0532925a3b8D9C9d41531cF9D2c', label: 'Trading-Wallet' },
    { coin: 'SOL', address: '7YfPPxGbLsBe9TKVHt6T8rJSVP1zZ5N8DxQ2vHJYE7g', label: 'DeFi-Wallet' }
  ]);
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [customAddress, setCustomAddress] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async (address: string) => {
    if (!address) return;
    
    setLoading(true);
    try {
      const url = await QRCode.toDataURL(address, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Fehler",
        description: "QR-Code konnte nicht generiert werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const selectedWallet = walletAddresses.find(w => w.coin === selectedCoin);
    if (selectedWallet) {
      generateQRCode(selectedWallet.address);
    }
  }, [selectedCoin, walletAddresses]);

  useEffect(() => {
    if (customAddress) {
      generateQRCode(customAddress);
    }
  }, [customAddress]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopiert",
      description: "Adresse wurde in die Zwischenablage kopiert.",
    });
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `qr-code-${selectedCoin || 'custom'}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const shareQRCode = async () => {
    if (!qrCodeUrl) return;

    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      
      if (navigator.share && navigator.canShare) {
        await navigator.share({
          title: `${selectedCoin} Wallet Adresse`,
          files: [new File([blob], `qr-code-${selectedCoin}.png`, { type: 'image/png' })]
        });
      } else {
        // Fallback: copy to clipboard
        const address = customAddress || walletAddresses.find(w => w.coin === selectedCoin)?.address || '';
        copyToClipboard(address);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Fehler",
        description: "QR-Code konnte nicht geteilt werden.",
        variant: "destructive"
      });
    }
  };

  const getCurrentAddress = () => {
    if (customAddress) return customAddress;
    return walletAddresses.find(w => w.coin === selectedCoin)?.address || '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR-Code Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tab Buttons */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === 'generate' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('generate')}
            className="flex-1"
          >
            QR-Code generieren
          </Button>
          <Button
            variant={activeTab === 'scan' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('scan')}
            className="flex-1"
          >
            QR-Code scannen
          </Button>
        </div>

        {activeTab === 'generate' && (
          <div className="space-y-6">
            {/* Wallet Selection */}
            <div className="space-y-4">
              <Label>Wallet auswählen</Label>
              <div className="grid grid-cols-3 gap-2">
                {walletAddresses.map((wallet) => (
                  <Button
                    key={wallet.coin}
                    variant={selectedCoin === wallet.coin ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedCoin(wallet.coin);
                      setCustomAddress('');
                    }}
                  >
                    {wallet.coin}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Address */}
            <div className="space-y-2">
              <Label htmlFor="customAddress">Oder eigene Adresse eingeben</Label>
              <Input
                id="customAddress"
                placeholder="Wallet-Adresse eingeben..."
                value={customAddress}
                onChange={(e) => {
                  setCustomAddress(e.target.value);
                  setSelectedCoin('');
                }}
              />
            </div>

            {/* QR Code Display */}
            {qrCodeUrl && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                  </div>
                </div>

                {/* Address Display */}
                <div className="space-y-2">
                  <Label>Wallet-Adresse</Label>
                  <div className="flex gap-2">
                    <Input
                      value={getCurrentAddress()}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(getCurrentAddress())}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={downloadQRCode} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Herunterladen
                  </Button>
                  <Button variant="outline" onClick={shareQRCode} className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Teilen
                  </Button>
                </div>
              </div>
            )}

            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Generiere QR-Code...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'scan' && (
          <div className="space-y-4">
            <Alert>
              <Camera className="h-4 w-4" />
              <AlertDescription>
                QR-Code Scanner wird bald verfügbar sein. Momentan können Sie QR-Codes nur generieren.
              </AlertDescription>
            </Alert>
            
            <div className="text-center py-12 text-muted-foreground">
              <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Scanner in Entwicklung</h3>
              <p className="text-sm">
                Die QR-Code Scanner-Funktion wird in einem zukünftigen Update verfügbar sein.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}