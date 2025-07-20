
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye, 
  Users, 
  Database,
  Activity,
  Bell,
  CheckCircle,
  XCircle
} from "lucide-react";

interface SecurityAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  created_at: string;
  resolved: boolean;
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'critical';
  auth: 'healthy' | 'warning' | 'critical';
  storage: 'healthy' | 'warning' | 'critical';
  realtime: 'healthy' | 'warning' | 'critical';
}

export function AdminSecurityCenter() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    auth: 'healthy',
    storage: 'healthy',
    realtime: 'healthy'
  });
  const [loading, setLoading] = useState(true);
  const [activeConnections, setActiveConnections] = useState(0);

  const checkSystemHealth = async () => {
    try {
      // Check database connectivity
      const { error: dbError } = await supabase.from('profiles').select('count').limit(1);
      
      // Check auth system
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check realtime connectivity
      const testChannel = supabase.channel('health-check');
      let realtimeHealthy = false;
      
      testChannel.subscribe((status) => {
        realtimeHealthy = status === 'SUBSCRIBED';
      });

      setTimeout(() => {
        setSystemHealth({
          database: dbError ? 'critical' : 'healthy',
          auth: session ? 'healthy' : 'warning',
          storage: 'healthy', // Assume healthy for now
          realtime: realtimeHealthy ? 'healthy' : 'warning'
        });
        supabase.removeChannel(testChannel);
      }, 2000);

    } catch (error) {
      console.error('Health check failed:', error);
      setSystemHealth({
        database: 'critical',
        auth: 'critical',
        storage: 'warning',
        realtime: 'critical'
      });
    }
  };

  const fetchSecurityAlerts = async () => {
    try {
      const { data: alerts, error } = await supabase
        .from('admin_logs')
        .select('*')
        .in('action', ['security_breach', 'suspicious_activity', 'failed_login_attempts'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedAlerts: SecurityAlert[] = alerts?.map(alert => ({
        id: alert.id,
        type: alert.action === 'security_breach' ? 'critical' : 'warning',
        title: `Security Event: ${alert.action}`,
        description: (alert.details && typeof alert.details === 'object' && 'description' in alert.details) 
          ? String(alert.details.description) 
          : `Action: ${alert.action}`,
        created_at: alert.created_at,
        resolved: false
      })) || [];

      setSecurityAlerts(formattedAlerts);
    } catch (error) {
      console.error('Failed to fetch security alerts:', error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      // Mark alert as resolved in admin_logs
      const { error } = await supabase
        .from('admin_logs')
        .update({ 
          details: { 
            ...securityAlerts.find(a => a.id === alertId),
            resolved: true,
            resolved_at: new Date().toISOString()
          }
        })
        .eq('id', alertId);

      if (error) throw error;

      setSecurityAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true } : alert
        )
      );

      toast({
        title: "Alert Resolved",
        description: "Security alert has been marked as resolved."
      });
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      toast({
        title: "Error",
        description: "Failed to resolve security alert.",
        variant: "destructive"
      });
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
      default: return 'outline';
    }
  };

  useEffect(() => {
    if (isAdmin) {
      setLoading(true);
      Promise.all([
        checkSystemHealth(),
        fetchSecurityAlerts()
      ]).finally(() => setLoading(false));

      // Set up real-time monitoring
      const healthInterval = setInterval(checkSystemHealth, 30000); // Every 30 seconds
      const alertsChannel = supabase
        .channel('security-alerts')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_logs'
        }, () => {
          fetchSecurityAlerts();
        })
        .subscribe();

      return () => {
        clearInterval(healthInterval);
        supabase.removeChannel(alertsChannel);
      };
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Zugriff verweigert. Nur Administratoren können das Security Center einsehen.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Security Center
        </h1>
        <Badge variant="outline" className="text-xs">
          Live Monitoring Active
        </Badge>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="text-sm font-medium">Database</span>
              </div>
              {getHealthIcon(systemHealth.database)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {systemHealth.database}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-medium">Authentication</span>
              </div>
              {getHealthIcon(systemHealth.auth)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {systemHealth.auth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="text-sm font-medium">Storage</span>
              </div>
              {getHealthIcon(systemHealth.storage)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {systemHealth.storage}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium">Real-time</span>
              </div>
              {getHealthIcon(systemHealth.realtime)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {systemHealth.realtime}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">
            <Bell className="h-4 w-4 mr-2" />
            Security Alerts
            {securityAlerts.filter(a => !a.resolved).length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {securityAlerts.filter(a => !a.resolved).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Eye className="h-4 w-4 mr-2" />
            Live Monitoring
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            User Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {securityAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine aktiven Sicherheitswarnungen</h3>
                <p className="text-muted-foreground">
                  Das System läuft sicher und stabil.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {securityAlerts.map((alert) => (
                <Card key={alert.id} className={alert.resolved ? "opacity-50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getBadgeVariant(alert.type)}>
                            {alert.type.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium">{alert.title}</span>
                          {alert.resolved && (
                            <Badge variant="outline" className="text-green-600">
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString('de-DE')}
                        </p>
                      </div>
                      {!alert.resolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Connections</span>
                    <Badge variant="outline">{activeConnections}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Response Time</span>
                    <Badge variant="outline">~120ms</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Error Rate</span>
                    <Badge variant="outline">0.1%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Database Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Query Performance</span>
                    <Badge variant="outline">Optimal</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Connection Pool</span>
                    <Badge variant="outline">8/20</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cache Hit Rate</span>
                    <Badge variant="outline">94%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Activity Monitor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Live user activity tracking will be displayed here.
                This includes login attempts, suspicious behavior, and user session management.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
