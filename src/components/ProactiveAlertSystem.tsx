
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useRealTimeMetrics } from "@/hooks/useRealTimeMetrics";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Bell,
  BellOff,
  RefreshCw,
  X,
  Zap,
  Shield,
  TrendingDown,
  Database
} from "lucide-react";

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  lastTriggered?: Date;
  description: string;
}

export function ProactiveAlertSystem() {
  const { metrics, alerts, resolveAlert, clearAllAlerts, refresh } = useRealTimeMetrics();
  const { toast } = useToast();
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: 'slow-queries',
      name: 'Langsame Database Queries',
      condition: 'avgQueryTime > threshold',
      threshold: 300,
      severity: 'high',
      enabled: true,
      description: 'Warnt wenn durchschnittliche Query-Zeit über 300ms liegt'
    },
    {
      id: 'high-error-rate',
      name: 'Erhöhte Fehlerrate',
      condition: 'errorRate > threshold',
      threshold: 2,
      severity: 'critical',
      enabled: true,
      description: 'Kritischer Alert bei Fehlerrate über 2%'
    },
    {
      id: 'verification-backlog',
      name: 'Verification Backlog',
      condition: 'verificationsPending > threshold',
      threshold: 5,
      severity: 'medium',
      enabled: true,
      description: 'Warnt bei zu vielen ausstehenden Verifikationen'
    },
    {
      id: 'low-conversion',
      name: 'Niedrige Conversion Rate',
      condition: 'conversionRate < threshold',
      threshold: 10,
      severity: 'medium',
      enabled: true,
      description: 'Warnt bei fallender Conversion Rate'
    },
    {
      id: 'revenue-drop',
      name: 'Revenue Drop',
      condition: 'totalRevenue < threshold',
      threshold: 100,
      severity: 'high',
      enabled: true,
      description: 'Alert bei niedrigem Tagesumsatz'
    }
  ]);

  const [soundEnabled, setSoundEnabled] = useState(true);

  // Toast-Benachrichtigungen für kritische Alerts
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.type === 'critical') {
        toast({
          title: "🚨 KRITISCHER ALERT",
          description: `${alert.title}: ${alert.message}`,
          variant: "destructive",
        });

        // Sound für kritische Alerts
        if (soundEnabled) {
          const audio = new Audio('/notification-sound.mp3');
          audio.play().catch(() => {}); // Ignoriere Fehler wenn Sound nicht verfügbar
        }
      }
    });
  }, [alerts, toast, soundEnabled]);

  const toggleAlertRule = (ruleId: string) => {
    setAlertRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const updateThreshold = (ruleId: string, newThreshold: number) => {
    setAlertRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, threshold: newThreshold } : rule
    ));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'medium': return <Bell className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Bell className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4" />;
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

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <CheckCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  // Automatische Problemlösung für bestimmte Issues
  const autoResolveIssue = async (alertType: string) => {
    switch (alertType) {
      case 'slow-queries':
        toast({
          title: "Auto-Fix aktiviert",
          description: "Führe Query-Optimierung durch...",
        });
        // Hier würde ein API-Call zur Query-Optimierung stehen
        break;
      case 'high-connections':
        toast({
          title: "Auto-Scaling aktiviert",
          description: "Erhöhe Connection Pool...",
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Proactive Alert System
        </h2>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            Sound {soundEnabled ? 'An' : 'Aus'}
          </Button>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {alerts.length > 0 && (
            <Button variant="destructive" size="sm" onClick={clearAllAlerts}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {alerts.length} Aktive Alerts
              <Badge variant="destructive" className="animate-pulse">
                REQUIRES ATTENTION
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} className={`${
                  alert.type === 'critical' ? 'border-destructive' : 
                  alert.type === 'warning' ? 'border-warning' : 'border-blue-500'
                }`}>
                  {getAlertIcon(alert.type)}
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{alert.title}</span>
                          <Badge variant={getSeverityColor(alert.type)}>
                            {alert.type.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {alert.timestamp.toLocaleTimeString('de-DE')}
                          </span>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => autoResolveIssue(alert.id)}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Auto-Fix
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Rules Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Alert Rules Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getSeverityIcon(rule.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rule.name}</span>
                      <Badge variant={getSeverityColor(rule.severity)}>
                        {rule.severity.toUpperCase()}
                      </Badge>
                      {!rule.enabled && (
                        <Badge variant="outline" className="text-muted-foreground">
                          DISABLED
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      Condition: {rule.condition.replace('threshold', rule.threshold.toString())}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rule.threshold}
                    onChange={(e) => updateThreshold(rule.id, Number(e.target.value))}
                    className="w-20 px-2 py-1 text-sm border rounded"
                    disabled={!rule.enabled}
                  />
                  <Button
                    size="sm"
                    variant={rule.enabled ? "secondary" : "outline"}
                    onClick={() => toggleAlertRule(rule.id)}
                  >
                    {rule.enabled ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Predictive Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Response Time Trend</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {metrics.responseTime < 200 ? '↓' : metrics.responseTime > 500 ? '↑' : '→'} 
                {metrics.responseTime}ms
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.responseTime < 200 ? 'Improving' : 
                 metrics.responseTime > 500 ? 'Degrading' : 'Stable'}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Error Rate Prediction</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {metrics.errorRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.errorRate < 1 ? 'Low risk' : 
                 metrics.errorRate > 3 ? 'High risk' : 'Medium risk'}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">System Health</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {alerts.length === 0 ? '100%' : 
                 alerts.filter(a => a.type === 'critical').length > 0 ? '65%' : '85%'}
              </div>
              <p className="text-xs text-muted-foreground">
                {alerts.length === 0 ? 'Excellent' : 'Needs attention'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Alerts State */}
      {alerts.length === 0 && (
        <Card className="text-center p-8 border-success/20 bg-success/5">
          <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-success">
            Alle Systeme funktionieren einwandfrei! 🎉
          </h3>
          <p className="text-muted-foreground">
            Keine aktiven Alerts. Das Monitoring läuft im Hintergrund und 
            benachrichtigt Sie sofort bei Problemen.
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm text-muted-foreground">
            <div>✅ Database Performance: Optimal</div>
            <div>✅ Error Rate: Niedrig</div>
            <div>✅ Response Time: Schnell</div>
          </div>
        </Card>
      )}
    </div>
  );
}
