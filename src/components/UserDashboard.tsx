import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { VerificationModal, VerificationBadge } from "@/components/VerificationModal";
import { ProfileSettings } from "@/components/ProfileSettings";
import { UserAds } from "@/components/UserAds";
import { UserMessages } from "@/components/UserMessages";
import { FavoritesManager } from "@/components/FavoritesManager";
import { PriceAlertsManager } from "@/components/PriceAlertsManager";
import { MarketTrendsWidget } from "@/components/MarketTrendsWidget";
import { ChatSystem } from "@/components/ChatSystem";
import { 
  User, 
  Settings, 
  MessageCircle, 
  TrendingUp,
  Eye,
  Heart,
  Star,
  PlusCircle,
  Shield,
  AlertTriangle,
  Bell,
  FileText
} from "lucide-react";

export function UserDashboard() {
  const { user, signOut } = useAuth();
  const { profile, loading, getUserStats } = useProfile();
  const [activeTab, setActiveTab] = useState("overview");
  
  const stats = getUserStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const canCreateAds = stats.verified;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || "/placeholder-avatar.jpg"} />
              <AvatarFallback>
                {profile?.full_name?.[0] || user?.user_metadata?.display_name?.[0] || user?.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">
                  Willkommen, {profile?.full_name || user?.user_metadata?.display_name || 'Nutzer'}!
                </h1>
                <VerificationBadge 
                  verified={stats.verified} 
                  verificationLevel={stats.verificationLevel} 
                />
              </div>
              <p className="text-muted-foreground">
                Mitglied seit {new Date(user?.created_at || '').toLocaleDateString('de-DE')}
              </p>
              {profile?.city && (
                <p className="text-sm text-muted-foreground">📍 {profile.city}</p>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>
            Abmelden
          </Button>
        </div>

        {/* Verification Alert */}
        {!stats.verified && (
          <Alert className="mb-6 border-warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Verifizieren Sie Ihren Account, um Anzeigen erstellen zu können und das Vertrauen anderer Nutzer zu gewinnen.
              </span>
              <VerificationModal>
                <Button size="sm" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Jetzt verifizieren
                </Button>
              </VerificationModal>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="ads">
              <FileText className="h-4 w-4 mr-2" />
              Anzeigen
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageCircle className="h-4 w-4 mr-2" />
              Nachrichten
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="h-4 w-4 mr-2" />
              Favoriten
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Bell className="h-4 w-4 mr-2" />
              Preisalarme
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Einstellungen
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="gradient-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalAds}</div>
                  <div className="text-sm text-muted-foreground">Anzeigen gesamt</div>
                </CardContent>
              </Card>
              <Card className="gradient-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-success">{stats.activeAds}</div>
                  <div className="text-sm text-muted-foreground">Aktive Anzeigen</div>
                </CardContent>
              </Card>
              <Card className="gradient-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-secondary">{stats.totalViews}</div>
                  <div className="text-sm text-muted-foreground">Gesamtaufrufe</div>
                </CardContent>
              </Card>
              <Card className="gradient-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent">{stats.totalMessages}</div>
                  <div className="text-sm text-muted-foreground">Nachrichten</div>
                </CardContent>
              </Card>
              <Card className="gradient-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-warning">
                    {stats.rating > 0 ? stats.rating.toFixed(1) : '—'}
                  </div>
                  <div className="text-sm text-muted-foreground">Bewertung</div>
                </CardContent>
              </Card>
              <Card className="gradient-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.trades}</div>
                  <div className="text-sm text-muted-foreground">Erfolgreiche Trades</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Schnellaktionen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant={canCreateAds ? "gradient" : "outline"} 
                    className="h-20 flex-col"
                    disabled={!canCreateAds}
                    onClick={() => {
                      if (!canCreateAds) return;
                      // TODO: Navigate to create ad page
                    }}
                  >
                    <PlusCircle className="h-6 w-6 mb-2" />
                    Neue Anzeige erstellen
                    {!canCreateAds && (
                      <span className="text-xs text-muted-foreground mt-1">
                        (Verifizierung erforderlich)
                      </span>
                    )}
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <MessageCircle className="h-6 w-6 mb-2" />
                    Nachrichten ({stats.totalMessages})
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <TrendingUp className="h-6 w-6 mb-2" />
                    Anzeige boosten
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads">
            <UserAds />
          </TabsContent>

          {/* Messages Tab */}
        <TabsContent value="messages">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserMessages />
            <ChatSystem />
          </div>
        </TabsContent>
        
        <TabsContent value="favorites">
          <FavoritesManager />
        </TabsContent>
        
        <TabsContent value="alerts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PriceAlertsManager />
            <MarketTrendsWidget />
          </div>
        </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <ProfileSettings />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}