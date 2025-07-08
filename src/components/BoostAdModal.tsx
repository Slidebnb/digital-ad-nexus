import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { CryptoPaymentModal } from "./CryptoPaymentModal";
import { WalletConnectModal } from "./WalletConnectModal";
import { TrendingUp, Zap, Star, Info, Wallet, CreditCard } from "lucide-react";

interface BoostPackage {
  id: number;
  name: string;
  description: string;
  price_eur: number;
  price_sol?: number;
  price_btc?: number;
  price_eth?: number;
  duration_days: number;
  features: string[];
  crypto_enabled: boolean;
}

interface BoostAdModalProps {
  children: React.ReactNode;
}

export function BoostAdModal({ children }: BoostAdModalProps) {
  const { user } = useAuth();
  const { userAds } = useProfile();
  const { convertEurToCrypto, formatCryptoAmount, getCryptoSymbol, prices } = useCryptoPrices();
  const [open, setOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<string>("");
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [packages, setPackages] = useState<BoostPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'eur' | 'crypto'>('eur');
  const [showCryptoPayment, setShowCryptoPayment] = useState(false);

  const activeAds = userAds.filter(ad => ad.status === 'active');

  useEffect(() => {
    if (open) {
      fetchBoostPackages();
    }
  }, [open]);

  const fetchBoostPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('boost_packages')
        .select('*')
        .eq('active', true)
        .order('price_eur', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching boost packages:', error);
    }
  };

  const handleBoost = async () => {
    if (!selectedAd || !selectedPackage || !user?.id) return;

    const selectedPackageData = packages.find(p => p.id.toString() === selectedPackage);
    if (!selectedPackageData) return;

    if (paymentMethod === 'crypto') {
      setShowCryptoPayment(true);
      return;
    }

    // EUR Payment (existing logic)
    setLoading(true);
    try {
      const boostEnd = new Date();
      boostEnd.setDate(boostEnd.getDate() + selectedPackageData.duration_days);

      const { error } = await supabase
        .from('boosts')
        .insert({
          user_id: user.id,
          ad_id: selectedAd,
          boost_type: 'paid',
          boost_start: new Date().toISOString(),
          boost_end: boostEnd.toISOString()
        });

      if (error) throw error;

      // Update ad as boosted
      await supabase
        .from('ads')
        .update({ 
          boosted_until: boostEnd.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAd);

      setOpen(false);
      setSelectedAd("");
      setSelectedPackage("");
      
      alert(`Anzeige erfolgreich für ${selectedPackageData.duration_days} Tage geboostet!`);
    } catch (error) {
      console.error('Error boosting ad:', error);
      alert('Fehler beim Boosten der Anzeige. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoPaymentComplete = (paymentId: string) => {
    setShowCryptoPayment(false);
    setOpen(false);
    setSelectedAd("");
    setSelectedPackage("");
  };

  const selectedPackageData = packages.find(p => p.id.toString() === selectedPackage);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Anzeige Boosten
          </DialogTitle>
          <DialogDescription>
            Steigern Sie die Sichtbarkeit Ihrer Anzeige und erreichen Sie mehr potentielle Käufer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Anzeige auswählen */}
          <div className="space-y-3">
            <h3 className="font-medium">Anzeige auswählen</h3>
            <Select value={selectedAd} onValueChange={setSelectedAd}>
              <SelectTrigger>
                <SelectValue placeholder="Wählen Sie eine Anzeige zum Boosten" />
              </SelectTrigger>
              <SelectContent>
                {activeAds.length === 0 ? (
                  <SelectItem value="" disabled>
                    Keine aktiven Anzeigen verfügbar
                  </SelectItem>
                ) : (
                  activeAds.map((ad) => (
                    <SelectItem key={ad.id} value={ad.id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{ad.title}</span>
                        <span className="text-primary font-medium ml-2">
                          €{ad.price}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <h3 className="font-medium">Zahlungsmethode</h3>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="payment-eur"
                  checked={paymentMethod === 'eur'}
                  onCheckedChange={() => setPaymentMethod('eur')}
                />
                <Label htmlFor="payment-eur" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  EUR (Klassisch)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="payment-crypto"
                  checked={paymentMethod === 'crypto'}
                  onCheckedChange={() => setPaymentMethod('crypto')}
                />
                <Label htmlFor="payment-crypto" className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Kryptowährung
                </Label>
              </div>
            </div>
            
            {paymentMethod === 'crypto' && (
              <Alert>
                <Wallet className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Bezahlen Sie mit SOL, BTC oder ETH</span>
                  <WalletConnectModal>
                    <Button size="sm" variant="outline">Wallet verbinden</Button>
                  </WalletConnectModal>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Boost-Pakete */}
          <div className="space-y-3">
            <h3 className="font-medium">Boost-Paket wählen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map((pkg) => (
                <Card 
                  key={pkg.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPackage === pkg.id.toString() 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPackage(pkg.id.toString())}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {pkg.name === 'Premium' && <Star className="h-4 w-4 text-warning" />}
                        {pkg.name === 'Standard' && <Zap className="h-4 w-4 text-secondary" />}
                        {pkg.name === 'Basic' && <TrendingUp className="h-4 w-4 text-accent" />}
                        {pkg.name}
                      </CardTitle>
                      <Badge variant="outline">
                        {pkg.duration_days} Tage
                      </Badge>
                    </div>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Price Display */}
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-primary">
                          €{pkg.price_eur}
                        </div>
                        
                        {paymentMethod === 'crypto' && pkg.crypto_enabled && (
                          <div className="space-y-1 text-sm">
                            {pkg.price_sol && prices.SOL && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">SOL:</span>
                                <span className="font-medium">◎ {formatCryptoAmount(pkg.price_sol, 'SOL')}</span>
                              </div>
                            )}
                            {pkg.price_btc && prices.BTC && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">BTC:</span>
                                <span className="font-medium">₿ {formatCryptoAmount(pkg.price_btc, 'BTC')}</span>
                              </div>
                            )}
                            {pkg.price_eth && prices.ETH && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">ETH:</span>
                                <span className="font-medium">Ξ {formatCryptoAmount(pkg.price_eth, 'ETH')}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {pkg.features && pkg.features.length > 0 && (
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium">Features:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {pkg.features.map((feature, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Zusammenfassung */}
          {selectedAd && selectedPackageData && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div><strong>Anzeige:</strong> {activeAds.find(ad => ad.id === selectedAd)?.title}</div>
                  <div><strong>Paket:</strong> {selectedPackageData.name}</div>
                  <div><strong>Dauer:</strong> {selectedPackageData.duration_days} Tage</div>
                  <div><strong>Preis:</strong> €{selectedPackageData.price_eur}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleBoost}
              disabled={!selectedAd || !selectedPackage || loading || activeAds.length === 0}
              className="min-w-24"
            >
              {loading ? "Wird verarbeitet..." : paymentMethod === 'crypto' ? "Mit Krypto bezahlen" : "Jetzt Boosten"}
            </Button>
          </div>

          {activeAds.length === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Sie haben keine aktiven Anzeigen zum Boosten. Erstellen Sie zuerst eine Anzeige.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Crypto Payment Modal */}
        {selectedPackageData && (
          <CryptoPaymentModal
            open={showCryptoPayment}
            onOpenChange={setShowCryptoPayment}
            paymentType="boost"
            eurAmount={selectedPackageData.price_eur}
            title="Anzeige Boosten - Krypto Zahlung"
            description={`${selectedPackageData.name} Paket für ${selectedPackageData.duration_days} Tage`}
            onPaymentComplete={handleCryptoPaymentComplete}
            adId={selectedAd}
            packageId={selectedPackageData.id}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}