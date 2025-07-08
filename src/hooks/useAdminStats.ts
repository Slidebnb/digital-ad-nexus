import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  activeAds: number;
  totalAds: number;
  featuredAds: number;
  pendingReports: number;
  totalReports: number;
  totalTrades: number;
  completedTrades: number;
  platformVolume: number;
  monthlyVolume: number;
  verifiedUsers: number;
  pendingVerifications: number;
  totalConversations: number;
  activeConversations: number;
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
}

export const useAdminStats = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    activeAds: 0,
    totalAds: 0,
    featuredAds: 0,
    pendingReports: 0,
    totalReports: 0,
    totalTrades: 0,
    completedTrades: 0,
    platformVolume: 0,
    monthlyVolume: 0,
    verifiedUsers: 0,
    pendingVerifications: 0,
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
    auth: 'healthy'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!isAdmin) return;

    try {
      setError(null);
      
      // Verwende die neue echte Admin-Statistiken Funktion
      const { data: realStats, error: statsError } = await supabase
        .rpc('get_real_admin_stats');

      if (statsError) throw statsError;

      if (realStats && realStats.length > 0) {
        const stats = realStats[0];
        
        // Berechne zusätzliche Metriken
        const today = new Date().toISOString().split('T')[0];
        const monthStart = new Date();
        monthStart.setDate(1);

        // Zusätzliche Abfragen für detailliertere Statistiken
        const [
          newUsersResult,
          activeUsersResult,
          monthlyTradesResult
        ] = await Promise.all([
          // Neue Nutzer heute - aus auth.users über get_all_users_for_admin
          supabase.rpc('get_all_users_for_admin'),
          
          // Aktive Nutzer (mit last_sign_in_at)
          supabase.rpc('get_all_users_for_admin'),
          
          // Monatliche Trades für Volumen-Berechnung
          supabase.from('trades')
            .select('price_eur, created_at')
            .gte('created_at', monthStart.toISOString())
            .eq('status', 'completed')
        ]);

        // Berechne neue Nutzer heute
        const allUsers = newUsersResult.data || [];
        const newUsersToday = allUsers.filter(user => 
          user.created_at && new Date(user.created_at).toDateString() === new Date().toDateString()
        ).length;

        // Berechne aktive Nutzer (letzten 24h)
        const activeUsers = allUsers.filter(user => 
          user.last_active && new Date(user.last_active) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length;

        // Berechne monatliches Volumen
        const monthlyVolume = (monthlyTradesResult.data || [])
          .reduce((sum, trade) => sum + (Number(trade.price_eur) || 0), 0);

        setStats({
          totalUsers: stats.total_users || 0,
          activeUsers: activeUsers,
          newUsersToday: newUsersToday,
          activeAds: stats.active_ads || 0,
          totalAds: stats.total_ads || 0,
          featuredAds: stats.boosted_ads || 0, // Featured = Boosted
          pendingReports: stats.pending_reports || 0,
          totalReports: stats.total_reports || 0,
          totalTrades: stats.total_trades || 0,
          completedTrades: stats.total_trades || 0, // Alle Trades in DB sind completed
          platformVolume: Number(stats.platform_volume) || 0,
          monthlyVolume: monthlyVolume,
          verifiedUsers: stats.verified_users || 0,
          pendingVerifications: stats.pending_verifications || 0,
          totalConversations: stats.total_conversations || 0,
          activeConversations: Math.floor((stats.total_conversations || 0) * 0.3), // 30% geschätzt aktiv
          serverLoad: Math.random() * 100, // Mock data - würde von Server-Monitoring kommen
          databaseConnections: Math.floor(Math.random() * 50) + 10,
          avgResponseTime: Math.floor(Math.random() * 200) + 50,
          errorRate: Math.random() * 2
        });
      }

      // Update system health based on stats
      setSystemHealth({
        database: stats.databaseConnections > 40 ? 'warning' : 'healthy',
        storage: 'healthy',
        api: stats.avgResponseTime > 200 ? 'warning' : 'healthy',
        auth: stats.errorRate > 1 ? 'warning' : 'healthy'
      });

    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setError('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  // Real-time updates for critical metrics
  useEffect(() => {
    if (!isAdmin) return;

    // Initial fetch
    fetchStats();

    // Set up real-time subscriptions für alle relevanten Tabellen
    const channel = supabase
      .channel('admin-stats-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, () => {
        console.log('Profiles updated - refreshing stats');
        setTimeout(fetchStats, 500);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'users' 
      }, () => {
        console.log('Users updated - refreshing stats');
        setTimeout(fetchStats, 500);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'ads' 
      }, () => {
        console.log('Ads updated - refreshing stats');
        setTimeout(fetchStats, 500);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'reports' 
      }, () => {
        console.log('Reports updated - refreshing stats');
        setTimeout(fetchStats, 500);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'trades' 
      }, () => {
        console.log('Trades updated - refreshing stats');
        setTimeout(fetchStats, 500);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'verification_requests' 
      }, () => {
        console.log('Verification requests updated - refreshing stats');
        setTimeout(fetchStats, 500);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'conversations' 
      }, () => {
        console.log('Conversations updated - refreshing stats');
        setTimeout(fetchStats, 500);
      })
      .subscribe();

    // Auto-refresh alle 60 Sekunden für Live-Daten
    const interval = setInterval(() => {
      console.log('Auto-refreshing admin stats...');
      fetchStats();
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [isAdmin]);

  return {
    stats,
    systemHealth,
    loading,
    error,
    refetch: fetchStats
  };
};