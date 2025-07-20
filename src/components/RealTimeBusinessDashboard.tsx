
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRealTimeMetrics } from "@/hooks/useRealTimeMetrics";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Eye,
  MessageSquare,
  Shield,
  Target
} from "lucide-react";

export function RealTimeBusinessDashboard() {
  const { metrics, alerts, loading } = useRealTimeMetrics();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <Card key={i} className="gradient-card animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getHealthStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'healthy';
    if (value <= thresholds.warning) return 'warning';
    return 'critical';
  };

  const healthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const businessMetrics = [
    {
      title: "Aktive Nutzer (Live)",
      value: metrics.activeUsers,
      subtitle: "Online in letzten 15min",
      icon: Users,
      color: "text-primary",
      change: "+12%",
      isLive: true
    },
    {
      title: "Neue Nutzer Heute",
      value: metrics.newUsersToday,
      subtitle: "Registrierungen",
      icon: UserCheck,
      color: "text-success",
      change: "+5%"
    },
    {
      title: "Platform Revenue",
      value: `€${metrics.totalRevenue.toFixed(2)}`,
      subtitle: "Crypto Payments",
      icon: DollarSign,
      color: "text-success",
      change: "+18%"
    },
    {
      title: "Conversion Rate",
      value: `${metrics.conversionRate.toFixed(1)}%`,
      subtitle: "Registration → Active",
      icon: Target,
      color: "text-secondary",
      change: "+3%"
    }
  ];

  const activityMetrics = [
    {
      title: "Ads Heute",
      value: metrics.adsCreatedToday,
      subtitle: "Neue Anzeigen",
      icon: TrendingUp,
      color: "text-accent"
    },
    {
      title: "Nachrichten",
      value: metrics.messagesExchanged,
      subtitle: "Heute ausgetauscht",
      icon: MessageSquare,
      color: "text-primary"
    },
    {
      title: "Trades Completed",
      value: metrics.tradesCompleted,
      subtitle: "Erfolgreich abgeschlossen",
      icon: CheckCircle,
      color: "text-success"
    },
    {
      title: "Pending Verifications",
      value: metrics.verificationsPending,
      subtitle: "Warten auf Bearbeitung",
      icon: Shield,
      color: metrics.verificationsPending > 5 ? "text-warning" : "text-muted-foreground"
    }
  ];

  const performanceMetrics = [
    {
      title: "Avg Query Time",
      value: `${metrics.avgQueryTime}ms`,
      status: getHealthStatus(metrics.avgQueryTime, { good: 100, warning: 300 }),
      threshold: 500
    },
    {
      title: "Error Rate",
      value: `${metrics.errorRate.toFixed(1)}%`,
      status: getHealthStatus(metrics.errorRate, { good: 1, warning: 3 }),
      threshold: 5
    },
    {
      title: "Response Time",
      value: `${metrics.responseTime}ms`,
      status: getHealthStatus(metrics.responseTime, { good: 200, warning: 500 }),
      threshold: 1000
    },
    {
      title: "Active Connections",
      value: metrics.activeConnections.toString(),
      status: getHealthStatus(metrics.activeConnections, { good: 10, warning: 25 }),
      threshold: 50
    }
  ];

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {alerts.length > 0 && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {alerts.length} Aktive Alerts
              <Badge variant="destructive" className="animate-pulse">
                CRITICAL
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-2 bg-background rounded">
                  <div>
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-sm text-muted-foreground">{alert.message}</div>
                  </div>
                  <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.type.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Business Intelligence (Live)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {businessMetrics.map((metric, index) => (
            <Card key={index} className="gradient-card hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {metric.title}
                  {metric.isLive && (
                    <Badge variant="outline" className="text-xs text-success border-success animate-pulse">
                      <Activity className="h-3 w-3 mr-1" />
                      LIVE
                    </Badge>
                  )}
                </CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                  {metric.change && (
                    <Badge variant="secondary" className="text-xs text-success">
                      {metric.change}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Activity Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Platform Activity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activityMetrics.map((metric, index) => (
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

      {/* Performance Dashboard */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          System Performance (Real-time)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceMetrics.map((metric, index) => (
            <Card key={index} className="gradient-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <div className={`w-3 h-3 rounded-full ${
                  metric.status === 'healthy' ? 'bg-success animate-pulse' : 
                  metric.status === 'warning' ? 'bg-warning animate-pulse' : 
                  'bg-destructive animate-pulse'
                }`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${healthColor(metric.status)}`}>
                  {metric.value}
                </div>
                <div className="mt-2">
                  <Progress 
                    value={Math.min((parseFloat(metric.value) / metric.threshold) * 100, 100)} 
                    className={`h-2 ${metric.status === 'critical' ? 'bg-destructive/20' : ''}`}
                  />
                </div>
                <Badge 
                  variant={metric.status === 'healthy' ? 'secondary' : 'destructive'} 
                  className="text-xs mt-2"
                >
                  {metric.status.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* System Health Summary */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            System Health Score
            <Badge variant="secondary" className="ml-auto">
              <Clock className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-bold text-success">{metrics.uptime}%</span>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Uptime</div>
              <div className="text-sm font-medium">Last 24h</div>
            </div>
          </div>
          <Progress value={metrics.uptime} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Excellent</span>
            <span>{metrics.errorCount} errors today</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
