
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Server, 
  Database, 
  Activity, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Monitor,
  Zap,
  HardDrive,
  Network
} from "lucide-react";

interface SystemMetrics {
  activeUsers: number;
  totalConnections: number;
  databaseHealth: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  storageUsage: number;
  networkLatency: number;
}

interface PerformanceAlert {
  id: string;
  type: 'performance' | 'error' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export function AdminSystemMonitor() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeUsers: 0,
    totalConnections: 0,
    databaseHealth: 'healthy',
    responseTime: 0,
    errorRate: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    storageUsage: 0,
    networkLatency: 0
  });
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchSystemMetrics = async () => {
    try {
      // Simulate system metrics (in production, these would come from monitoring services)
      const startTime = Date.now();
      
      // Test database response time
      await supabase.from('profiles').select('count').limit(1);
      const dbResponseTime = Date.now() - startTime;

      // Get active users count
      const { data: activeUsersData } = await supabase
        .from('profiles')
        .select('id, last_active')
        .gte('last_active', new Date(Date.now() - 15 * 60 * 1000).toISOString()); // Active in last 15 minutes

      // Get total connections (approximate)
      const { data: totalUsersData } = await supabase
        .from('profiles')
        .select('count', { count: 'exact' });

      // Simulate other metrics (in production, these would come from server monitoring)
      const newMetrics: SystemMetrics = {
        activeUsers: activeUsersData?.length || 0,
        totalConnections: Math.floor(Math.random() * 50) + 10,
        databaseHealth: dbResponseTime < 200 ? 'healthy' : dbResponseTime < 500 ? 'warning' : 'critical',
        responseTime: dbResponseTime,
        errorRate: Math.random() * 2, // 0-2%
        memoryUsage: Math.floor(Math.random() * 30) + 60, // 60-90%
        cpuUsage: Math.floor(Math.random() * 20) + 10, // 10-30%
        storageUsage: Math.floor(Math.random() * 15) + 70, // 70-85%
        networkLatency: Math.floor(Math.random() * 50) + 20 // 20-70ms
      };

      setMetrics(newMetrics);
      
      // Generate alerts based on metrics
      const newAlerts: PerformanceAlert[] = [];
      
      if (newMetrics.responseTime > 500) {
        newAlerts.push({
          id: `alert-${Date.now()}-1`,
          type: 'performance',
          severity: 'high',
          message: `High database response time: ${newMetrics.responseTime}ms`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }
      
      if (newMetrics.errorRate > 1.5) {
        newAlerts.push({
          id: `alert-${Date.now()}-2`,
          type: 'error',
          severity: 'medium',
          message: `Elevated error rate: ${newMetrics.errorRate.toFixed(2)}%`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }
      
      if (newMetrics.memoryUsage > 85) {
        newAlerts.push({
          id: `alert-${Date.now()}-3`,
          type: 'performance',
          severity: 'critical',
          message: `High memory usage: ${newMetrics.memoryUsage}%`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }

      setAlerts(prev => [...newAlerts, ...prev.slice(0, 10)]); // Keep last 10 alerts
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      toast({
        title: "Fehler",
        description: "System-Metriken konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatus = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'healthy';
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSystemMetrics();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchSystemMetrics, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Zugriff verweigert. Nur Administratoren können den System Monitor einsehen.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const systemCards = [
    {
      title: "Aktive Nutzer",
      value: metrics.activeUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      status: getHealthStatus(metrics.activeUsers, { warning: 100, critical: 200 })
    },
    {
      title: "Verbindungen",
      value: metrics.totalConnections,
      icon: Network,
      color: "text-green-600",
      bgColor: "bg-green-50",
      status: getHealthStatus(metrics.totalConnections, { warning: 40, critical: 50 })
    },
    {
      title: "Antwortzeit",
      value: `${metrics.responseTime}ms`,
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      status: getHealthStatus(metrics.responseTime, { warning: 200, critical: 500 })
    },
    {
      title: "Fehlerrate",
      value: `${metrics.errorRate.toFixed(2)}%`,
      icon: AlertTriangle,
      color: "text-red-600", 
      bgColor: "bg-red-50",
      status: getHealthStatus(metrics.errorRate, { warning: 1, critical: 2 })
    },
    {
      title: "Speicher",
      value: `${metrics.memoryUsage}%`,
      icon: HardDrive,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      status: getHealthStatus(metrics.memoryUsage, { warning: 80, critical: 90 })
    },
    {
      title: "CPU",
      value: `${metrics.cpuUsage}%`,
      icon: Monitor,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      status: getHealthStatus(metrics.cpuUsage, { warning: 70, critical: 90 })
    },
    {
      title: "Storage",
      value: `${metrics.storageUsage}%`,
      icon: Database,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      status: getHealthStatus(metrics.storageUsage, { warning: 80, critical: 90 })
    },
    {
      title: "Latenz",
      value: `${metrics.networkLatency}ms`,
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      status: getHealthStatus(metrics.networkLatency, { warning: 100, critical: 200 })
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Server className="h-6 w-6" />
          System Monitor
        </h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-xs">
            Zuletzt aktualisiert: {lastUpdated.toLocaleTimeString('de-DE')}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSystemMetrics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemCards.map((card, index) => (
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
                    {getHealthIcon(card.status)}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            System Alerts
            {alerts.filter(a => !a.resolved).length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {alerts.filter(a => !a.resolved).length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine aktiven Alerts</h3>
              <p className="text-muted-foreground">
                Alle Systeme laufen normal.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <Alert key={alert.id} className={alert.resolved ? "opacity-50" : ""}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium capitalize">{alert.type}</span>
                          {alert.resolved && (
                            <Badge variant="outline" className="text-green-600">
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.timestamp).toLocaleString('de-DE')}
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
