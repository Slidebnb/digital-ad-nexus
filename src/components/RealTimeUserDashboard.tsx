
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { logger } from "@/utils/logger";
import { 
  Eye, 
  MessageCircle, 
  Heart, 
  ShoppingBag, 
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  Star,
  Activity
} from "lucide-react";

export function RealTimeUserDashboard() {
  const { user } = useAuth();
  const { stats, loading, error } = useUserStats();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Auto-update timestamp every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Memoize stat cards to prevent unnecessary re-renders
  const statCards = useMemo(() => [
    {
      title: "Aktive Anzeigen",
      value: stats.activeAds,
      total: stats.totalAds,
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: stats.totalAds > 0 ? Math.round((stats.activeAds / stats.totalAds) * 100) : 0
    },
    {
      title: "Aufrufe Gesamt", 
      value: stats.totalViews,
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: stats.totalViews > 0 ? '+' + stats.totalViews : 0
    },
    {
      title: "Nachrichten",
      value: stats.totalMessages,
      badge: stats.unreadMessages > 0 ? stats.unreadMessages : null,
      icon: MessageCircle,
      color: "text-purple-600", 
      bgColor: "bg-purple-50",
      change: stats.unreadMessages > 0 ? `${stats.unreadMessages} neu` : 'Alle gelesen'
    },
    {
      title: "Favoriten",
      value: stats.totalFavorites,
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
      change: stats.totalFavorites > 0 ? `${stats.totalFavorites} gesamt` : 'Keine'
    }
  ], [stats]);

  // Show loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    logger.error('Dashboard error', 'RealTimeUserDashboard', { error });
    
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center">
          <div className="text-destructive mb-2">⚠️ Fehler beim Laden</div>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with live indicator */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Live Dashboard</h2>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-500 animate-pulse" />
          <Badge variant="outline" className="text-xs">
            Live • {lastUpdated.toLocaleTimeString('de-DE')}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-1 truncate">
                    {card.title}
                  </p>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-bold">
                      {card.value.toLocaleString('de-DE')}
                    </span>
                    {card.total && (
                      <span className="text-sm text-muted-foreground">
                        / {card.total.toLocaleString('de-DE')}
                      </span>
                    )}
                    {card.badge && (
                      <Badge variant="destructive" className="text-xs ml-1">
                        {card.badge}
                      </Badge>
                    )}
                  </div>
                  {card.change && (
                    <p className="text-xs text-muted-foreground truncate">
                      {card.change}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor} shrink-0`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Status Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.totalViews.toLocaleString('de-DE')}
              </div>
              <p className="text-sm text-muted-foreground">Gesamte Aufrufe</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {stats.totalTrades.toLocaleString('de-DE')}
              </div>
              <p className="text-sm text-muted-foreground">Abgeschlossene Trades</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {stats.verified ? 'Verifiziert' : 'Nicht verifiziert'}
              </div>
              <p className="text-sm text-muted-foreground">
                Status ({stats.verificationLevel})
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
