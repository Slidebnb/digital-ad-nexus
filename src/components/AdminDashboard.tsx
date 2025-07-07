import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useAdminStats } from "@/hooks/useAdminStats";
import { AdminRealTimeMonitor } from "@/components/AdminRealTimeMonitor";
import { AdminUserManagementDashboard } from "@/components/AdminUserManagementDashboard";
import { AdminAdsManagementDashboard } from "@/components/AdminAdsManagementDashboard";
import { AdminVerificationManagement } from "@/components/AdminVerificationManagement";
import { AdminStats } from "@/components/AdminStats";
import { AdminPromoteUser } from "@/components/AdminPromoteUser";
import { AdminWelcome } from "@/components/AdminWelcome";
import { 
  Activity,
  Users, 
  Settings, 
  TrendingUp,
  AlertTriangle,
  Eye,
  MessageCircle,
  Shield,
  BarChart3,
  UserCheck,
  Package,
  Database,
  Bell,
  Download,
  Zap,
  Globe,
  Lock
} from "lucide-react";

export function AdminDashboard() {
  const { user, signOut } = useAuth();
  const { stats, systemHealth, loading } = useAdminStats();
  const [activeTab, setActiveTab] = useState("monitor");

  const quickActions = [
    {
      title: "Live Monitoring",
      description: "Echtzeit-Systemüberwachung",
      icon: Activity,
      tab: "monitor",
      color: "text-primary"
    },
    {
      title: "Nutzer verwalten",
      description: `${stats.totalUsers} registrierte Nutzer`,
      icon: Users,
      tab: "users",
      color: "text-secondary"
    },
    {
      title: "Anzeigen prüfen",
      description: `${stats.activeAds} aktive Anzeigen`,
      icon: Package,
      tab: "ads",
      color: "text-accent"
    },
    {
      title: "Verifizierungen",
      description: `${stats.pendingVerifications} ausstehend`,
      icon: Shield,
      tab: "verification",
      color: "text-warning",
      urgent: stats.pendingVerifications > 0
    },
    {
      title: "System-Einstellungen",
      description: "Plattform konfigurieren",
      icon: Settings,
      tab: "settings",
      color: "text-muted-foreground"
    },
    {
      title: "Analytics",
      description: "Detaillierte Statistiken",
      icon: BarChart3,
      tab: "analytics",
      color: "text-success"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Vollständige Systemkontrolle und Verwaltung für KRYPTOANZEIGEN.DE
            </p>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                System Status: {systemHealth.database === 'healthy' ? 'Online' : 'Warning'}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {stats.activeUsers} Aktive Nutzer
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {stats.avgResponseTime}ms Antwortzeit
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Backup
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Benachrichtigungen
            </Button>
            <Button variant="outline" onClick={signOut}>
              <Lock className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="gradient-card border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamte Nutzer</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
              <div className="text-xs text-muted-foreground">
                +{stats.newUsersToday} heute
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plattform-Volumen</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                €{(stats.platformVolume / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-muted-foreground">
                €{(stats.monthlyVolume / 1000).toFixed(0)}K diesen Monat
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-success/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Erfolgreiche Trades</CardTitle>
              <MessageCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.completedTrades}</div>
              <div className="text-xs text-muted-foreground">
                {stats.totalTrades > 0 && `${Math.round((stats.completedTrades / stats.totalTrades) * 100)}% Erfolgsrate`}
              </div>
            </CardContent>
          </Card>

          <Card className={`gradient-card ${stats.pendingVerifications > 0 ? 'border-warning/50 bg-warning/5' : 'border-accent/20'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ausstehende Aktionen</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${stats.pendingVerifications > 0 ? 'text-warning' : 'text-accent'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.pendingVerifications > 0 ? 'text-warning' : 'text-accent'}`}>
                {stats.pendingVerifications + stats.pendingReports}
              </div>
              <div className="text-xs text-muted-foreground">
                {stats.pendingVerifications} Verifizierungen, {stats.pendingReports} Meldungen
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <Card className="gradient-card mb-8">
          <CardHeader>
            <CardTitle>Schnellzugriff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                    action.urgent ? 'border-warning/50 bg-warning/5' : 'hover:border-primary/50'
                  } ${activeTab === action.tab ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => setActiveTab(action.tab)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-background ${action.color}`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-muted-foreground">{action.description}</div>
                      </div>
                      {action.urgent && (
                        <Badge variant="outline" className="text-warning border-warning">
                          Dringend
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="monitor">Monitor</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">Nutzer</TabsTrigger>
            <TabsTrigger value="ads">Anzeigen</TabsTrigger>
            <TabsTrigger value="verification">Verifizierung</TabsTrigger>
            <TabsTrigger value="settings">Einstellungen</TabsTrigger>
            <TabsTrigger value="welcome">Willkommen</TabsTrigger>
          </TabsList>

          {/* Real-time Monitoring */}
          <TabsContent value="monitor">
            <AdminRealTimeMonitor />
          </TabsContent>

          {/* Analytics & Stats */}
          <TabsContent value="analytics" className="space-y-6">
            <AdminStats />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle>Nutzer-Wachstum</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <div>Erweiterte Charts kommen bald</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle>Trading-Aktivität</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                    <div>Trading-Charts kommen bald</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced User Management */}
          <TabsContent value="users">
            <AdminUserManagementDashboard />
          </TabsContent>

          {/* Advanced Ads Management */}
          <TabsContent value="ads">
            <AdminAdsManagementDashboard />
          </TabsContent>

          {/* Verification Management */}
          <TabsContent value="verification">
            <AdminVerificationManagement />
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <AdminPromoteUser />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    System-Konfiguration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Plattform-Einstellungen</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Max. Upload-Größe:</span>
                          <span>10 MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rate Limit:</span>
                          <span>100 req/min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Session Timeout:</span>
                          <span>24h</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Sicherheit</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>2FA erforderlich:</span>
                          <Badge variant="outline">Admins</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>IP Whitelisting:</span>
                          <Badge variant="outline">Aktiv</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Audit Logging:</span>
                          <Badge variant="outline" className="text-success">Aktiv</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Performance-Optimierung
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Cache-Status</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Redis:</span>
                          <Badge variant="outline" className="ml-2 text-success">Online</Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CDN:</span>
                          <Badge variant="outline" className="ml-2 text-success">Aktiv</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Auto-Scaling</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Min. Instanzen:</span>
                          <span>2</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max. Instanzen:</span>
                          <span>10</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CPU Threshold:</span>
                          <span>70%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Welcome Tab */}
          <TabsContent value="welcome">
            <AdminWelcome />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}