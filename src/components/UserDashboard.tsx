import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { MobileDashboardHeader } from "@/components/MobileDashboardHeader";
import { MobileTabNavigation } from "@/components/MobileTabNavigation";
import { RealTimeUserDashboard } from "@/components/RealTimeUserDashboard";
import { EnhancedMessageSystem } from "@/components/EnhancedMessageSystem";
import { UserAds } from "@/components/UserAds";
import { UserVerificationCenter } from "@/components/UserVerificationCenter";
import { ProfileSettings } from "@/components/ProfileSettings";
import { FavoritesManager } from "@/components/FavoritesManager";
import { TradingHistory } from "@/components/TradingHistory";
import { NotificationCenter } from "@/components/NotificationCenter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  MessageSquare, 
  ShoppingBag, 
  Shield, 
  Settings, 
  Heart,
  TrendingUp,
  Bell,
  User
} from "lucide-react";

export function UserDashboard() {
  const { user, userRole } = useAuth();
  const [currentTab, setCurrentTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <MobileDashboardHeader />
      
      <div className="container mx-auto px-4 py-8 hidden md:block">
        {/* Desktop Header - only show on desktop */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <User className="h-3 w-3" />
              {userRole || 'user'}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Live Updates Aktiv
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
            isAdmin={false}
          />
        </div>

        {/* Desktop Tab Navigation - keep existing code */}
        <div className="hidden md:block container mx-auto px-4">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Übersicht</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Nachrichten</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Anzeigen</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favoriten</span>
            </TabsTrigger>
            <TabsTrigger value="trades" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trades</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Verifikation</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Benachrichtigungen</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Einstellungen</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="container mx-auto px-4">
          <TabsContent value="overview" className="space-y-6">
            <RealTimeUserDashboard />
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <EnhancedMessageSystem />
          </TabsContent>

          <TabsContent value="ads" className="space-y-6">
            <UserAds />
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <FavoritesManager />
          </TabsContent>

          <TabsContent value="trades" className="space-y-6">
            <TradingHistory />
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <UserVerificationCenter />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <ProfileSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
