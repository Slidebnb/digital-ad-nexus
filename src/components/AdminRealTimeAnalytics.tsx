
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RealTimeBusinessDashboard } from "@/components/RealTimeBusinessDashboard";
import { ProactiveAlertSystem } from "@/components/ProactiveAlertSystem";
import { AdvancedAnalyticsDashboard } from "@/components/AdvancedAnalyticsDashboard";
import { AdminRealTimeMonitor } from "@/components/AdminRealTimeMonitor";
import { useRealTimeMetrics } from "@/hooks/useRealTimeMetrics";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Bell, 
  TrendingUp, 
  Monitor,
  Activity,
  Zap
} from "lucide-react";

export function AdminRealTimeAnalytics() {
  const { alerts, loading } = useRealTimeMetrics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Activity className="h-8 w-8" />
          Real-Time Analytics Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="animate-pulse">
            <Zap className="h-3 w-3 mr-1" />
            LIVE MONITORING
          </Badge>
          {alerts.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              <Bell className="h-3 w-3 mr-1" />
              {alerts.length} ALERTS
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Business Intelligence
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alert System
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                {alerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Advanced Analytics
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            System Monitor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          <RealTimeBusinessDashboard />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <ProactiveAlertSystem />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AdvancedAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <AdminRealTimeMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
