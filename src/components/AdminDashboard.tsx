
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminStats } from "@/components/AdminStats";
import { AdminUserManagement } from "@/components/AdminUserManagement";
import { AdminVerificationManagement } from "@/components/AdminVerificationManagement";
import { AdminSecurityCenter } from "@/components/AdminSecurityCenter";
import { AdminSystemMonitor } from "@/components/AdminSystemMonitor";
import { useAuth } from "@/hooks/useAuth";
import { 
  BarChart3, 
  Users, 
  Shield, 
  Settings,
  Monitor,
  Lock,
  Activity,
  Database
} from "lucide-react";

export function AdminDashboard() {
  const { user, userRole } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Admin Dashboard
          </h1>
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

        <Tabs defaultValue="overview" className="space-y-6">
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
        </Tabs>
      </div>
    </div>
  );
}
