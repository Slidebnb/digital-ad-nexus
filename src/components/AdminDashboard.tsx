import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AdminStats } from "@/components/AdminStats";
import { AdminUserManagement } from "@/components/AdminUserManagement";
import { AdminVerificationManagement } from "@/components/AdminVerificationManagement";
import { AdminSecurityCenter } from "@/components/AdminSecurityCenter";
import { AdminSystemMonitor } from "@/components/AdminSystemMonitor";
import { MobileDashboardHeader } from "@/components/MobileDashboardHeader";
import { MobileTabNavigation } from "@/components/MobileTabNavigation";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Users, 
  Monitor,
  Lock,
  Activity,
  Database
} from "lucide-react";

export function AdminDashboard() {
  const { user, userRole } = useAuth();
  const [currentTab, setCurrentTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <MobileDashboardHeader />
      
      <div className="container mx-auto px-4 py-8 hidden md:block">
        {/* Desktop Header - only show on desktop */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Badge variant="destructive" className="flex items-center gap-2">
              <Shield className="h-3 w-3" />
              Administrator
            </Badge>
            <Badge variant="outline" className="text-xs">
              Vollzugriff • Live Monitoring
            </Badge>
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

        {/* Desktop Tab Navigation - keep existing code */}
        <div className="hidden md:block container mx-auto px-4">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Übersicht</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Nutzer</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Verifikation</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Sicherheit</span>
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Einstellungen</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="container mx-auto px-4">
          <TabsContent value="overview" className="space-y-6">
            <AdminStats />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <AdminVerificationManagement />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <AdminSecurityCenter />
          </TabsContent>

          <TabsContent value="monitor" className="space-y-6">
            <AdminSystemMonitor />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System-Einstellungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Erweiterte Systemkonfiguration und Wartungstools werden hier verfügbar sein.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
