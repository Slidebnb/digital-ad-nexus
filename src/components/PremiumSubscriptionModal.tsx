
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Zap, CheckCircle } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { PremiumQRModal } from './PremiumQRModal';

interface PremiumSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PremiumSubscriptionModal({ open, onOpenChange }: PremiumSubscriptionModalProps) {
  const { plans } = usePremium();
  const { prices, loading: pricesLoading } = useCryptoPrices();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const solPrice = prices['SOL']?.price_eur || 164;

  const handlePlanSelect = (plan: any) => {
    const planWithSolPrice = {
      ...plan,
      price_sol: plan.price_eur / solPrice
    };
    setSelectedPlan(planWithSolPrice);
    setQrModalOpen(true);
    onOpenChange(false);
  };

  const getPlanIcon = (planName: string) => {
    if (planName.includes('12')) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (planName.includes('3')) return <Star className="h-6 w-6 text-purple-500" />;
    return <Zap className="h-6 w-6 text-blue-500" />;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Crown className="h-6 w-6 text-yellow-500" />
              Premium Abonnement
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Wähle deinen Premium-Plan</h3>
              <p className="text-muted-foreground">
                Upgrade jetzt und erhalte exklusive Features! 🚀
              </p>
              {pricesLoading && (
                <p className="text-sm text-muted-foreground mt-2">
                  Lade aktuelle Preise...
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const solAmount = (plan.price_eur / solPrice).toFixed(4);
                
                return (
                  <Card 
                    key={plan.id} 
                    className={`relative cursor-pointer transition-all hover:shadow-lg ${
                      plan.popular ? 'border-primary shadow-md' : ''
                    }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                        Beliebt 🔥
                      </Badge>
                    )}
                    
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-2">
                        {getPlanIcon(plan.name)}
                      </div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <div className="space-y-1">
                        <div className="text-3xl font-bold text-primary">
                          {plan.price_eur}€
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ≈ {pricesLoading ? '...' : solAmount} SOL
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {plan.description}
                      </p>
                      
                      <div className="space-y-2">
                        {plan.benefits.map((benefit: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PremiumQRModal
        open={qrModalOpen}
        onOpenChange={setQrModalOpen}
        selectedPlan={selectedPlan}
      />
    </>
  );
}
