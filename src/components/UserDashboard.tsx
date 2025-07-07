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
import { useMessages } from "@/hooks/useMessages";
import { VerificationModal, VerificationBadge } from "@/components/VerificationModal";
import { ProfileSettings } from "@/components/ProfileSettings";
import { UserAds } from "@/components/UserAds";
import { UserMessages } from "@/components/UserMessages";
import { FavoritesManager } from "@/components/FavoritesManager";
import { PriceAlertsManager } from "@/components/PriceAlertsManager";
import { MarketTrendsWidget } from "@/components/MarketTrendsWidget";
import { UserVerificationCenter } from "@/components/UserVerificationCenter";
import { ChatSystem } from "@/components/ChatSystem";
import { BoostAdModal } from "@/components/BoostAdModal";
import { GDPRComplianceCenter } from "@/components/GDPRComplianceCenter";
import { TaxReportingSystem } from "@/components/TaxReportingSystem";
import { CookieConsentManager } from "@/components/CookieConsentManager";
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
  const { unreadCount } = useMessages();
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
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <Avatar className="h-12 w-12 md:h-16 md:w-16">
              <AvatarImage src={profile?.avatar_url || "/placeholder-avatar.jpg"} />
              <AvatarFallback>
                {profile?.full_name?.[0] || user?.user_metadata?.display_name?.[0] || user?.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-1">
                <h1 className="text-xl md:text-2xl font-bold">
                  Willkommen, {profile?.full_name || user?.user_metadata?.display_name || 'Nutzer'}!
                </h1>
                <VerificationBadge 
                  verified={stats.verified} 
                  verificationLevel={stats.verificationLevel} 
                />
              </div>
              <p className="text-muted-foreground text-sm md:text-base">
                Mitglied seit {new Date(user?.created_at || '').toLocaleDateString('de-DE')}
              </p>
              {profile?.city && (
                <p className="text-sm text-muted-foreground">📍 {profile.city}</p>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={signOut} className="w-full md:w-auto text-sm">
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
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 gap-1 p-1 h-auto">
            <TabsTrigger value="overview" className="flex-col gap-1 h-16 md:h-10 text-xs md:text-sm">
              <span className="md:hidden">📊</span>
              <span className="hidden md:inline">Übersicht</span>
              <span className="md:hidden">Übersicht</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex-col gap-1 h-16 md:h-10 text-xs md:text-sm">
              <FileText className="h-4 w-4 md:mr-2 md:mb-0" />
              <span className="md:hidden">Anzeigen</span>
              <span className="hidden md:inline">Anzeigen</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex-col gap-1 h-16 md:h-10 text-xs md:text-sm">
              <MessageCircle className="h-4 w-4 md:mr-2 md:mb-0" />
              <span className="md:hidden">Chat</span>
              <span className="hidden md:inline">Nachrichten</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex-col gap-1 h-16 md:h-10 text-xs md:text-sm">
              <Heart className="h-4 w-4 md:mr-2 md:mb-0" />
              <span className="md:hidden">❤️</span>
              <span className="hidden md:inline">Favoriten</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex-col gap-1 h-16 md:h-10 text-xs md:text-sm">
              <Bell className="h-4 w-4 md:mr-2 md:mb-0" />
              <span className="md:hidden">🔔</span>
              <span className="hidden md:inline">Preisalarme</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex-col gap-1 h-16 md:h-10 text-xs md:text-sm">
              <Shield className="h-4 w-4 md:mr-2 md:mb-0" />
              <span className="md:hidden">🛡️</span>
              <span className="hidden md:inline">Datenschutz</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-col gap-1 h-16 md:h-10 text-xs md:text-sm">
              <Settings className="h-4 w-4 md:mr-2 md:mb-0" />
              <span className="md:hidden">⚙️</span>
              <span className="hidden md:inline">Einstellungen</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              <Card className="gradient-card">
                <CardContent className="p-3 md:p-4 text-center">
                  <div className="text-lg md:text-2xl font-bold text-primary">{stats.totalAds}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Anzeigen gesamt</div>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <Button 
                    variant={canCreateAds ? "gradient" : "outline"} 
                    className="h-20 flex-col relative"
                    disabled={!canCreateAds}
                    onClick={() => {
                      if (!canCreateAds) return;
                      window.location.href = '/create-ad';
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
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col relative"
                    onClick={() => setActiveTab("messages")}
                  >
                    <MessageCircle className="h-6 w-6 mb-2" />
                    Nachrichten
                    <span className="text-xs text-muted-foreground">
                      ({unreadCount > 0 ? unreadCount : stats.totalMessages})
                    </span>
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>

                  <BoostAdModal>
                    <Button variant="outline" className="h-20 flex-col">
                      <TrendingUp className="h-6 w-6 mb-2" />
                      Anzeige boosten
                      <span className="text-xs text-muted-foreground">
                        {stats.activeAds} verfügbar
                      </span>
                    </Button>
                  </BoostAdModal>

                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => setActiveTab("favorites")}
                  >
                    <Heart className="h-6 w-6 mb-2" />
                    Favoriten
                    <span className="text-xs text-muted-foreground">
                      Gespeicherte Anzeigen
                    </span>
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

          {/* GDPR & Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Tabs defaultValue="gdpr" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="gdpr">DSGVO Center</TabsTrigger>
                <TabsTrigger value="tax">Steuer-Reports</TabsTrigger>
                <TabsTrigger value="cookies">Cookie-Einstellungen</TabsTrigger>
              </TabsList>

              <TabsContent value="gdpr">
                <GDPRComplianceCenter />
              </TabsContent>

              <TabsContent value="tax">
                <TaxReportingSystem />
              </TabsContent>

              <TabsContent value="cookies">
                <CookieConsentManager />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <ProfileSettings />
              <UserVerificationCenter />
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle>Erweiterte Einstellungen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">E-Mail-Benachrichtigungen</h4>
                      <p className="text-sm text-muted-foreground">Erhalten Sie Updates per E-Mail</p>
                    </div>
                    <Button variant="outline" size="sm">Bearbeiten</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Privatsphäre</h4>
                      <p className="text-sm text-muted-foreground">Verwalten Sie Ihre Datenschutzeinstellungen</p>
                    </div>
                    <Button variant="outline" size="sm">Bearbeiten</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Sicherheit</h4>
                      <p className="text-sm text-muted-foreground">Passwort und Zwei-Faktor-Authentifizierung</p>
                    </div>
                    <Button variant="outline" size="sm">Bearbeiten</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}