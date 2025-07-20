
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

interface AdminRealTimeMetrics {
  // User Metrics
  totalUsers: number;
  verifiedUsers: number;
  activeUsers: number;
  newUsersToday: number;
  
  // Content Metrics
  activeAds: number;
  totalAds: number;
  boostedAds: number;
  
  // Moderation Metrics
  pendingReports: number;
  totalReports: number;
  pendingVerifications: number;
  
  // Trading Metrics
  totalTrades: number;
  completedTrades: number;
  platformVolume: number;
  monthlyVolume: number;
  
  // Communication Metrics
  totalConversations: number;
  activeConversations: number;
  
  // System Metrics
  serverLoad: number;
  databaseConnections: number;
  avgResponseTime: number;
  errorRate: number;
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'critical';
  storage: 'healthy' | 'warning' | 'critical';
  api: 'healthy' | 'warning' | 'critical';
  auth: 'healthy' | 'warning' | 'critical';
  overall: number;
  lastChecked: Date;
}

interface AdminAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export const useAdminRealTimeMetrics = () => {
  const { isAdmin } = useAuth();
  const [metrics, setMetrics] = useState<AdminRealTimeMetrics>({
    totalUsers: 0,
    verifiedUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    activeAds: 0,
    totalAds: 0,
    boostedAds: 0,
    pendingReports: 0,
    totalReports: 0,
    pendingVerifications: 0,
    totalTrades: 0,
    completedTrades: 0,
    platformVolume: 0,
    monthlyVolume: 0,
    totalConversations: 0,
    activeConversations: 0,
    serverLoad: 0,
    databaseConnections: 0,
    avgResponseTime: 120,
    errorRate: 0.1
  });

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    storage: 'healthy',
    api: 'healthy',
    auth: 'healthy',
    overall: 95,
    lastChecked: new Date()
  });

  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRealTimeMetrics = async () => {
    if (!isAdmin) return;

    const startTime = Date.now();
    
    try {
      setError(null);
      
      // Use optimized function for real-time metrics
      const { data: metricsData, error: metricsError } = await supabase
        .rpc('get_real_time_admin_metrics');

      if (metricsError) throw metricsError;

      if (metricsData && metricsData.length > 0) {
        const data = metricsData[0];
        
        setMetrics({
          totalUsers: data.total_users || 0,
          verifiedUsers: data.verified_users || 0,
          activeUsers: data.active_users || 0,
          newUsersToday: data.new_users_today || 0,
          activeAds: data.active_ads || 0,
          totalAds: data.total_ads || 0,
          boostedAds: data.boosted_ads || 0,
          pendingReports: data.pending_reports || 0,
          totalReports: data.total_reports || 0,
          pendingVerifications: data.pending_verifications || 0,
          totalTrades: data.total_trades || 0,
          completedTrades: data.completed_trades || 0,
          platformVolume: Number(data.platform_volume) || 0,
          monthlyVolume: Number(data.monthly_volume) || 0,
          totalConversations: data.total_conversations || 0,
          activeConversations: data.active_conversations || 0,
          serverLoad: Number(data.server_load) || 0,
          databaseConnections: data.database_connections || 0,
          avgResponseTime: data.avg_response_time || 120,
          errorRate: Number(data.error_rate) || 0
        });
      }

      // Get system health
      const { data: healthData, error: healthError } = await supabase
        .rpc('get_admin_system_health');

      if (!healthError && healthData && healthData.length > 0) {
        const health = healthData[0];
        
        setSystemHealth({
          database: health.database_status,
          storage: health.storage_status,
          api: health.api_status,
          auth: health.auth_status,
          overall: Number(health.overall_health) || 95,
          lastChecked: new Date(health.last_checked)
        });
      }

      // Generate alerts based on metrics
      const newAlerts: AdminAlert[] = [];
      
      if (metrics.pendingReports > 10) {
        newAlerts.push({
          id: `reports-${Date.now()}`,
          type: 'warning',
          title: 'Hohe Anzahl ausstehender Reports',
          message: `${metrics.pendingReports} Reports warten auf Bearbeitung`,
          timestamp: new Date(),
          resolved: false
        });
      }
      
      if (metrics.pendingVerifications > 20) {
        newAlerts.push({
          id: `verifications-${Date.now()}`,
          type: 'critical',
          title: 'Verification Backlog',
          message: `${metrics.pendingVerifications} Verifikationen ausstehend`,
          timestamp: new Date(),
          resolved: false
        });
      }
      
      if (metrics.serverLoad > 80) {
        newAlerts.push({
          id: `server-load-${Date.now()}`,
          type: 'critical',
          title: 'Hohe Serverlast',
          message: `Serverlast bei ${metrics.serverLoad.toFixed(1)}%`,
          timestamp: new Date(),
          resolved: false
        });
      }

      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev.slice(0, 15)]);
      }

      const responseTime = Date.now() - startTime;
      logger.performance('Admin metrics fetch completed', 'useAdminRealTimeMetrics', {
        responseTime,
        metricsCount: Object.keys(metrics).length,
        alertsGenerated: newAlerts.length
      });

    } catch (error) {
      logger.error('Failed to fetch admin metrics', 'useAdminRealTimeMetrics', error);
      setError('Fehler beim Laden der Admin-Metriken');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    // Initial fetch
    fetchRealTimeMetrics();

    // Real-time subscriptions for critical tables
    const channels = [
      supabase
        .channel('admin-users-realtime')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'auth', 
          table: 'users' 
        }, () => {
          logger.debug('User data changed - refreshing admin metrics');
          setTimeout(fetchRealTimeMetrics, 500);
        }),

      supabase
        .channel('admin-ads-realtime')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'ads' 
        }, () => {
          logger.debug('Ads data changed - refreshing admin metrics');
          setTimeout(fetchRealTimeMetrics, 500);
        }),

      supabase
        .channel('admin-reports-realtime')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'reports' 
        }, () => {
          logger.debug('Reports data changed - refreshing admin metrics');
          setTimeout(fetchRealTimeMetrics, 500);
        }),

      supabase
        .channel('admin-verifications-realtime')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'verification_requests' 
        }, () => {
          logger.debug('Verification data changed - refreshing admin metrics');
          setTimeout(fetchRealTimeMetrics, 500);
        })
    ];

    channels.forEach(channel => channel.subscribe());

    // Auto-refresh every 30 seconds for live data
    const interval = setInterval(() => {
      logger.debug('Auto-refreshing admin metrics');
      fetchRealTimeMetrics();
    }, 30000);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
      clearInterval(interval);
    };
  }, [isAdmin]);

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const clearAllAlerts = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, resolved: true })));
  };

  return {
    metrics,
    systemHealth,
    alerts: alerts.filter(a => !a.resolved),
    allAlerts: alerts,
    loading,
    error,
    resolveAlert,
    clearAllAlerts,
    refresh: fetchRealTimeMetrics
  };
};
