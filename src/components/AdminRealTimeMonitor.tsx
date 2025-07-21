import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAdminRealTimeMetrics } from "@/hooks/useAdminRealTimeMetrics";
import { logger } from "@/utils/logger";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database,
  Globe,
  Server,
  Shield,
  Zap,
  RefreshCw
} from "lucide-react";

interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export function AdminRealTimeMonitor() {
  const { systemHealth, loading, error } = useAdminRealTimeMetrics();
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [lastHealthCheck, setLastHealthCheck] = useState<Date>(new Date());

  useEffect(() => {
    // Simulated real-time monitoring
    const checkSystemHealth = () => {
      const now = new Date();
      setLastHealthCheck(now);

      // Check for performance issues
      if (systemHealth.overall < 70) {
        const alertId = `perf-${Date.now()}`;
        setAlerts(prev => [...prev, {
          id: alertId,
          type: 'critical',
          title: 'Performance Degradation',
          message: `System health dropped to ${systemHealth.overall.toFixed(1)}%`,
          timestamp: now,
          resolved: false
        }]);
      }

      // Check database health
      if (systemHealth.database !== 'healthy') {
        const alertId = `db-${Date.now()}`;
        setAlerts(prev => [...prev, {
          id: alertId,
          type: 'warning',
          title: 'Database Issues',
          message: `Database status: ${systemHealth.database}`,
          timestamp: now,
          resolved: false
        }]);
      }

      logger.info('System health check completed', 'admin-monitor', {
        overall: systemHealth.overall,
        timestamp: now.toISOString()
      });
    };

    // Initial check
    checkSystemHealth();

    // Set up monitoring interval
    const healthCheckInterval = setInterval(checkSystemHealth, 30000); // Every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, [systemHealth]);

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const clearResolvedAlerts = () => {
    setAlerts(prev => prev.filter(alert => !alert.resolved));
  };

  const unresolvedAlerts = alerts.filter(alert => !alert.resolved);
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-destructive bg-destructive/5';
      case 'warning': return 'border-yellow-500 bg-yellow-500/5';
      case 'info': return 'border-blue-500 bg-blue-500/5';
      default: return 'border-border';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Alerts */}
      {unresolvedAlerts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Live Alerts ({unresolvedAlerts.length})
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearResolvedAlerts}
              className="text-xs"
            >
              Clear Resolved
            </Button>
          </div>
          
          {unresolvedAlerts.slice(0, 5).map((alert) => (
            <Alert key={alert.id} className={getAlertColor(alert.type)}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{alert.title}</div>
                    <div className="text-sm">{alert.message}</div>
                    <div className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString('de-DE')}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => resolveAlert(alert.id)}
                    className="ml-4"
                  >
                    Resolve
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            name: 'Database', 
            status: systemHealth.database, 
            icon: Database,
            metrics: '99.9% uptime'
          },
          { 
            name: 'API Gateway', 
            status: systemHealth.api, 
            icon: Globe,
            metrics: 'avg 120ms'
          },
          { 
            name: 'Authentication', 
            status: systemHealth.auth, 
            icon: Shield,
            metrics: '1.2k sessions'
          },
          { 
            name: 'File Storage', 
            status: systemHealth.storage, 
            icon: Server,
            metrics: '85% capacity'
          }
        ].map((service) => (
          <Card key={service.name} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <service.icon className="h-4 w-4" />
                {service.name}
              </CardTitle>
              {getHealthIcon(service.status)}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge 
                  variant={service.status === 'healthy' ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {service.status.toUpperCase()}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {service.metrics}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Performance Metrics
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {lastHealthCheck.toLocaleTimeString('de-DE')}
              <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Response Times */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Response Times
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>API Average:</span>
                  <span className="font-mono">120ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Database:</span>
                  <span className="font-mono">45ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage:</span>
                  <span className="font-mono">230ms</span>
                </div>
              </div>
            </div>

            {/* Resource Usage */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Server className="h-4 w-4" />
                Resource Usage
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>CPU:</span>
                  <span className="font-mono">23%</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span className="font-mono">67%</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage:</span>
                  <span className="font-mono">85%</span>
                </div>
              </div>
            </div>

            {/* Error Rates */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Error Rates
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>4xx Errors:</span>
                  <span className="font-mono text-yellow-600">0.12%</span>
                </div>
                <div className="flex justify-between">
                  <span>5xx Errors:</span>
                  <span className="font-mono text-red-600">0.03%</span>
                </div>
                <div className="flex justify-between">
                  <span>Timeouts:</span>
                  <span className="font-mono text-red-600">0.01%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Events Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent System Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[
              { time: '13:45:23', event: 'Database backup completed successfully', type: 'info' },
              { time: '13:42:15', event: 'High memory usage detected (>80%)', type: 'warning' },
              { time: '13:40:01', event: 'New user registration spike (+25%)', type: 'info' },
              { time: '13:38:44', event: 'API rate limit triggered for user batch', type: 'warning' },
              { time: '13:35:12', event: 'Scheduled maintenance window started', type: 'info' }
            ].map((log, index) => (
              <div key={index} className="flex items-center gap-3 text-sm p-2 hover:bg-muted/50 rounded">
                <div className={`w-2 h-2 rounded-full ${
                  log.type === 'warning' ? 'bg-yellow-500' : 
                  log.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                }`} />
                <span className="font-mono text-xs text-muted-foreground">{log.time}</span>
                <span className="flex-1">{log.event}</span>
                <Badge variant="outline" className="text-xs">
                  {log.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}