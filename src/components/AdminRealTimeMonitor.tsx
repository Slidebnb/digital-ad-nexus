import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminStats } from "@/hooks/useAdminStats";
import { 
  Activity, 
  Database, 
  Server, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Eye,
  MessageSquare,
  TrendingUp
} from "lucide-react";

interface RealTimeMetric {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

export function AdminRealTimeMonitor() {
  const { stats, systemHealth, loading } = useAdminStats();
  const [liveMetrics, setLiveMetrics] = useState<RealTimeMetric[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      setLiveMetrics([
        {
          label: 'Aktive Nutzer',
          value: stats.activeUsers + Math.floor(Math.random() * 10 - 5),
          unit: 'online',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          status: 'good'
        },
        {
          label: 'Neue Anzeigen/h',
          value: Math.floor(Math.random() * 20) + 5,
          unit: 'per hour',
          trend: 'up',
          status: 'good'
        },
        {
          label: 'API Aufrufe/min',
          value: Math.floor(Math.random() * 200) + 100,
          unit: 'requests',
          trend: 'stable',
          status: stats.avgResponseTime > 200 ? 'warning' : 'good'
        },
        {
          label: 'DB Verbindungen',
          value: stats.databaseConnections,
          unit: 'connections',
          trend: 'stable',
          status: stats.databaseConnections > 40 ? 'warning' : 'good'
        },
        {
          label: 'Server Load',
          value: Math.floor(stats.serverLoad),
          unit: '%',
          trend: stats.serverLoad > 70 ? 'up' : 'stable',
          status: stats.serverLoad > 80 ? 'critical' : stats.serverLoad > 60 ? 'warning' : 'good'
        },
        {
          label: 'Antwortzeit',
          value: stats.avgResponseTime,
          unit: 'ms',
          trend: stats.avgResponseTime > 150 ? 'up' : 'down',
          status: stats.avgResponseTime > 200 ? 'warning' : 'good'
        }
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, [stats]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-success" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-destructive rotate-180" />;
      default: return <div className="h-3 w-3 rounded-full bg-muted" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="gradient-card animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Datenbank</CardTitle>
            {getStatusIcon(systemHealth.database)}
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold capitalize">
              {systemHealth.database}
            </div>
            <Progress value={stats.databaseConnections * 2} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API</CardTitle>
            {getStatusIcon(systemHealth.api)}
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold capitalize">
              {systemHealth.api}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.avgResponseTime}ms avg
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            {getStatusIcon(systemHealth.storage)}
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold capitalize">
              {systemHealth.storage}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Verfügbar
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auth</CardTitle>
            {getStatusIcon(systemHealth.auth)}
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold capitalize">
              {systemHealth.auth}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.errorRate.toFixed(1)}% Fehlerrate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Metrics */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Metriken
            <Badge variant="outline" className="ml-auto">
              <Clock className="h-3 w-3 mr-1" />
              {currentTime.toLocaleTimeString('de-DE')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMetrics.map((metric, index) => (
              <div key={index} className="p-4 border rounded-lg bg-background/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(metric.status)}`}
                    >
                      {metric.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {metric.value.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metric.unit}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity Feed */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Live Aktivitäten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
              <Users className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <div className="text-sm font-medium">Neue Registrierung</div>
                <div className="text-xs text-muted-foreground">
                  vor {Math.floor(Math.random() * 5) + 1} Minuten
                </div>
              </div>
              <Badge variant="outline">+1 Nutzer</Badge>
            </div>

            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
              <Eye className="h-4 w-4 text-secondary" />
              <div className="flex-1">
                <div className="text-sm font-medium">Neue Anzeige erstellt</div>
                <div className="text-xs text-muted-foreground">
                  vor {Math.floor(Math.random() * 10) + 1} Minuten
                </div>
              </div>
              <Badge variant="outline">Bitcoin</Badge>
            </div>

            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
              <MessageSquare className="h-4 w-4 text-accent" />
              <div className="flex-1">
                <div className="text-sm font-medium">Trade abgeschlossen</div>
                <div className="text-xs text-muted-foreground">
                  vor {Math.floor(Math.random() * 15) + 1} Minuten
                </div>
              </div>
              <Badge variant="outline">€{Math.floor(Math.random() * 5000) + 500}</Badge>
            </div>

            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-success" />
              <div className="flex-1">
                <div className="text-sm font-medium">Verifizierung genehmigt</div>
                <div className="text-xs text-muted-foreground">
                  vor {Math.floor(Math.random() * 20) + 1} Minuten
                </div>
              </div>
              <Badge variant="outline">Identität</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      {stats.serverLoad > 80 && (
        <Alert className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Hohe Serverlast:</strong> Server Load bei {Math.floor(stats.serverLoad)}%. 
            Überwachung empfohlen.
          </AlertDescription>
        </Alert>
      )}

      {stats.databaseConnections > 40 && (
        <Alert className="border-warning">
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Viele DB-Verbindungen:</strong> {stats.databaseConnections} aktive Verbindungen. 
            Connection Pooling prüfen.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}