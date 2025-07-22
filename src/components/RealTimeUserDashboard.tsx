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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-16 w-full" />
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Fehler beim Laden der Daten</h3>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Kompakte Wichtige Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Anzeigen</p>
              <p className="text-xl font-bold">{stats.activeAds}</p>
              <p className="text-xs text-muted-foreground">{stats.totalViews} Aufrufe</p>
            </div>
            <ShoppingBag className="h-5 w-5 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Gespräche</p>
              <p className="text-xl font-bold">{Math.ceil(stats.totalMessages / 5)}</p>
              {stats.unreadMessages > 0 && (
                <Badge variant="destructive" className="text-xs mt-1">
                  {Math.ceil(stats.unreadMessages / 3)} neu
                </Badge>
              )}
            </div>
            <MessageCircle className="h-5 w-5 text-purple-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-bold">
                {stats.verified ? 'Verifiziert' : 'Nicht verifiziert'}
              </p>
              <p className="text-xs text-muted-foreground">{stats.totalFavorites} Favoriten</p>
            </div>
            <div className={`w-5 h-5 rounded-full ${stats.verified ? 'bg-green-500' : 'bg-yellow-500'}`} />
          </div>
        </Card>
      </div>

      {/* Kompakte Übersicht */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Schnellübersicht</CardTitle>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">
                Live • {lastUpdated.toLocaleTimeString('de-DE')}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Verifikationsstatus */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${stats.verified ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <div>
                <p className="font-medium">
                  {stats.verified ? 'Verifiziert' : 'Nicht verifiziert'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Level: {stats.verificationLevel || 'Keine'}
                </p>
              </div>
            </div>
            {!stats.verified && (
              <Badge variant="outline">Jetzt verifizieren</Badge>
            )}
          </div>

          {/* Trades Übersicht */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Trades</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalTrades}</p>
              <p className="text-xs text-muted-foreground">Abgeschlossen</p>
            </div>
            
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Erfolgsrate</span>
              </div>
              <p className="text-2xl font-bold">
                {stats.totalTrades > 0 ? '100%' : '0%'}
              </p>
              <p className="text-xs text-muted-foreground">Zufriedenheit</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}