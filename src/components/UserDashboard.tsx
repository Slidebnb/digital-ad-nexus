
import { useRef, useEffect, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useDashboardNavigation } from "@/hooks/useDashboardNavigation";
import { MobileTabNavigation } from "@/components/MobileTabNavigation";
import { MobileBottomNavigation } from "@/components/MobileBottomNavigation";
import { RealTimeUserDashboard } from "@/components/RealTimeUserDashboard";
import { EnhancedMessageSystem } from "@/components/EnhancedMessageSystem";
import { UserAds } from "@/components/UserAds";
import { UserVerificationCenter } from "@/components/UserVerificationCenter";
import { ProfileSettings } from "@/components/ProfileSettings";
import { FavoritesManager } from "@/components/FavoritesManager";
import { TradingHistory } from "@/components/TradingHistory";
import { NotificationCenter } from "@/components/NotificationCenter";
import { PremiumDashboardSection } from "@/components/PremiumDashboardSection";
import { SecurityDashboard } from "@/components/SecurityDashboard";
import { ReportsAnalytics } from "@/components/ReportsAnalytics";
import { Badge } from "@/components/ui/badge";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LazyLoadingWrapper } from "@/components/LazyLoadingWrapper";
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
  Crown,
  BarChart
} from "lucide-react";

// Error Fallback Component für einzelne Tabs
const TabErrorFallback = ({ tabName }: { tabName: string }) => (
  <div className="p-8 text-center">
    <div className="text-4xl mb-4">⚠️</div>
    <h3 className="text-lg font-semibold mb-2">Fehler in {tabName}</h3>
    <p className="text-muted-foreground">
      Dieser Bereich wird gerade überarbeitet. Bitte versuchen Sie es später erneut.
    </p>
  </div>
);

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

  // Updated Tab-Konfiguration (KRYPTO DURCH PREMIUM ERSETZT)
  const tabsConfig = [
    { 
      value: "overview", 
      label: "Übersicht", 
      icon: BarChart3, 
      component: RealTimeUserDashboard,
      stable: true 
    },
    { 
      value: "premium", 
      label: "Premium", 
      icon: Crown, 
      component: PremiumDashboardSection,
      stable: true 
    },
    { 
      value: "messages", 
      label: "Nachrichten", 
      icon: MessageSquare, 
      component: EnhancedMessageSystem,
      stable: true 
    },
    { 
      value: "ads", 
      label: "Anzeigen", 
      icon: ShoppingBag, 
      component: UserAds,
      stable: false // Markiert als potentiell instabil
    },
    { 
      value: "favorites", 
      label: "Favoriten", 
      icon: Heart, 
      component: FavoritesManager,
      stable: true 
    },
    { 
      value: "trades", 
      label: "Trades", 
      icon: TrendingUp, 
      component: TradingHistory,
      stable: true 
    },
    { 
      value: "analytics", 
      label: "Analytics", 
      icon: BarChart, 
      component: ReportsAnalytics,
      stable: true 
    },
    { 
      value: "verification", 
      label: "Verifikation", 
      icon: Shield, 
      component: UserVerificationCenter,
      stable: true 
    },
    { 
      value: "security", 
      label: "Sicherheit", 
      icon: Shield, 
      component: SecurityDashboard,
      stable: false // Markiert als potentiell instabil
    },
    { 
      value: "notifications", 
      label: "Benachrichtigungen", 
      icon: Bell, 
      component: NotificationCenter,
      stable: false // Markiert als potentiell instabil
    },
    { 
      value: "settings", 
      label: "Einstellungen", 
      icon: Settings, 
      component: ProfileSettings,
      stable: true 
    }
  ];

  const showMobileLayout = device.isTouchDevice || device.isMobile || device.isTablet;

  return (
    <div className="bg-gradient-to-br from-background via-background to-primary/5">      
      {/* Hauptinhalt Container */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Desktop Header */}
        {!showMobileLayout && (
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
              <Badge variant="outline" className="text-xs">
                📊 {tabsConfig.length} Funktionen verfügbar
              </Badge>
            </div>
          </div>
        )}

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full">
          {/* Mobile Tab Navigation */}
          {showMobileLayout && (
            <MobileTabNavigation 
              value={currentTab} 
              onValueChange={setCurrentTab}
              isAdmin={false}
            />
          )}

          {/* Desktop Tab Navigation */}
          {!showMobileLayout && (
            <div className="mb-6">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 h-12 bg-muted/50">
                {tabsConfig.map((tab) => (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {!tab.stable && (
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="In Entwicklung" />
                    )}
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
              showMobileLayout && "pb-20" // Extra padding for mobile bottom navigation
            )}
          >
            {tabsConfig.map((tab) => {
              const Component = tab.component;
              
              return (
                <TabsContent 
                  key={tab.value}
                  value={tab.value}
                  className="space-y-6 mt-0 focus-visible:outline-none"
                >
                  <div className="animate-fade-in">
                    {/* Enhanced Error Boundaries für instabile Komponenten */}
                    {tab.stable ? (
                      <ErrorBoundary fallback={<TabErrorFallback tabName={tab.label} />}>
                        <Component />
                      </ErrorBoundary>
                    ) : (
                      <ErrorBoundary fallback={<TabErrorFallback tabName={tab.label} />}>
                        <Suspense fallback={
                          <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        }>
                          <LazyLoadingWrapper>
                            <Component />
                          </LazyLoadingWrapper>
                        </Suspense>
                      </ErrorBoundary>
                    )}
                  </div>
                </TabsContent>
              );
            })}
          </div>
        </Tabs>
      </div>

      {/* Mobile Bottom Navigation - EINHEITLICH auf allen Seiten */}
      {showMobileLayout && <MobileBottomNavigation />}
    </div>
  );
}
