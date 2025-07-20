
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
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

interface UserStats {
  totalAds: number;
  activeAds: number;
  totalViews: number;
  totalMessages: number;
  unreadMessages: number;
  totalFavorites: number;
  totalTrades: number;
  rating: number;
  trustScore: number;
  todayViews: number;
  todayMessages: number;
  weeklyViews: number;
  totalTradeVolume: number;
  responseTimeMinutes: number;
}

export function RealTimeUserDashboard() {
  const { user } = useAuth();
  const { stats, loading } = useUserStats();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Auto-update timestamp
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Aktive Anzeigen",
      value: stats.activeAds,
      total: stats.totalAds,
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Aufrufe Gesamt", 
      value: stats.totalViews,
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Nachrichten",
      value: stats.totalMessages,
      badge: stats.unreadMessages > 0 ? stats.unreadMessages : null,
      icon: MessageCircle,
      color: "text-purple-600", 
      bgColor: "bg-purple-50"
    },
    {
      title: "Favoriten",
      value: stats.totalFavorites,
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Live Dashboard</h2>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-500" />
          <Badge variant="outline" className="text-xs">
            Live • Zuletzt aktualisiert: {lastUpdated.toLocaleTimeString('de-DE')}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {card.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {card.value}
                    </span>
                    {card.total && (
                      <span className="text-sm text-muted-foreground">
                        / {card.total}
                      </span>
                    )}
                    {card.badge && (
                      <Badge variant="destructive" className="text-xs">
                        {card.badge}
                      </Badge>
                    )}
                  </div>
                  {/* Optional subValue removed for simplicity */}
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Status Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalViews}</p>
              <p className="text-sm text-muted-foreground">Gesamte Aufrufe</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.totalTrades}</p>
              <p className="text-sm text-muted-foreground">Abgeschlossene Trades</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {stats.verified ? 'Verifiziert' : 'Nicht verifiziert'}
              </p>
              <p className="text-sm text-muted-foreground">Verification Status ({stats.verificationLevel})</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
