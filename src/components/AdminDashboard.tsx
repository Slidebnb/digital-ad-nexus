import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  Settings, 
  TrendingUp,
  AlertTriangle,
  Eye,
  MessageCircle,
  Shield
} from "lucide-react";

export function AdminDashboard() {
  const { user, signOut } = useAuth();

  const adminStats = {
    totalUsers: 10543,
    activeAds: 5234,
    pendingReports: 12,
    totalTrades: 8921,
    platformVolume: 2500000,
    verifiedUsers: 7832
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground">Systemübersicht und Verwaltung</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            Abmelden
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamte Nutzer</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{adminStats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% zum Vormonat</p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive Anzeigen</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{adminStats.activeAds.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+8% zum Vormonat</p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Handelsvolumen</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">€{(adminStats.platformVolume / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-muted-foreground">+25% zum Vormonat</p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ausstehende Meldungen</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{adminStats.pendingReports}</div>
              <p className="text-xs text-muted-foreground">Benötigen Aufmerksamkeit</p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verifizierte Nutzer</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{adminStats.verifiedUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{Math.round((adminStats.verifiedUsers / adminStats.totalUsers) * 100)}% aller Nutzer</p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Erfolgreiche Trades</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{adminStats.totalTrades.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">99.2% Erfolgsrate</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="gradient-card hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Nutzer verwalten</h3>
              <p className="text-sm text-muted-foreground">Nutzerkonten und Berechtigungen</p>
            </CardContent>
          </Card>

          <Card className="gradient-card hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <Eye className="h-8 w-8 text-secondary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Anzeigen moderieren</h3>
              <p className="text-sm text-muted-foreground">Anzeigen prüfen und verwalten</p>
            </CardContent>
          </Card>

          <Card className="gradient-card hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Meldungen bearbeiten</h3>
              <p className="text-sm text-muted-foreground">{adminStats.pendingReports} ausstehende Meldungen</p>
            </CardContent>
          </Card>

          <Card className="gradient-card hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <Settings className="h-8 w-8 text-accent mx-auto mb-4" />
              <h3 className="font-semibold mb-2">System-Einstellungen</h3>
              <p className="text-sm text-muted-foreground">Platform-Konfiguration</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Letzte Aktivitäten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">Neue Nutzer-Registrierung</p>
                  <p className="text-sm text-muted-foreground">vor 5 Minuten</p>
                </div>
                <Button variant="outline" size="sm">Details</Button>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">Anzeige gemeldet</p>
                  <p className="text-sm text-muted-foreground">vor 12 Minuten</p>
                </div>
                <Button variant="outline" size="sm">Prüfen</Button>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">Trade abgeschlossen</p>
                  <p className="text-sm text-muted-foreground">vor 18 Minuten</p>
                </div>
                <Button variant="outline" size="sm">Ansehen</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}