import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  Settings, 
  MessageCircle, 
  TrendingUp,
  Eye,
  Heart,
  Star,
  PlusCircle,
  Edit,
  Trash2
} from "lucide-react";

export function UserDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - wird später durch echte Daten ersetzt
  const userStats = {
    totalAds: 12,
    activeAds: 8,
    totalViews: 2456,
    totalMessages: 34,
    rating: 4.8,
    trades: 23
  };

  const recentAds = [
    {
      id: 1,
      title: "MacBook Pro M3 16\" - Wie neu",
      price: 2499,
      status: "active",
      views: 234,
      likes: 12,
      messages: 5,
      createdAt: "vor 2 Tagen"
    },
    {
      id: 2,
      title: "Bitcoin Mining Rig",
      price: 1850,
      status: "boosted",
      views: 189,
      likes: 8,
      messages: 3,
      createdAt: "vor 1 Woche"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>
                {user?.user_metadata?.display_name?.[0] || user?.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                Willkommen, {user?.user_metadata?.display_name || 'Nutzer'}!
              </h1>
              <p className="text-muted-foreground">
                Mitglied seit {new Date(user?.created_at || '').toLocaleDateString('de-DE')}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>
            Abmelden
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="ads">Meine Anzeigen</TabsTrigger>
            <TabsTrigger value="messages">Nachrichten</TabsTrigger>
            <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="gradient-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{userStats.totalAds}</div>
                  <div className="text-sm text-muted-foreground">Anzeigen gesamt</div>
                </CardContent>
              </Card>
              <Card className="gradient-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-success">{userStats.activeAds}</div>
                  <div className="text-sm text-muted-foreground">Aktive Anzeigen</div>
                </CardContent>
              </Card>
              <Card className="gradient-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-secondary">{userStats.totalViews}</div>
                  <div className="text-sm text-muted-foreground">Gesamtaufrufe</div>
                </CardContent>
              </Card>
              <Card className="gradient-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent">{userStats.totalMessages}</div>
                  <div className="text-sm text-muted-foreground">Nachrichten</div>
                </CardContent>
              </Card>
              <Card className="gradient-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-warning">{userStats.rating}</div>
                  <div className="text-sm text-muted-foreground">Bewertung</div>
                </CardContent>
              </Card>
              <Card className="gradient-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{userStats.trades}</div>
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
                  <Button variant="gradient" className="h-20 flex-col">
                    <PlusCircle className="h-6 w-6 mb-2" />
                    Neue Anzeige erstellen
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <MessageCircle className="h-6 w-6 mb-2" />
                    Nachrichten ({userStats.totalMessages})
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
          <TabsContent value="ads" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Meine Anzeigen</h2>
              <Button variant="gradient">
                <PlusCircle className="h-4 w-4 mr-2" />
                Neue Anzeige
              </Button>
            </div>

            <div className="grid gap-4">
              {recentAds.map((ad) => (
                <Card key={ad.id} className="gradient-card">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{ad.title}</h3>
                          <Badge variant={ad.status === 'active' ? 'default' : 'secondary'}>
                            {ad.status === 'active' ? 'Aktiv' : 'Geboostet'}
                          </Badge>
                        </div>
                        <p className="text-lg font-bold text-primary mb-2">€{ad.price}</p>
                        <p className="text-sm text-muted-foreground">{ad.createdAt}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {ad.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {ad.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {ad.messages}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Nachrichten</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Chat-System wird implementiert...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Einstellungen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Profil-Einstellungen werden implementiert...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}