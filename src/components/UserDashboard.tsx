
import { useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useDashboardNavigation } from "@/hooks/useDashboardNavigation";
import { MobileDashboardHeader } from "@/components/MobileDashboardHeader";
import { MobileTabNavigation } from "@/components/MobileTabNavigation";
import { DashboardBreadcrumb } from "@/components/DashboardBreadcrumb";
import { RealTimeUserDashboard } from "@/components/RealTimeUserDashboard";
import { EnhancedMessageSystem } from "@/components/EnhancedMessageSystem";
import { UserAds } from "@/components/UserAds";
import { UserVerificationCenter } from "@/components/UserVerificationCenter";
import { ProfileSettings } from "@/components/ProfileSettings";
import { FavoritesManager } from "@/components/FavoritesManager";
import { TradingHistory } from "@/components/TradingHistory";
import { NotificationCenter } from "@/components/NotificationCenter";
import { CryptoDashboardSection } from "@/components/CryptoDashboardSection";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  MessageSquare, 
  ShoppingBag, 
  Shield, 
  Settings, 
  Heart,
  TrendingUp,
  Bell,
  User,
  Coins,
  CreditCard
} from "lucide-react";

export function UserDashboard() {
  const { user, userRole } = useAuth();
  const device = useDeviceDetection();
  const { currentTab, setCurrentTab } = useDashboardNavigation('overview');
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when tab changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [currentTab]);

  const tabsConfig = [
    { value: "overview", label: "Übersicht", icon: BarChart3, component: RealTimeUserDashboard },
    { value: "crypto", label: "Krypto", icon: Coins, component: CryptoDashboardSection },
    { value: "messages", label: "Nachrichten", icon: MessageSquare, component: EnhancedMessageSystem },
    { value: "ads", label: "Anzeigen", icon: ShoppingBag, component: UserAds },
    { value: "favorites", label: "Favoriten", icon: Heart, component: FavoritesManager },
    { value: "trades", label: "Trades", icon: TrendingUp, component: TradingHistory },
    { value: "verification", label: "Verifikation", icon: Shield, component: UserVerificationCenter },
    { value: "notifications", label: "Benachrichtigungen", icon: Bell, component: NotificationCenter },
    { value: "settings", label: "Einstellungen", icon: Settings, component: ProfileSettings }
  ];

  const showMobileLayout = device.isTouchDevice || device.isMobile || device.isTablet;

  return (
    <div className="min-h-screen bg-background">
      {/* Touch Device Header */}
      {showMobileLayout && <MobileDashboardHeader />}
      
      {/* Desktop Header */}
      {!showMobileLayout && (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <User className="h-3 w-3" />
                {userRole || 'user'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Live Updates Aktiv
              </Badge>
            </div>
            <DashboardBreadcrumb currentTab={currentTab} />
          </div>
        </div>
      )}

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full">
        {/* Touch Device Tab Navigation */}
        {showMobileLayout && (
          <MobileTabNavigation 
            value={currentTab} 
            onValueChange={setCurrentTab}
            isAdmin={false}
          />
        )}

        {/* Desktop Tab Navigation */}
        {!showMobileLayout && (
          <div className="container mx-auto px-4 mb-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-12 bg-muted/50">
              {tabsConfig.map((tab) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        )}

        {/* Content Area */}
        <div 
          ref={containerRef}
          className={cn(
            "flex-1 overflow-y-auto",
            showMobileLayout && [
              "pb-20", // Extra padding for mobile bottom navigation
              device.isIPad && "px-6",
              device.isTablet && "px-4", 
              device.isMobile && "px-4"
            ],
            !showMobileLayout && "px-0"
          )}
        >
          <div className={cn(
            showMobileLayout ? "" : "container mx-auto"
          )}>
            {tabsConfig.map((tab) => {
              const Component = tab.component;
              return (
                <TabsContent 
                  key={tab.value}
                  value={tab.value} 
                  className="space-y-6 mt-0 focus-visible:outline-none"
                >
                  <div className="animate-fade-in">
                    <Component />
                  </div>
                </TabsContent>
              );
            })}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
