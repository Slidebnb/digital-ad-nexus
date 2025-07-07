import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { UserDashboard } from "@/components/UserDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { UserVerificationCenter } from "@/components/UserVerificationCenter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, BarChart3, MessageSquare, Settings } from "lucide-react";

export default function Dashboard() {
  const { user, loading, isAdmin, userRole } = useAuth();

  console.log('Dashboard render - user:', user?.id, 'loading:', loading, 'isAdmin:', isAdmin, 'userRole:', userRole);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wait for role to be loaded before deciding which dashboard to show
  if (userRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log('Rendering dashboard for role:', userRole, 'isAdmin:', isAdmin);
  
  // Admin Dashboard
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // User Dashboard with tabs
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Anzeigen und Einstellungen</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Übersicht
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Verifizierung
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Nachrichten
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Einstellungen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <UserDashboard />
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <UserVerificationCenter />
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Nachrichten</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Nachrichten-Feature wird bald verfügbar sein.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Einstellungen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Erweiterte Einstellungen werden bald verfügbar sein.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}