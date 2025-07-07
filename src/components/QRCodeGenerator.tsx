import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { QrCode, Copy, Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

interface QRCodeGeneratorProps {
  adId?: string;
  walletAddress?: string;
  amount?: number;
  coin?: string;
}

export function QRCodeGenerator({ 
  adId, 
  walletAddress: initialWallet = "", 
  amount: initialAmount = 0,
  coin: initialCoin = "BTC" 
}: QRCodeGeneratorProps) {
  const [walletAddress, setWalletAddress] = useState(initialWallet);
  const [amount, setAmount] = useState(initialAmount.toString());
  const [coin, setCoin] = useState(initialCoin);
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateQRCode = async () => {
    if (!walletAddress) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine Wallet-Adresse ein.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create crypto payment URI
      const amountValue = parseFloat(amount) || 0;
      let paymentUri = "";

      switch (coin.toUpperCase()) {
        case "BTC":
          paymentUri = `bitcoin:${walletAddress}${amountValue > 0 ? `?amount=${amountValue}` : ""}`;
          break;
        case "ETH":
          paymentUri = `ethereum:${walletAddress}${amountValue > 0 ? `?value=${amountValue}` : ""}`;
          break;
        case "LTC":
          paymentUri = `litecoin:${walletAddress}${amountValue > 0 ? `?amount=${amountValue}` : ""}`;
          break;
        default:
          // Generic format
          paymentUri = `${coin.toLowerCase()}:${walletAddress}${amountValue > 0 ? `?amount=${amountValue}` : ""}`;
      }

      // Generate QR Code
      const qrCode = await QRCode.toDataURL(paymentUri, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeData(qrCode);
      
      toast({
        title: "QR-Code generiert",
        description: "Der QR-Code für die Zahlung wurde erfolgreich erstellt."
      });
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Kopiert",
        description: "Wallet-Adresse wurde in die Zwischenablage kopiert."
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Kopieren fehlgeschlagen.",
        variant: "destructive"
      });
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeData) return;

    const link = document.createElement('a');
    link.download = `qr-code-${coin}-${Date.now()}.png`;
    link.href = qrCodeData;
    link.click();
    
    toast({
      title: "Download gestartet",
      description: "QR-Code wird heruntergeladen."
    });
  };

  const shareQRCode = async () => {
    if (!qrCodeData) return;

    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeData);
      const blob = await response.blob();
      const file = new File([blob], `qr-code-${coin}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${coin} Wallet QR-Code`,
          text: `QR-Code für ${coin} Zahlung`,
          files: [file]
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`Wallet: ${walletAddress}${amount ? ` | Betrag: ${amount} ${coin}` : ""}`);
        toast({
          title: "Details kopiert",
          description: "Wallet-Details wurden in die Zwischenablage kopiert."
        });
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      toast({
        title: "Teilen fehlgeschlagen",
        description: "QR-Code konnte nicht geteilt werden.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR-Code Generator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Input Fields */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="coin">Kryptowährung</Label>
            <Input
              id="coin"
              value={coin}
              onChange={(e) => setCoin(e.target.value.toUpperCase())}
              placeholder="z.B. BTC, ETH, LTC"
              maxLength={10}
            />
          </div>
          
          <div>
            <Label htmlFor="wallet">Wallet-Adresse</Label>
            <div className="flex gap-2">
              <Input
                id="wallet"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Wallet-Adresse eingeben"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(walletAddress)}
                disabled={!walletAddress}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="amount">Betrag (optional)</Label>
            <Input
              id="amount"
              type="number"
              step="0.00000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="z.B. 0.001"
            />
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generateQRCode} 
          disabled={loading || !walletAddress}
          className="w-full"
        >
          {loading ? "Generiere..." : "QR-Code erstellen"}
        </Button>

        {/* QR Code Display */}
        {qrCodeData && (
          <div className="space-y-4">
            <div className="text-center">
              <img 
                src={qrCodeData} 
                alt="Payment QR Code" 
                className="mx-auto border rounded-lg shadow-sm bg-white p-2"
              />
            </div>
            
            {/* Payment Details */}
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Coin:</span>
                <Badge>{coin}</Badge>
              </div>
              {amount && parseFloat(amount) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Betrag:</span>
                  <span className="text-sm">{amount} {coin}</span>
                </div>
              )}
              <div className="space-y-1">
                <span className="text-sm font-medium">Wallet:</span>
                <p className="text-xs font-mono break-all bg-background p-2 rounded border">
                  {walletAddress}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadQRCode}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareQRCode}
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Teilen
              </Button>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• QR-Codes werden clientseitig generiert (DSGVO-konform)</p>
          <p>• Unterstützt Standard-Krypto-URI-Schemas</p>
          <p>• Kompatibel mit den meisten Wallet-Apps</p>
        </div>
      </CardContent>
    </Card>
  );
}