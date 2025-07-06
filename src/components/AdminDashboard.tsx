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
import { AdminStats } from "@/components/AdminStats";
import { AdminPromoteUser } from "@/components/AdminPromoteUser";
import { AdminWelcome } from "@/components/AdminWelcome";
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
  const [activeTab, setActiveTab] = useState("welcome");

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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="welcome">Willkommen</TabsTrigger>
            <TabsTrigger value="users">Nutzer</TabsTrigger>
            <TabsTrigger value="verification">Verifizierung</TabsTrigger>
            <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          </TabsList>

          {/* Welcome Tab */}
          <TabsContent value="welcome">
            <AdminWelcome />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <AdminStats />
            
            {/* Quick Actions */}
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Schnellaktionen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <UserCheck className="h-6 w-6 mb-2" />
                    Benutzer verwalten
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Shield className="h-6 w-6 mb-2" />
                    Verifizierungen
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <AlertTriangle className="h-6 w-6 mb-2" />
                    Meldungen bearbeiten
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Settings className="h-6 w-6 mb-2" />
                    System-Einstellungen
                  </Button>
                </div>
              </CardContent>
            </Card>
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
          <TabsContent value="settings" className="space-y-6">
            <AdminPromoteUser />
            
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>System-Einstellungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Plattform-Status</h4>
                      <p className="text-sm text-muted-foreground">System läuft normal</p>
                      <div className="mt-2 h-2 bg-success/20 rounded-full">
                        <div className="h-full w-full bg-success rounded-full"></div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Datenbank</h4>
                      <p className="text-sm text-muted-foreground">Verbunden und synchronisiert</p>
                      <div className="mt-2 h-2 bg-success/20 rounded-full">
                        <div className="h-full w-full bg-success rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>

      <Footer />
    </div>
  );
}