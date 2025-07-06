import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useAdminData } from "@/hooks/useAdminData";
import { AdminUserManagement } from "@/components/AdminUserManagement";
import { AdminVerificationManagement } from "@/components/AdminVerificationManagement";
import { 
  Users, 
  Settings, 
  TrendingUp,
  AlertTriangle,
  Eye,
  MessageCircle,
  Shield,
  BarChart3,
  UserCheck
} from "lucide-react";

export function AdminDashboard() {
  const { user, signOut } = useAuth();
  const { stats, loading } = useAdminData();
  const [activeTab, setActiveTab] = useState("overview");

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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="users">Nutzer</TabsTrigger>
            <TabsTrigger value="verification">Verifizierung</TabsTrigger>
            <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="gradient-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gesamte Nutzer</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {loading ? "..." : stats.totalUsers.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Registrierte Nutzer</p>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aktive Anzeigen</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">
                    {loading ? "..." : stats.activeAds.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Veröffentlichte Anzeigen</p>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Handelsvolumen</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    €{loading ? "..." : (stats.platformVolume / 1000).toFixed(0)}K
                  </div>
                  <p className="text-xs text-muted-foreground">Gesamtvolumen</p>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verifizierte Nutzer</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">
                    {loading ? "..." : stats.verifiedUsers.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? "..." : Math.round((stats.verifiedUsers / Math.max(stats.totalUsers, 1)) * 100)}% aller Nutzer
                  </p>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ausstehende Meldungen</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">
                    {loading ? "..." : stats.pendingReports}
                  </div>
                  <p className="text-xs text-muted-foreground">Benötigen Aufmerksamkeit</p>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ausstehende Verifizierungen</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {loading ? "..." : stats.pendingVerifications}
                  </div>
                  <p className="text-xs text-muted-foreground">Zu bearbeiten</p>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Erfolgreiche Trades</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {loading ? "..." : stats.totalTrades.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Abgeschlossene Trades</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification">
            <AdminVerificationManagement />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>System-Einstellungen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  System-Einstellungen werden in einem zukünftigen Update implementiert.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>

      <Footer />
    </div>
  );
}