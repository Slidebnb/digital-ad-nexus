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
      const today = new Date().toISOString().split('T')[0];
      const monthStart = new Date();
      monthStart.setDate(1);

      // Parallel requests for better performance
      const [
        totalUsersResult,
        activeUsersResult,
        newUsersResult,
        adsResult,
        reportsResult,
        tradesResult,
        verificationsResult,
        conversationsResult
      ] = await Promise.all([
        // Total users - get from users table for accurate count
        supabase.from('users').select('*', { count: 'exact', head: true }),
        
        // Active users (last 24h) - use users table
        supabase.from('users')
          .select('*', { count: 'exact', head: true })
          .gte('last_active', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        
        // New users today - use users table
        supabase.from('users')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today),
        
        // Ads statistics
        supabase.from('ads').select('status, featured', { count: 'exact' }),
        
        // Reports
        supabase.from('reports').select('status', { count: 'exact' }),
        
        // Trades with volume
        supabase.from('trades').select('status, price_eur, created_at'),
        
        // Verifications
        supabase.from('verification_requests').select('status', { count: 'exact' }),
        
        // Conversations
        supabase.from('conversations').select('last_message_at', { count: 'exact' })
      ]);

      // Process ads data
      const adsData = adsResult.data || [];
      const activeAds = adsData.filter(ad => ad.status === 'active').length;
      const featuredAds = adsData.filter(ad => ad.featured).length;

      // Process reports data
      const reportsData = reportsResult.data || [];
      const pendingReports = reportsData.filter(report => report.status === 'pending').length;

      // Process trades data
      const tradesData = tradesResult.data || [];
      const completedTrades = tradesData.filter(trade => trade.status === 'completed').length;
      const monthlyTrades = tradesData.filter(trade => 
        new Date(trade.created_at) >= monthStart && trade.status === 'completed'
      );
      
      const platformVolume = tradesData
        .filter(trade => trade.status === 'completed')
        .reduce((sum, trade) => sum + (trade.price_eur || 0), 0);
      
      const monthlyVolume = monthlyTrades
        .reduce((sum, trade) => sum + (trade.price_eur || 0), 0);

      // Process verifications
      const verificationsData = verificationsResult.data || [];
      const pendingVerifications = verificationsData.filter(req => req.status === 'pending').length;

      // Process conversations
      const conversationsData = conversationsResult.data || [];
      const activeConversations = conversationsData.filter(conv => 
        new Date(conv.last_message_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;

      setStats({
        totalUsers: totalUsersResult.count || 0,
        activeUsers: activeUsersResult.count || 0,
        newUsersToday: newUsersResult.count || 0,
        activeAds,
        totalAds: adsData.length,
        featuredAds,
        pendingReports,
        totalReports: reportsData.length,
        totalTrades: tradesData.length,
        completedTrades,
        platformVolume,
        monthlyVolume,
        verifiedUsers: totalUsersResult.data?.filter(user => user.verified).length || 0,
        pendingVerifications,
        totalConversations: conversationsData.length,
        activeConversations,
        serverLoad: Math.random() * 100, // Mock data - would come from server monitoring
        databaseConnections: Math.floor(Math.random() * 50) + 10,
        avgResponseTime: Math.floor(Math.random() * 200) + 50,
        errorRate: Math.random() * 2
      });

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

    // Set up real-time subscriptions
    const channel = supabase
      .channel('admin-stats')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, () => {
        fetchStats();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'ads' 
      }, () => {
        fetchStats();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'reports' 
      }, () => {
        fetchStats();
      })
      .subscribe();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

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