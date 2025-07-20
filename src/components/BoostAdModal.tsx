
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Zap, Target, TrendingUp, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedSolanaPayment } from './EnhancedSolanaPayment';

interface BoostPackage {
  id: number;
  name: string;
  description: string;
  price_eur: number;
  price_sol: number;
  duration_days: number;
  features: string[];
}

interface BoostAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: string;
}

const BoostAdModal: React.FC<BoostAdModalProps> = ({ isOpen, onClose, adId }) => {
  const { toast } = useToast();
  const [boostPackages, setBoostPackages] = useState<BoostPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<BoostPackage | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBoostPackages();
    }
  }, [isOpen]);

  const fetchBoostPackages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('boost_packages')
        .select('*')
        .eq('active', true)
        .order('price_eur', { ascending: true });

      if (error) throw error;
      setBoostPackages(data || []);
    } catch (error) {
      console.error('Error fetching boost packages:', error);
      toast({
        title: "Fehler",
        description: "Boost-Pakete konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (pkg: BoostPackage) => {
    setSelectedPackage(pkg);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Anzeige geboostet!",
      description: `Ihre Anzeige wird für ${selectedPackage?.duration_days} Tage hervorgehoben.`,
    });
    onClose();
  };

  const handleBackToPackages = () => {
    setShowPayment(false);
    setSelectedPackage(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {showPayment && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToPackages}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Zap className="h-5 w-5 text-yellow-500" />
            {showPayment ? 'Automatische Solana-Zahlung' : 'Anzeige boosten'}
          </DialogTitle>
          <DialogDescription>
            {showPayment
              ? 'Scannen Sie einfach den QR-Code mit Ihrer Solana Wallet'
              : 'Erhöhen Sie die Sichtbarkeit Ihrer Anzeige und erreichen Sie mehr potenzielle Käufer.'
            }
          </DialogDescription>
        </DialogHeader>

        {showPayment && selectedPackage ? (
          <EnhancedSolanaPayment
            adId={adId}
            boostPackage={selectedPackage}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={handleBackToPackages}
          />
        ) : loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-green-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">SOL</span>
                </div>
                <span className="font-medium">Automatische Krypto-Zahlungen</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Einfach QR-Code scannen und bezahlen - vollautomatisch mit Solana (SOL). 
                Keine manuelle Eingabe von Transaktions-IDs erforderlich!
              </p>
            </div>

            <div className="grid gap-4">
              {boostPackages.map((pkg) => (
                <Card key={pkg.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {pkg.name === 'Basic Boost' && <Star className="h-4 w-4 text-blue-500" />}
                          {pkg.name === 'Premium Boost' && <Target className="h-4 w-4 text-purple-500" />}
                          {pkg.name === 'Ultimate Boost' && <TrendingUp className="h-4 w-4 text-orange-500" />}
                          {pkg.name}
                        </CardTitle>
                        <CardDescription>{pkg.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {pkg.price_sol?.toFixed(4)} SOL
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ~€{pkg.price_eur} • {pkg.duration_days} Tage
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {pkg.features.map((feature, index) => (
                          <Badge key={index} variant="secondary">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        onClick={() => handleSelectPackage(pkg)}
                        className="w-full"
                        variant={pkg.name === 'Ultimate Boost' ? 'default' : 'outline'}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Jetzt automatisch bezahlen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BoostAdModal;
