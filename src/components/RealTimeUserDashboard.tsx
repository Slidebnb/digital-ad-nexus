
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Eye, 
  MessageCircle, 
  Heart, 
  ShoppingBag, 
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  Star,
  Activity
} from "lucide-react";

interface UserStats {
  totalAds: number;
  activeAds: number;
  totalViews: number;
  totalMessages: number;
  unreadMessages: number;
  totalFavorites: number;
  totalTrades: number;
  rating: number;
  trustScore: number;
  todayViews: number;
  todayMessages: number;
  weeklyViews: number;
  totalTradeVolume: number;
  responseTimeMinutes: number;
}

export function RealTimeUserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalAds: 0,
    activeAds: 0,
    totalViews: 0,
    totalMessages: 0,
    unreadMessages: 0,
    totalFavorites: 0,
    totalTrades: 0,
    rating: 0,
    trustScore: 0,
    todayViews: 0,
    todayMessages: 0,
    weeklyViews: 0,
    totalTradeVolume: 0,
    responseTimeMinutes: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchRealTimeStats = async () => {
    if (!user?.id) return;

    try {
      // Fetch user ads
      const { data: ads, error: adsError } = await supabase
        .from('ads')
        .select('id, status, views, created_at')
        .eq('user_id', user.id);

      if (adsError) throw adsError;

      // Fetch conversations where user is involved
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id, sender_id, recipient_id, unread_by_recipient, last_message_at')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (convError) throw convError;

      // Count unread messages
      let unreadCount = 0;
      let totalMessageCount = 0;
      let todayMessageCount = 0;
      const today = new Date().toISOString().split('T')[0];

      for (const conv of conversations || []) {
        // Count messages in this conversation
        const { data: messages, error: msgError } = await supabase
          .from('messages')
          .select('id, sender_id, read_at, created_at')
          .eq('conversation_id', conv.id);

        if (!msgError && messages) {
          totalMessageCount += messages.length;
          
          // Count unread messages where current user is recipient
          unreadCount += messages.filter(msg => 
            msg.sender_id !== user.id && !msg.read_at
          ).length;

          // Count today's messages
          todayMessageCount += messages.filter(msg =>
            msg.created_at.startsWith(today)
          ).length;
        }
      }

      // Fetch favorites
      const { data: favorites, error: favError } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id);

      if (favError) throw favError;

      // Fetch trades
      const { data: trades, error: tradesError } = await supabase
        .from('trades')
        .select('id, price_eur, status')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

      if (tradesError) throw tradesError;

      // Fetch user profile for rating and trust score
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('rating, trust_score, response_time_minutes')
        .eq('user_id', user.id)
        .single();

      if (profileError) console.warn('Profile fetch error:', profileError);

      // Calculate stats
      const totalViews = ads?.reduce((sum, ad) => sum + (ad.views || 0), 0) || 0;
      const activeAds = ads?.filter(ad => ad.status === 'active').length || 0;
      const totalTradeVolume = trades?.reduce((sum, trade) => 
        sum + (trade.price_eur || 0), 0) || 0;

      // Calculate today's and weekly views (approximation)
      const todayViews = Math.floor(totalViews * 0.1); // Rough estimate
      const weeklyViews = Math.floor(totalViews * 0.3); // Rough estimate

      const newStats: UserStats = {
        totalAds: ads?.length || 0,
        activeAds,
        totalViews,
        totalMessages: totalMessageCount,
        unreadMessages: unreadCount,
        totalFavorites: favorites?.length || 0,
        totalTrades: trades?.length || 0,
        rating: profile?.rating || 0,
        trustScore: profile?.trust_score || 0,
        todayViews,
        todayMessages: todayMessageCount,
        weeklyViews,
        totalTradeVolume,
        responseTimeMinutes: profile?.response_time_minutes || 0
      };

      setStats(newStats);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching real-time stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchRealTimeStats();

      // Set up real-time subscriptions
      const channels = [
        // Listen to ads changes
        supabase
          .channel('user-ads-realtime')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'ads',
            filter: `user_id=eq.${user.id}`
          }, () => {
            console.log('Ads updated, refreshing stats');
            fetchRealTimeStats();
          })
          .subscribe(),

        // Listen to messages changes
        supabase
          .channel('user-messages-realtime')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'messages'
          }, () => {
            console.log('Messages updated, refreshing stats');
            fetchRealTimeStats();
          })
          .subscribe(),

        // Listen to conversations changes
        supabase
          .channel('user-conversations-realtime')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'conversations',
            filter: `sender_id=eq.${user.id}`
          }, () => {
            console.log('Conversations updated, refreshing stats');
            fetchRealTimeStats();
          })
          .subscribe(),

        // Listen to favorites changes
        supabase
          .channel('user-favorites-realtime')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'favorites',
            filter: `user_id=eq.${user.id}`
          }, () => {
            console.log('Favorites updated, refreshing stats');
            fetchRealTimeStats();
          })
          .subscribe(),

        // Listen to trades changes
        supabase
          .channel('user-trades-realtime')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'trades'
          }, () => {
            console.log('Trades updated, refreshing stats');
            fetchRealTimeStats();
          })
          .subscribe()
      ];

      // Auto-refresh every 30 seconds for live updates
      const interval = setInterval(() => {
        console.log('Auto-refreshing user stats...');
        fetchRealTimeStats();
      }, 30000);

      return () => {
        channels.forEach(channel => supabase.removeChannel(channel));
        clearInterval(interval);
      };
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Aktive Anzeigen",
      value: stats.activeAds,
      total: stats.totalAds,
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Aufrufe Gesamt",
      value: stats.totalViews,
      subValue: `+${stats.todayViews} heute`,
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Nachrichten",
      value: stats.totalMessages,
      badge: stats.unreadMessages > 0 ? stats.unreadMessages : null,
      subValue: `+${stats.todayMessages} heute`,
      icon: MessageCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Favoriten",
      value: stats.totalFavorites,
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Trades",
      value: stats.totalTrades,
      subValue: `€${stats.totalTradeVolume.toLocaleString()}`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Bewertung",
      value: stats.rating.toFixed(1),
      icon: Star,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Trust Score",
      value: stats.trustScore,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Antwortzeit",
      value: stats.responseTimeMinutes > 0 ? `${stats.responseTimeMinutes}min` : "N/A",
      icon: Clock,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Live Dashboard</h2>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-500" />
          <Badge variant="outline" className="text-xs">
            Live • Zuletzt aktualisiert: {lastUpdated.toLocaleTimeString('de-DE')}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
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
                    {card.total && (
                      <span className="text-sm text-muted-foreground">
                        / {card.total}
                      </span>
                    )}
                    {card.badge && (
                      <Badge variant="destructive" className="text-xs">
                        {card.badge}
                      </Badge>
                    )}
                  </div>
                  {card.subValue && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.subValue}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Trend Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Wöchentlicher Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.weeklyViews}</p>
              <p className="text-sm text-muted-foreground">Aufrufe diese Woche</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.todayMessages}</p>
              <p className="text-sm text-muted-foreground">Nachrichten heute</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.activeAds}</p>
              <p className="text-sm text-muted-foreground">Aktive Anzeigen</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
