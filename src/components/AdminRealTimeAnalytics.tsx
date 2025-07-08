import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminStats } from "@/hooks/useAdminStats";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  TrendingUp,
  BarChart3,
  Shield,
  AlertTriangle,
  UserCheck,
  MessageCircle,
  Activity,
  Zap,
  Star,
  Eye,
  DollarSign
} from "lucide-react";

export function AdminRealTimeAnalytics() {
  const { stats, systemHealth, loading, error } = useAdminStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="gradient-card animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="gradient-card border-destructive">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Fehler beim Laden der Analytics: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color = "text-primary",
    trend,
    isLive = false 
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    color?: string;
    trend?: number;
    isLive?: boolean;
  }) => (
    <Card className="gradient-card hover:shadow-lg transition-all duration-300 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {title}
          {isLive && (
            <Badge variant="outline" className="text-xs text-success border-success animate-pulse">
              <Activity className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
          )}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color.includes('text-') ? color : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>
          {typeof value === 'number' ? value.toLocaleString('de-DE') : value}
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">{subtitle}</p>
          {trend !== undefined && (
            <Badge variant={trend > 0 ? "default" : "secondary"} className="text-xs">
              {trend > 0 ? '+' : ''}{trend}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Live System Status */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-success" />
            System-Status (Live)
            <Badge variant="outline" className="text-success border-success animate-pulse">
              <Activity className="h-3 w-3 mr-1" />
              Echtzeit
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(systemHealth).map(([key, status]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  status === 'healthy' ? 'bg-success animate-pulse' : 
                  status === 'warning' ? 'bg-warning animate-pulse' : 
                  'bg-destructive animate-pulse'
                }`} />
                <span className="text-sm capitalize">{key}</span>
                <Badge variant={status === 'healthy' ? 'default' : 'destructive'} className="text-xs">
                  {status === 'healthy' ? 'OK' : status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Gesamte Nutzer"
          value={stats.totalUsers}
          subtitle="Registrierte Accounts"
          icon={Users}
          color="text-primary"
          isLive={true}
        />

        <StatCard
          title="Verifizierte Nutzer"
          value={stats.verifiedUsers}
          subtitle={`${Math.round((stats.verifiedUsers / Math.max(stats.totalUsers, 1)) * 100)}% aller Nutzer`}
          icon={Shield}
          color="text-success"
          isLive={true}
        />

        <StatCard
          title="Aktive Anzeigen"
          value={stats.activeAds}
          subtitle="Veröffentlicht & verfügbar"
          icon={TrendingUp}
          color="text-secondary"
          isLive={true}
        />

        <StatCard
          title="Platform Volumen"
          value={`€${(stats.platformVolume / 1000).toFixed(1)}K`}
          subtitle="Gesamte Handelsvolumen"
          icon={DollarSign}
          color="text-success"
          isLive={true}
        />

        <StatCard
          title="Neue Nutzer heute"
          value={stats.newUsersToday}
          subtitle="Registrierungen heute"
          icon={UserCheck}
          color="text-accent"
          isLive={true}
        />

        <StatCard
          title="Aktive Nutzer (24h)"
          value={stats.activeUsers}
          subtitle="Online in letzten 24h"
          icon={Activity}
          color="text-primary"
          isLive={true}
        />

        <StatCard
          title="Ausstehende Meldungen"
          value={stats.pendingReports}
          subtitle="Benötigen Aufmerksamkeit"
          icon={AlertTriangle}
          color={stats.pendingReports > 0 ? "text-warning" : "text-muted-foreground"}
          isLive={true}
        />

        <StatCard
          title="Verifizierungsanfragen"
          value={stats.pendingVerifications}
          subtitle="Wartend auf Bearbeitung"
          icon={Eye}
          color={stats.pendingVerifications > 0 ? "text-warning" : "text-muted-foreground"}
          isLive={true}
        />
      </div>

      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Trading-Aktivität
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Gesamte Trades</span>
              <span className="font-bold">{stats.totalTrades.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Erfolgsrate</span>
              <span className="font-bold text-success">
                {Math.round((stats.completedTrades / Math.max(stats.totalTrades, 1)) * 100)}%
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Trading-Volumen</span>
                <span className="text-sm font-medium">
                  €{stats.platformVolume.toLocaleString('de-DE')}
                </span>
              </div>
              <Progress 
                value={Math.min((stats.platformVolume / 100000) * 100, 100)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Kommunikation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Gespräche</span>
              <span className="font-bold">{stats.totalConversations.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Aktive Chats</span>
              <span className="font-bold text-primary">{stats.activeConversations}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Chat-Aktivität</span>
                <span className="text-sm font-medium">
                  {Math.round((stats.activeConversations / Math.max(stats.totalConversations, 1)) * 100)}%
                </span>
              </div>
              <Progress 
                value={(stats.activeConversations / Math.max(stats.totalConversations, 1)) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              Platform-Qualität
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg. Response</span>
              <span className="font-bold text-primary">{stats.avgResponseTime}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Error Rate</span>
              <span className={`font-bold ${stats.errorRate < 1 ? 'text-success' : 'text-warning'}`}>
                {stats.errorRate.toFixed(2)}%
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">System Load</span>
                <span className="text-sm font-medium">{stats.serverLoad.toFixed(1)}%</span>
              </div>
              <Progress 
                value={stats.serverLoad} 
                className={`h-2 ${stats.serverLoad > 80 ? 'bg-warning' : ''}`}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}