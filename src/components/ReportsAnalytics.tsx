import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Download, 
  RefreshCw,
  Target,
  DollarSign,
  Activity,
  Users,
  MessageSquare,
  Eye,
  Heart,
  ShoppingBag
} from "lucide-react";

interface TradingStats {
  total_trades: number;
  total_volume_eur: number;
  successful_trades: number;
  avg_response_time_minutes: number;
  date: string;
}

interface AdStats {
  total_ads: number;
  active_ads: number;
  total_views: number;
  total_favorites: number;
  total_messages: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ReportsAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tradingStats, setTradingStats] = useState<TradingStats[]>([]);
  const [adStats, setAdStats] = useState<AdStats | null>(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [user, timeRange]);

  const fetchAnalyticsData = async () => {
    if (!user) return;

    try {
      // Trading Stats laden (letzte 30 Tage)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));

      const { data: tradingData } = await supabase
        .from('trading_stats')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (tradingData) {
        setTradingStats(tradingData);
      }

      // Ad Statistics berechnen
      const { data: ads } = await supabase
        .from('ads')
        .select('status, views, favorite_count, contact_count')
        .eq('user_id', user.id);

      if (ads) {
        const stats = {
          total_ads: ads.length,
          active_ads: ads.filter(ad => ad.status === 'active').length,
          total_views: ads.reduce((sum, ad) => sum + (ad.views || 0), 0),
          total_favorites: ads.reduce((sum, ad) => sum + (ad.favorite_count || 0), 0),
          total_messages: ads.reduce((sum, ad) => sum + (ad.contact_count || 0), 0)
        };
        setAdStats(stats);
      }

    } catch (error) {
      console.error('Fehler beim Laden der Analytics-Daten:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = (format: 'csv' | 'json') => {
    const data = {
      trading_stats: tradingStats,
      ad_stats: adStats,
      export_date: new Date().toISOString()
    };

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
      // CSV Export für Trading Stats
      const csvHeaders = 'Datum,Trades,Volumen EUR,Erfolgreiche Trades,Antwortzeit (Min)\n';
      const csvData = tradingStats.map(stat => 
        `${stat.date},${stat.total_trades},${stat.total_volume_eur},${stat.successful_trades},${stat.avg_response_time_minutes}`
      ).join('\n');
      content = csvHeaders + csvData;
      filename = `trading-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify(data, null, 2);
      filename = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Performance Metriken berechnen
  const totalVolume = tradingStats.reduce((sum, stat) => sum + stat.total_volume_eur, 0);
  const totalTrades = tradingStats.reduce((sum, stat) => sum + stat.total_trades, 0);
  const avgResponseTime = tradingStats.length > 0 
    ? tradingStats.reduce((sum, stat) => sum + stat.avg_response_time_minutes, 0) / tradingStats.length 
    : 0;
  const successRate = totalTrades > 0 
    ? (tradingStats.reduce((sum, stat) => sum + stat.successful_trades, 0) / totalTrades) * 100 
    : 0;

  // Chart Data aufbereiten
  const volumeData = tradingStats.map(stat => ({
    date: new Date(stat.date).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' }),
    volume: stat.total_volume_eur,
    trades: stat.total_trades
  }));

  const performanceData = [
    { name: 'Aktive Anzeigen', value: adStats?.active_ads || 0, color: COLORS[0] },
    { name: 'Inaktive Anzeigen', value: (adStats?.total_ads || 0) - (adStats?.active_ads || 0), color: COLORS[1] }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Berichte & Analytics</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Berichte & Analytics</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setTimeRange('7d')}>
            7 Tage
          </Button>
          <Button variant="outline" size="sm" onClick={() => setTimeRange('30d')}>
            30 Tage
          </Button>
          <Button variant="outline" size="sm" onClick={() => setTimeRange('90d')}>
            90 Tage
          </Button>
          <Button variant="outline" size="sm" onClick={fetchAnalyticsData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div className="text-sm font-medium">Handelsvolumen</div>
            </div>
            <div className="text-2xl font-bold">{totalVolume.toLocaleString('de-DE')} €</div>
            <p className="text-xs text-muted-foreground">
              Letzten {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} Tage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div className="text-sm font-medium">Trades</div>
            </div>
            <div className="text-2xl font-bold">{totalTrades}</div>
            <p className="text-xs text-muted-foreground">
              {successRate.toFixed(1)}% Erfolgsrate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              <div className="text-sm font-medium">Antwortzeit</div>
            </div>
            <div className="text-2xl font-bold">{avgResponseTime.toFixed(0)} min</div>
            <p className="text-xs text-muted-foreground">
              Durchschnittliche Reaktionszeit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-purple-500" />
              <div className="text-sm font-medium">Anzeigen</div>
            </div>
            <div className="text-2xl font-bold">{adStats?.active_ads || 0}</div>
            <p className="text-xs text-muted-foreground">
              von {adStats?.total_ads || 0} gesamt aktiv
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trading" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trading">Trading Performance</TabsTrigger>
          <TabsTrigger value="ads">Anzeigen Analytics</TabsTrigger>
          <TabsTrigger value="export">Daten Export</TabsTrigger>
        </TabsList>

        <TabsContent value="trading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Handelsvolumen Entwicklung</CardTitle>
              <CardDescription>
                Ihr Handelsvolumen über die letzten {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} Tage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      name === 'volume' ? `${value.toLocaleString('de-DE')} €` : value,
                      name === 'volume' ? 'Volumen' : 'Trades'
                    ]}
                  />
                  <Line type="monotone" dataKey="volume" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trading Aktivität</CardTitle>
              <CardDescription>
                Anzahl der Trades pro Tag
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="trades" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anzeigen Übersicht</CardTitle>
              <CardDescription>
                Verteilung Ihrer aktiven und inaktiven Anzeigen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={performanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <div className="text-sm font-medium">Aufrufe</div>
                </div>
                <div className="text-2xl font-bold">{adStats?.total_views || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Gesamt Anzeigenaufrufe
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <div className="text-sm font-medium">Favoriten</div>
                </div>
                <div className="text-2xl font-bold">{adStats?.total_favorites || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Als Favorit markiert
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                  <div className="text-sm font-medium">Nachrichten</div>
                </div>
                <div className="text-2xl font-bold">{adStats?.total_messages || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Kontaktanfragen
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Daten exportieren
              </CardTitle>
              <CardDescription>
                Exportieren Sie Ihre Analytics-Daten für externe Analysen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  Export umfasst Daten der letzten {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} Tage
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">CSV Export</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Kompatibel mit Excel und anderen Tabellenkalkulationsprogrammen
                    </p>
                    <Button onClick={() => exportData('csv')} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Als CSV herunterladen
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">JSON Export</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Strukturierte Daten für eigene Anwendungen und APIs
                    </p>
                    <Button onClick={() => exportData('json')} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Als JSON herunterladen
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Dateninhalt:</strong> Trading-Statistiken, Anzeigen-Performance, 
                  Benutzerinteraktionen und weitere Analytics-Metriken
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}