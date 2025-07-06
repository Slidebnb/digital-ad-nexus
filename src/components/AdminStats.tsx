import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminData } from "@/hooks/useAdminData";
import { 
  Users, 
  TrendingUp,
  BarChart3,
  Shield,
  AlertTriangle,
  UserCheck,
  MessageCircle
} from "lucide-react";

export function AdminStats() {
  const { stats, loading } = useAdminData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(7)].map((_, i) => (
          <Card key={i} className="gradient-card animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="gradient-card hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gesamte Nutzer</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {stats.totalUsers.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Registrierte Nutzer</p>
        </CardContent>
      </Card>

      <Card className="gradient-card hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aktive Anzeigen</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-secondary">
            {stats.activeAds.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Veröffentlichte Anzeigen</p>
        </CardContent>
      </Card>

      <Card className="gradient-card hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Handelsvolumen</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            €{(stats.platformVolume / 1000).toFixed(0)}K
          </div>
          <p className="text-xs text-muted-foreground">Gesamtvolumen</p>
        </CardContent>
      </Card>

      <Card className="gradient-card hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verifizierte Nutzer</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">
            {stats.verifiedUsers.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {Math.round((stats.verifiedUsers / Math.max(stats.totalUsers, 1)) * 100)}% aller Nutzer
          </p>
        </CardContent>
      </Card>

      <Card className="gradient-card hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ausstehende Meldungen</CardTitle>
          <AlertTriangle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">
            {stats.pendingReports}
          </div>
          <p className="text-xs text-muted-foreground">Benötigen Aufmerksamkeit</p>
        </CardContent>
      </Card>

      <Card className="gradient-card hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ausstehende Verifizierungen</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {stats.pendingVerifications}
          </div>
          <p className="text-xs text-muted-foreground">Zu bearbeiten</p>
        </CardContent>
      </Card>

      <Card className="gradient-card hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Erfolgreiche Trades</CardTitle>
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {stats.totalTrades.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Abgeschlossene Trades</p>
        </CardContent>
      </Card>
    </div>
  );
}