import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Crown, Star, Zap, Shield, TrendingUp, CheckCircle, Wallet } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';
import { useToast } from '@/hooks/use-toast';

interface PremiumSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PremiumSubscriptionModal({ open, onOpenChange }: PremiumSubscriptionModalProps) {
  const { plans, createPremiumPayment, verifyPremiumPayment } = usePremium();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'payment' | 'confirm'>('select');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setStep('payment');
  };

  const handleCreatePayment = async () => {
    if (!selectedPlan || !walletAddress.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte wähle einen Plan und gib deine Wallet-Adresse ein.",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessing(true);
      const payment = await createPremiumPayment(selectedPlan, walletAddress);
      setPaymentDetails(payment);
      setStep('confirm');
      
      toast({
        title: "Zahlung erstellt! 💰",
        description: "Sende jetzt die SOL an die angegebene Adresse.",
      });
    } catch (error) {
      console.error('Payment creation failed:', error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Zahlung konnte nicht erstellt werden.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyPayment = async () => {
    const signature = prompt("Bitte gib die Transaktions-Signatur ein:");
    if (!signature) return;

    try {
      setProcessing(true);
      await verifyPremiumPayment(paymentDetails.subscriptionId, signature);
      onOpenChange(false);
      // Reset state
      setStep('select');
      setSelectedPlan(null);
      setWalletAddress('');
      setPaymentDetails(null);
    } catch (error) {
      console.error('Payment verification failed:', error);
      toast({
        title: "Verifikation fehlgeschlagen",
        description: error instanceof Error ? error.message : "Zahlung konnte nicht verifiziert werden.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopiert! 📋",
      description: "Adresse wurde in die Zwischenablage kopiert.",
    });
  };

  const getPlanIcon = (planName: string) => {
    if (planName.includes('12')) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (planName.includes('3')) return <Star className="h-6 w-6 text-purple-500" />;
    return <Zap className="h-6 w-6 text-blue-500" />;
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="h-6 w-6 text-yellow-500" />
            Premium Abonnement
          </DialogTitle>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Wähle deinen Premium-Plan</h3>
              <p className="text-muted-foreground">
                Upgrade jetzt und erhalte exklusive Features! 🚀
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative cursor-pointer transition-all hover:shadow-lg ${
                    plan.popular ? 'border-primary shadow-md' : ''
                  }`}
                  onClick={() => handlePlanSelect(plan.id)}
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
                        {plan.price_sol} SOL
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ≈ {plan.price_eur}€
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.description}
                    </p>
                    
                    <div className="space-y-2">
                      {plan.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 'payment' && selectedPlanData && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Zahlungsdetails</h3>
              <p className="text-muted-foreground">
                Du hast {selectedPlanData.name} ausgewählt
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getPlanIcon(selectedPlanData.name)}
                  {selectedPlanData.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Preis:</span>
                  <div className="text-right">
                    <div className="text-primary">{selectedPlanData.price_sol} SOL</div>
                    <div className="text-sm text-muted-foreground">≈ {selectedPlanData.price_eur}€</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <Label htmlFor="wallet">Deine Solana Wallet-Adresse</Label>
                <Input
                  id="wallet"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Gib deine Solana Wallet-Adresse ein..."
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Diese Adresse wird für die Rückerstattung benötigt, falls erforderlich.
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('select')}>
                  Zurück
                </Button>
                <Button 
                  onClick={handleCreatePayment} 
                  disabled={processing || !walletAddress.trim()}
                  className="flex-1"
                >
                  {processing ? 'Erstelle Zahlung...' : 'Zahlung erstellen'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'confirm' && paymentDetails && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Zahlung senden 💰</h3>
              <p className="text-muted-foreground">
                Sende die SOL an die unten stehende Adresse
              </p>
            </div>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Zahlungsdetails
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Empfänger-Adresse:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={paymentDetails.recipientWallet} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(paymentDetails.recipientWallet)}
                    >
                      Kopieren
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Betrag:</Label>
                  <div className="text-2xl font-bold text-primary mt-1">
                    {paymentDetails.amount} SOL
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Memo/Reference:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={paymentDetails.reference} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(paymentDetails.reference)}
                    >
                      Kopieren
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4" />
                Wichtige Hinweise:
              </h4>
              <ul className="text-sm space-y-1">
                <li>• Sende genau {paymentDetails.amount} SOL</li>
                <li>• Füge die Reference als Memo hinzu</li>
                <li>• Die Aktivierung erfolgt nach Zahlungsbestätigung</li>
                <li>• Bei Problemen kontaktiere den Support</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('payment')}>
                Zurück
              </Button>
              <Button 
                onClick={handleVerifyPayment} 
                disabled={processing}
                className="flex-1"
              >
                {processing ? 'Verifiziere...' : 'Zahlung verifizieren'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}