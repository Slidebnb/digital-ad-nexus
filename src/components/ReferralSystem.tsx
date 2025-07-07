import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Gift, Copy, Share2, TrendingUp, Euro } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  thisMonthEarnings: number;
  commissionRate: number;
  nextTierReferrals: number;
  currentTier: string;
}

interface ReferralActivity {
  id: string;
  userName: string;
  action: string;
  amount: number;
  date: string;
}

export function ReferralSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarnings: 156.50,
    thisMonthEarnings: 23.75,
    commissionRate: 5,
    nextTierReferrals: 25,
    currentTier: 'Bronze'
  });
  
  const [recentActivity, setRecentActivity] = useState<ReferralActivity[]>([
    {
      id: '1',
      userName: 'Max M.',
      action: 'Erste Anzeige erstellt',
      amount: 2.50,
      date: 'vor 2 Stunden'
    },
    {
      id: '2', 
      userName: 'Anna S.',
      action: 'Premium-Boost gekauft',
      amount: 5.00,
      date: 'vor 1 Tag'
    },
    {
      id: '3',
      userName: 'Peter K.',
      action: 'Verifizierung abgeschlossen',
      amount: 1.00,
      date: 'vor 3 Tagen'
    }
  ]);

  const [referralCode] = useState(`CRYPTO${user?.id?.slice(0, 8).toUpperCase() || 'USER123'}`);
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Kopiert!",
      description: "Referral-Link wurde in die Zwischenablage kopiert.",
    });
  };

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'KryptoMarkt - Jetzt beitreten und verdienen!',
          text: 'Tritt KryptoMarkt bei und wir verdienen beide beim Trading!',
          url: referralLink
        });
      } catch (error) {
        console.log('Sharing failed:', error);
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'Bronze':
        return { color: 'bg-orange-500', nextTier: 'Silver', nextTarget: 25 };
      case 'Silver':
        return { color: 'bg-gray-400', nextTier: 'Gold', nextTarget: 50 };
      case 'Gold':
        return { color: 'bg-yellow-500', nextTier: 'Platinum', nextTarget: 100 };
      case 'Platinum':
        return { color: 'bg-purple-500', nextTier: 'Diamond', nextTarget: 200 };
      default:
        return { color: 'bg-blue-500', nextTier: 'Bronze', nextTarget: 10 };
    }
  };

  const tierInfo = getTierInfo(stats.currentTier);
  const progressToNextTier = (stats.totalReferrals / tierInfo.nextTarget) * 100;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="gradient-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalReferrals}</div>
            <div className="text-sm text-muted-foreground">Gesamt Referrals</div>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{stats.activeReferrals}</div>
            <div className="text-sm text-muted-foreground">Aktive Referrals</div>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">€{stats.totalEarnings.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Gesamt Verdienst</div>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">€{stats.thisMonthEarnings.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Diesen Monat</div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Dein Referral-Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Gift className="h-4 w-4" />
            <AlertDescription>
              Verdiene {stats.commissionRate}% Provision für jeden erfolgreichen Referral! 
              Deine Freunde erhalten ebenfalls einen Bonus bei der Anmeldung.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button variant="outline" onClick={copyReferralLink}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="default" onClick={shareReferralLink}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Dein Referral-Code</p>
              <Badge variant="secondary" className="text-lg px-4 py-2 font-mono">
                {referralCode}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Dein Tier-Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${tierInfo.color}`}></div>
              <span className="font-medium">{stats.currentTier} Tier</span>
              <Badge variant="outline">{stats.commissionRate}% Provision</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.totalReferrals} / {tierInfo.nextTarget} Referrals
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Fortschritt zu {tierInfo.nextTier}</span>
              <span>{Math.round(progressToNextTier)}%</span>
            </div>
            <Progress value={progressToNextTier} className="h-2" />
          </div>
          
          <div className="text-sm text-muted-foreground">
            Noch {tierInfo.nextTarget - stats.totalReferrals} Referrals bis zum nächsten Tier!
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Neueste Aktivitäten
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Referral-Aktivitäten</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{activity.userName}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-success font-medium">
                      <Euro className="h-3 w-3" />
                      {activity.amount.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Provisions-Struktur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Verdienst-Möglichkeiten</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Anmeldung mit Verifizierung</span>
                  <span className="font-medium">€1.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Erste Anzeige erstellt</span>
                  <span className="font-medium">€2.50</span>
                </div>
                <div className="flex justify-between">
                  <span>Boost-Kauf (5% vom Wert)</span>
                  <span className="font-medium">Variable</span>
                </div>
                <div className="flex justify-between">
                  <span>Trading-Gebühren (1% Anteil)</span>
                  <span className="font-medium">Variable</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Tier-Vorteile</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Bronze (0-24 Refs)</span>
                  <span className="font-medium">5% Provision</span>
                </div>
                <div className="flex justify-between">
                  <span>Silver (25-49 Refs)</span>
                  <span className="font-medium">7% Provision</span>
                </div>
                <div className="flex justify-between">
                  <span>Gold (50-99 Refs)</span>
                  <span className="font-medium">10% Provision</span>
                </div>
                <div className="flex justify-between">
                  <span>Platinum (100+ Refs)</span>
                  <span className="font-medium">15% Provision</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}