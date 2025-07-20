
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminRealTimeMetrics } from "@/hooks/useAdminRealTimeMetrics";
import { SkeletonCard } from "@/components/ui/loading-states";
import { 
  Users, 
  ShieldAlert, 
  TrendingUp, 
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  MessageSquare,
  DollarSign,
  UserCheck,
  Target,
  Zap,
  Clock
} from "lucide-react";

export function AdminStats() {
  const { 
    metrics, 
    systemHealth, 
    alerts, 
    loading, 
    error, 
    resolveAlert, 
    clearAllAlerts, 
    refresh 
  } = useAdminRealTimeMetrics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const businessMetrics = [
    {
      title: "Gesamtnutzer",
      value: metrics.totalUsers,
      subtitle: "Registrierte Benutzer",
      icon: Users,
      color: "text-primary",
      change: `+${metrics.newUsersToday} heute`
    },
    {
      title: "Aktive Nutzer",
      value: metrics.activeUsers,
      subtitle: "Letzte 24h",
      icon: Activity,
      color: "text-success",
      change: `${((metrics.activeUsers / Math.max(metrics.totalUsers, 1)) * 100).toFixed(1)}%`
    },
    {
      title: "Verifizierte Nutzer",
      value: metrics.verifiedUsers,
      subtitle: "ID-verifiziert",
      icon: UserCheck,
      color: "text-secondary",
      change: `${((metrics.verifiedUsers / Math.max(metrics.totalUsers, 1)) * 100).toFixed(1)}%`
    },
    {
      title: "Platform Volumen",
      value: `€${metrics.platformVolume.toLocaleString('de-DE')}`,
      subtitle: "Gesamt Handelsvolumen",
      icon: DollarSign,
      color: "text-success",
      change: `€${metrics.monthlyVolume.toLocaleString('de-DE')} MTD`
    }
  ];

  const contentMetrics = [
    {
      title: "Aktive Anzeigen",
      value: metrics.activeAds,
      subtitle: `von ${metrics.totalAds} gesamt`,
      icon: TrendingUp,
      color: "text-accent"
    },
    {
      title: "Boosted Ads",
      value: metrics.boostedAds,
      subtitle: "Premium Anzeigen",
      icon: Zap,
      color: "text-warning"
    },
    {
      title: "Aktive Chats",
      value: metrics.activeConversations,
      subtitle: `von ${metrics.totalConversations} gesamt`,
      icon: MessageSquare,
      color: "text-primary"
    },
    {
      title: "Abgeschlossene Trades",
      value: metrics.completedTrades,
      subtitle: `von ${metrics.totalTrades} gesamt`,
      icon: CheckCircle,
      color: "text-success"
    }
  ];

  const moderationMetrics = [
    {
      title: "Ausstehende Reports",
      value: metrics.pendingReports,
      subtitle: `von ${metrics.totalReports} gesamt`,
      icon: ShieldAlert,
      color: metrics.pendingReports > 10 ? "text-destructive" : "text-muted-foreground",
      urgent: metrics.pendingReports > 10
    },
    {
      title: "Verifikationen",
      value: metrics.pendingVerifications,
      subtitle: "Warten auf Bearbeitung",
      icon: Target,
      color: metrics.pendingVerifications > 20 ? "text-destructive" : "text-muted-foreground",
      urgent: metrics.pendingVerifications > 20
    }
  ];

  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      {alerts.length > 0 && (
        <Alert variant="destructive" className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{alerts.length} Kritische Alerts</div>
                <div className="text-sm mt-1">
                  {alerts.slice(0, 2).map(alert => (
                    <div key={alert.id} className="flex items-center gap-2">
                      <span>{alert.title}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => resolveAlert(alert.id)}
                        className="h-6 px-2 text-xs"
                      >
                        Erledigt
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={clearAllAlerts}>
                Alle löschen
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Business Intelligence */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Business Intelligence
          </h3>
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Live Updates
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {businessMetrics.map((metric, index) => (
            <Card key={index} className="gradient-card hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                  <Badge variant="secondary" className="text-xs">
                    {metric.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Content & Activity */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Content & Aktivität
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contentMetrics.map((metric, index) => (
            <Card key={index} className="gradient-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{metric.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Moderation Dashboard */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Moderation & Sicherheit
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {moderationMetrics.map((metric, index) => (
            <Card key={index} className={`gradient-card ${metric.urgent ? 'border-destructive' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {metric.title}
                  {metric.urgent && (
                    <Badge variant="destructive" className="text-xs animate-pulse">
                      URGENT
                    </Badge>
                  )}
                </CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{metric.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* System Health Dashboard */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className={`h-5 w-5 ${getHealthColor(systemHealth.overall >= 90 ? 'healthy' : systemHealth.overall >= 70 ? 'warning' : 'critical')}`} />
              System Health Score
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {systemHealth.lastChecked.toLocaleTimeString('de-DE')}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-3xl font-bold ${getHealthColor(systemHealth.overall >= 90 ? 'healthy' : systemHealth.overall >= 70 ? 'warning' : 'critical')}`}>
                {systemHealth.overall.toFixed(1)}%
              </span>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Gesamt-Health</div>
                <div className="text-xs font-medium">Letzte 24h</div>
              </div>
            </div>
            
            <Progress value={systemHealth.overall} className="h-3" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {[
                { name: 'Database', status: systemHealth.database },
                { name: 'Storage', status: systemHealth.storage },
                { name: 'API', status: systemHealth.api },
                { name: 'Auth', status: systemHealth.auth }
              ].map((service) => (
                <div key={service.name} className="text-center">
                  <div className={`text-sm font-medium ${getHealthColor(service.status)}`}>
                    {service.name}
                  </div>
                  <Badge 
                    variant={service.status === 'healthy' ? 'secondary' : 'destructive'} 
                    className="text-xs mt-1"
                  >
                    {service.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
