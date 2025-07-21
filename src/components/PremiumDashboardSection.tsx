
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Crown, Star, Zap, Calendar, TrendingUp, Shield, Eye, Heart, MessageCircle } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';
import { useProfile } from '@/hooks/useProfile';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { PremiumButton } from '@/components/PremiumButton';
import { PremiumBadge } from '@/components/PremiumBadge';
import { PremiumSubscriptionModal } from '@/components/PremiumSubscriptionModal';
import BoostAdModal from '@/components/BoostAdModal';
import { QRCodeSVG } from 'qrcode.react';

const OUR_SOLANA_WALLET = '6rGVhxNk6LrR9SDnVX3aKMYLEYFG7q6KMiKVj6CCsqWz';

export function PremiumDashboardSection() {
  const { isPremium, subscription, plans, features, getDaysRemaining } = usePremium();
  const { userAds } = useProfile();
  const { prices } = useCryptoPrices();
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');

  const daysLeft = getDaysRemaining();
  const isExpiringSoon = daysLeft <= 7;

  // Premium Plan Features für Anzeige
  const premiumFeatures = [
    { name: 'Priority Support', icon: Shield, active: features.prioritySupport },
    { name: 'Unlimited Ads', icon: Star, active: features.unlimitedAds },
    { name: 'Advanced Analytics', icon: TrendingUp, active: features.advancedAnalytics },
    { name: 'Premium Badge', icon: Crown, active: features.premiumBadge },
    { name: 'Boost Discount', icon: Zap, active: features.boostDiscount },
    { name: 'Early Access', icon: Eye, active: features.earlyAccess },
    { name: 'VIP Features', icon: Heart, active: features.vipFeatures },
  ];

  const boostableAds = userAds.filter(ad => ad.status === 'active');

  const handleBoostAd = (adId: string) => {
    setSelectedAdId(adId);
    setBoostModalOpen(true);
  };

  const generatePaymentQR = (amount: number, memo: string) => {
    const paymentUrl = `solana:${OUR_SOLANA_WALLET}?amount=${amount}&memo=${encodeURIComponent(memo)}`;
    return paymentUrl;
  };

  return (
    <div className="space-y-6">
      {/* Premium Status Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Premium Dashboard
          </h2>
          <p className="text-muted-foreground">
            {isPremium 
              ? `Aktives Premium-Abonnement ${isExpiringSoon ? `(läuft in ${daysLeft} Tagen ab)` : ''}`
              : 'Upgrade zu Premium für exklusive Features'
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isPremium ? (
            <div className="flex items-center gap-2">
              <PremiumBadge size="md" />
              {isExpiringSoon && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPremiumModalOpen(true)}
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  Verlängern
                </Button>
              )}
            </div>
          ) : (
            <PremiumButton />
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Pläne
          </TabsTrigger>
          <TabsTrigger value="boost" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Boost Anzeigen
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Zahlung
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {isPremium && subscription ? (
            <Card className="gradient-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Aktives Premium-Abonnement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="font-semibold">{subscription.plan_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className="bg-success/10 text-success border-success/20">
                      {subscription.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Läuft ab</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(subscription.expires_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
                {isExpiringSoon && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <p className="text-orange-700 dark:text-orange-300 font-medium">
                      ⚠️ Ihr Premium-Abonnement läuft in {daysLeft} Tagen ab!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="gradient-card">
              <CardContent className="p-8 text-center">
                <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Upgrade zu Premium</h3>
                <p className="text-muted-foreground mb-6">
                  Erhalten Sie Zugang zu exklusiven Features und priorisiertem Support
                </p>
                <PremiumButton size="lg" />
              </CardContent>
            </Card>
          )}

          {/* Premium Features Overview */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle>Premium Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {premiumFeatures.map((feature) => (
                  <div 
                    key={feature.name}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      feature.active 
                        ? 'border-success/20 bg-success/5' 
                        : 'border-muted bg-muted/50'
                    }`}
                  >
                    <feature.icon className={`h-5 w-5 ${
                      feature.active ? 'text-success' : 'text-muted-foreground'
                    }`} />
                    <span className={
                      feature.active ? 'text-foreground' : 'text-muted-foreground'
                    }>
                      {feature.name}
                    </span>
                    {feature.active && (
                      <Badge variant="outline" className="ml-auto bg-success/10 text-success border-success/20">
                        Aktiv
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle>Premium Pläne</CardTitle>
              <p className="text-muted-foreground">
                Wählen Sie den Plan, der am besten zu Ihren Bedürfnissen passt
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card 
                    key={plan.id}
                    className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                        Beliebt 🔥
                      </Badge>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="flex items-center justify-center gap-2">
                        {plan.name.includes('12') ? (
                          <Crown className="h-6 w-6 text-yellow-500" />
                        ) : (
                          <Star className="h-6 w-6 text-purple-500" />
                        )}
                        {plan.name}
                      </CardTitle>
                      <div className="space-y-1">
                        <div className="text-3xl font-bold text-primary">
                          {plan.price_sol} SOL
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ≈ {plan.price_eur}€
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground text-center">
                        {plan.description}
                      </p>
                      <div className="space-y-2">
                        {plan.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-1 h-1 bg-success rounded-full" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="w-full" 
                        variant={plan.popular ? "default" : "outline"}
                        onClick={() => setPremiumModalOpen(true)}
                      >
                        Plan wählen
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Boost Ads Tab */}
        <TabsContent value="boost" className="space-y-6">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Anzeigen boosten
              </CardTitle>
              <p className="text-muted-foreground">
                Erhöhen Sie die Sichtbarkeit Ihrer Anzeigen mit Boost-Paketen
              </p>
            </CardHeader>
            <CardContent>
              {boostableAds.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Keine aktiven Anzeigen</h3>
                  <p className="text-muted-foreground mb-4">
                    Sie benötigen aktive Anzeigen, um diese zu boosten
                  </p>
                  <Button variant="outline" onClick={() => window.location.href = '/create-ad'}>
                    Neue Anzeige erstellen
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {boostableAds.map((ad) => {
                    const isBoosted = ad.boosted_until && new Date(ad.boosted_until) > new Date();
                    const boostDaysLeft = isBoosted 
                      ? Math.ceil((new Date(ad.boosted_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      : 0;

                    return (
                      <Card key={ad.id} className={`${isBoosted ? 'ring-2 ring-primary/30 bg-primary/5' : ''}`}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                              {ad.images && ad.images.length > 0 ? (
                                <img 
                                  src={ad.images[0]} 
                                  alt={ad.title}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="text-2xl">📷</div>
                              )}
                            </div>
                            
                            <div className="flex-1 space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                  {ad.title}
                                  {isBoosted && (
                                    <Badge className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
                                      <Zap className="h-3 w-3" />
                                      Geboostet ({boostDaysLeft}d)
                                    </Badge>
                                  )}
                                </h3>
                                <div className="text-xl font-bold text-primary">
                                  €{Number(ad.price || 0).toLocaleString()}
                                </div>
                              </div>
                              
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {ad.views || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="h-4 w-4" />
                                  {ad.favorites || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4" />
                                  {ad.contact_count || 0}
                                </span>
                              </div>
                              
                              <div className="flex justify-end">
                                <Button 
                                  variant={isBoosted ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleBoostAd(ad.id)}
                                  className={isBoosted ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600" : ""}
                                >
                                  <Zap className="h-4 w-4 mr-1" />
                                  {isBoosted ? "Verlängern" : "Boost buchen"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-6">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Solana Zahlung
              </CardTitle>
              <p className="text-muted-foreground">
                Bezahlen Sie mit SOL direkt an unsere Wallet-Adresse
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Unsere Wallet-Adresse */}
              <div className="text-center space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Unsere Solana Wallet-Adresse:</p>
                  <p className="font-mono text-sm break-all bg-background p-2 rounded border">
                    {OUR_SOLANA_WALLET}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => navigator.clipboard.writeText(OUR_SOLANA_WALLET)}
                  >
                    Adresse kopieren
                  </Button>
                </div>

                {/* QR Code für unsere Wallet */}
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg border">
                    <QRCodeSVG 
                      value={OUR_SOLANA_WALLET}
                      size={200}
                      level="M"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Zahlungshinweise:</h4>
                  <ul className="text-sm space-y-1 text-left">
                    <li>• Verwenden Sie die Premium-Modals für automatische Verarbeitung</li>
                    <li>• Bei manueller Zahlung: Fügen Sie Ihre User-ID als Memo hinzu</li>
                    <li>• Zahlungen werden innerhalb von 10 Minuten verarbeitet</li>
                    <li>• Bei Problemen kontaktieren Sie den Support</li>
                  </ul>
                </div>

                {/* SOL Preis Anzeige */}
                {prices.SOL && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Aktueller SOL Preis:</p>
                    <p className="text-lg font-semibold">
                      1 SOL = €{prices.SOL.price_eur.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <PremiumSubscriptionModal 
        open={premiumModalOpen} 
        onOpenChange={setPremiumModalOpen} 
      />
      
      <BoostAdModal
        isOpen={boostModalOpen}
        onClose={() => {
          setBoostModalOpen(false);
          setSelectedAdId('');
        }}
        adId={selectedAdId}
      />
    </div>
  );
}
