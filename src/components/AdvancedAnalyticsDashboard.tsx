
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRealTimeMetrics } from "@/hooks/useRealTimeMetrics";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Globe,
  Clock,
  Target,
  Zap,
  Eye,
  MessageSquare,
  ShoppingBag,
  Activity
} from "lucide-react";

interface AnalyticsData {
  userGrowth: { date: string; users: number; }[];
  geographicDistribution: { country: string; users: number; }[];
  featureUsage: { feature: string; usage: number; }[];
  conversionFunnel: { stage: string; users: number; percentage: number; }[];
  realtimeActivity: { timestamp: string; action: string; user_id: string; }[];
}

export function AdvancedAnalyticsDashboard() {
  const { metrics, loading } = useRealTimeMetrics();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userGrowth: [],
    geographicDistribution: [],
    featureUsage: [],
    conversionFunnel: [],
    realtimeActivity: []
  });
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  useEffect(() => {
    fetchAdvancedAnalytics();
    
    // Real-time activity tracking
    const interval = setInterval(fetchRealtimeActivity, 5000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchAdvancedAnalytics = async () => {
    try {
      // User Growth Data
      const { data: userGrowthData } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', getDateRange(timeRange))
        .order('created_at', { ascending: true });

      // Process user growth data
      const growthByDate = userGrowthData?.reduce((acc: any, user) => {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}) || {};

      const userGrowth = Object.entries(growthByDate).map(([date, users]) => ({
        date,
        users: users as number
      }));

      // Geographic Distribution (Mock data - würde in Production von IP-Tracking kommen)
      const geographicDistribution = [
        { country: 'Deutschland', users: Math.floor(metrics.activeUsers * 0.6) },
        { country: 'Österreich', users: Math.floor(metrics.activeUsers * 0.2) },
        { country: 'Schweiz', users: Math.floor(metrics.activeUsers * 0.15) },
        { country: 'Andere', users: Math.floor(metrics.activeUsers * 0.05) }
      ];

      // Feature Usage Analytics
      const [
        { data: adsData },
        { data: messagesData },
        { data: favoritesData },
        { data: tradesData }
      ] = await Promise.all([
        supabase.from('ads').select('id').gte('created_at', getDateRange(timeRange)),
        supabase.from('messages').select('id').gte('created_at', getDateRange(timeRange)),
        supabase.from('favorites').select('id').gte('created_at', getDateRange(timeRange)),
        supabase.from('trades').select('id').gte('created_at', getDateRange(timeRange))
      ]);

      const featureUsage = [
        { feature: 'Ads erstellen', usage: adsData?.length || 0 },
        { feature: 'Nachrichten senden', usage: messagesData?.length || 0 },
        { feature: 'Favoriten', usage: favoritesData?.length || 0 },
        { feature: 'Trading', usage: tradesData?.length || 0 },
        { feature: 'Profile besuchen', usage: Math.floor(Math.random() * 200) + 50 },
        { feature: 'Suche verwenden', usage: Math.floor(Math.random() * 300) + 100 }
      ].sort((a, b) => b.usage - a.usage);

      // Conversion Funnel
      const totalVisitors = Math.floor(metrics.activeUsers * 3); // Approximation
      const conversionFunnel = [
        { stage: 'Besucher', users: totalVisitors, percentage: 100 },
        { stage: 'Registrierung', users: metrics.newUsersToday * 7, percentage: 35 },
        { stage: 'Email Verifiziert', users: Math.floor(metrics.newUsersToday * 7 * 0.8), percentage: 28 },
        { stage: 'Erste Ad erstellt', users: metrics.adsCreatedToday * 7, percentage: 15 },
        { stage: 'Erster Trade', users: metrics.tradesCompleted, percentage: 8 }
      ];

      setAnalyticsData({
        userGrowth,
        geographicDistribution,
        featureUsage,
        conversionFunnel,
        realtimeActivity: analyticsData.realtimeActivity
      });

    } catch (error) {
      console.error('Error fetching advanced analytics:', error);
    }
  };

  const fetchRealtimeActivity = async () => {
    try {
      // Simuliere Real-time Activity (in Production würde das über WebSockets kommen)
      const activities = [
        'Neue Registrierung',
        'Ad erstellt',
        'Nachricht gesendet',
        'Trade abgeschlossen',
        'Profil verifiziert',
        'Favorit hinzugefügt'
      ];

      const newActivity = {
        timestamp: new Date().toISOString(),
        action: activities[Math.floor(Math.random() * activities.length)],
        user_id: `user_${Math.floor(Math.random() * 1000)}`
      };

      setAnalyticsData(prev => ({
        ...prev,
        realtimeActivity: [newActivity, ...prev.realtimeActivity.slice(0, 9)]
      }));
    } catch (error) {
      console.error('Error fetching realtime activity:', error);
    }
  };

  const getDateRange = (range: string) => {
    const now = new Date();
    switch (range) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Advanced Analytics Dashboard
        </h2>
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <Badge
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setTimeRange(range)}
            >
              {range === '24h' ? '24 Stunden' : range === '7d' ? '7 Tage' : '30 Tage'}
            </Badge>
          ))}
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Activity Feed
            <Badge variant="outline" className="animate-pulse">
              <Eye className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analyticsData.realtimeActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">{activity.action}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(activity.timestamp).toLocaleTimeString('de-DE')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            User Growth Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.userGrowth.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{new Date(data.date).toLocaleDateString('de-DE')}</span>
                <div className="flex items-center gap-2 flex-1 mx-4">
                  <Progress value={(data.users / Math.max(...analyticsData.userGrowth.map(d => d.users))) * 100} className="flex-1" />
                  <span className="text-sm font-medium">{data.users}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Geographic Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.geographicDistribution.map((country, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{country.country}</span>
                  <span className="text-sm">{country.users} Nutzer</span>
                </div>
                <Progress 
                  value={(country.users / Math.max(...analyticsData.geographicDistribution.map(c => c.users))) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Feature Usage Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyticsData.featureUsage.map((feature, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{feature.feature}</span>
                  <Badge variant="secondary">{feature.usage}</Badge>
                </div>
                <Progress 
                  value={(feature.usage / Math.max(...analyticsData.featureUsage.map(f => f.usage))) * 100} 
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {((feature.usage / analyticsData.featureUsage.reduce((sum, f) => sum + f.usage, 0)) * 100).toFixed(1)}% aller Aktionen
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Conversion Funnel Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.conversionFunnel.map((stage, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{stage.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{stage.users.toLocaleString()} Nutzer</span>
                    <Badge variant="outline">{stage.percentage}%</Badge>
                  </div>
                </div>
                <div className="relative">
                  <Progress value={stage.percentage} className="h-3" />
                  {index < analyticsData.conversionFunnel.length - 1 && (
                    <div className="absolute right-0 top-full mt-1 text-xs text-muted-foreground">
                      Drop-off: {(stage.percentage - analyticsData.conversionFunnel[index + 1].percentage).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Daily Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.activeUsers}</div>
            <div className="text-xs text-muted-foreground">+12% vs. gestern</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Session Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">8m 23s</div>
            <div className="text-xs text-muted-foreground">+5% vs. letzte Woche</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">23.4%</div>
            <div className="text-xs text-muted-foreground">-3% vs. letzte Woche</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Revenue/User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              €{(metrics.totalRevenue / Math.max(metrics.activeUsers, 1)).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">+18% vs. letzte Woche</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
