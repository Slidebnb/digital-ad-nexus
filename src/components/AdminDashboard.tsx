
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminStats } from "@/components/AdminStats";
import { AdminUserManagement } from "@/components/AdminUserManagement";
import { AdminVerificationManagement } from "@/components/AdminVerificationManagement";
import { AdminSecurityCenter } from "@/components/AdminSecurityCenter";
import { AdminSystemMonitor } from "@/components/AdminSystemMonitor";
import { MobileDashboardHeader } from "@/components/MobileDashboardHeader";
import { MobileTabNavigation } from "@/components/MobileTabNavigation";
import { AdminErrorBoundary } from "@/components/ui/admin-error-boundary";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRealTimeMetrics } from "@/hooks/useAdminRealTimeMetrics";
import { Shield, Settings, Activity, Zap } from "lucide-react";
import { 
  BarChart3, 
  Users, 
  Monitor,
  Lock
} from "lucide-react";

export function AdminDashboard() {
  const { user, userRole } = useAuth();
  const { alerts } = useAdminRealTimeMetrics();
  const [currentTab, setCurrentTab] = useState("overview");

  return (
    <AdminErrorBoundary>
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <MobileDashboardHeader />
        
        <div className="container mx-auto px-4 py-8 hidden md:block">
          {/* Desktop Header - only show on desktop */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  Admin Dashboard
                </h1>
                <div className="flex items-center gap-4">
                  <Badge variant="destructive" className="flex items-center gap-2">
                    <Shield className="h-3 w-3" />
                    Administrator
                  </Badge>
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Live Monitoring
                  </Badge>
                  {alerts.length > 0 && (
                    <Badge variant="destructive" className="animate-pulse">
                      <Zap className="h-3 w-3 mr-1" />
                      {alerts.length} Alerts
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="text-right text-sm text-muted-foreground">
                <div>Angemeldet als: <span className="font-medium">{user?.email}</span></div>
                <div>Rolle: <span className="font-medium text-primary">{userRole}</span></div>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          {/* Mobile Tab Navigation */}
          <div className="md:hidden">
            <MobileTabNavigation 
              value={currentTab} 
              onValueChange={setCurrentTab}
              isAdmin={true}
            />
          </div>

          {/* Desktop Tab Navigation */}
          <div className="hidden md:block container mx-auto px-4">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-background border">
              <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Live Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Nutzer</span>
              </TabsTrigger>
              <TabsTrigger value="verification" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Verifikation</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Sicherheit</span>
              </TabsTrigger>
              <TabsTrigger value="monitor" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Monitor className="h-4 w-4" />
                <span className="hidden sm:inline">System</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Einstellungen</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="container mx-auto px-4">
            <TabsContent value="overview" className="space-y-6">
              <AdminErrorBoundary>
                <AdminStats />
              </AdminErrorBoundary>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <AdminErrorBoundary>
                <AdminUserManagement />
              </AdminErrorBoundary>
            </TabsContent>

            <TabsContent value="verification" className="space-y-6">
              <AdminErrorBoundary>
                <AdminVerificationManagement />
              </AdminErrorBoundary>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <AdminErrorBoundary>
                <AdminSecurityCenter />
              </AdminErrorBoundary>
            </TabsContent>

            <TabsContent value="monitor" className="space-y-6">
              <AdminErrorBoundary>
                <AdminSystemMonitor />
              </AdminErrorBoundary>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <AdminErrorBoundary>
                <Card className="gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      System-Einstellungen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Maintenance Mode</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Wartungsmodus für System-Updates aktivieren
                        </p>
                        <Badge variant="secondary">Verfügbar in v2.0</Badge>
                      </div>
                      
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Backup & Recovery</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Automatische Backups und Wiederherstellung konfigurieren
                        </p>
                        <Badge variant="secondary">Enterprise Feature</Badge>
                      </div>
                      
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Advanced Analytics</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Erweiterte Metriken und Business Intelligence Tools
                        </p>
                        <Badge variant="secondary">Coming Soon</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AdminErrorBoundary>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AdminErrorBoundary>
  );
}
