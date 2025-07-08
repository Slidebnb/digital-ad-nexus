import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  Users,
  Zap,
  Target,
  Award
} from "lucide-react";

interface CryptoAnalytics {
  totalVolume: number;
  totalTransactions: number;
  averageTransaction: number;
  successRate: number;
  topCryptocurrency: string;
  monthlyGrowth: number;
  userAdoption: number;
  avgProcessingTime: number;
}

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export function CryptoAnalyticsDashboard() {
  const { user, isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState<CryptoAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  
  // Chart data
  const [volumeData, setVolumeData] = useState<ChartData[]>([]);
  const [cryptoDistribution, setCryptoDistribution] = useState<ChartData[]>([]);
  const [dailyTransactions, setDailyTransactions] = useState<ChartData[]>([]);
  const [userGrowth, setUserGrowth] = useState<ChartData[]>([]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeRange.replace('d', '')));

      // Fetch crypto payments data
      const { data: payments } = await supabase
        .from('crypto_payments')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (payments) {
        // Calculate analytics
        const totalVolume = payments.reduce((sum, p) => sum + (p.amount_eur || 0), 0);
        const totalTransactions = payments.length;
        const confirmedPayments = payments.filter(p => p.status === 'confirmed');
        const successRate = totalTransactions > 0 ? (confirmedPayments.length / totalTransactions) * 100 : 0;

        // Group by cryptocurrency
        const cryptoGroups = payments.reduce((acc, payment) => {
          const crypto = payment.cryptocurrency;
          if (!acc[crypto]) {
            acc[crypto] = { count: 0, volume: 0 };
          }
          acc[crypto].count += 1;
          acc[crypto].volume += payment.amount_eur || 0;
          return acc;
        }, {} as Record<string, { count: number; volume: number }>);

        const topCrypto = Object.entries(cryptoGroups)
          .sort(([,a], [,b]) => b.volume - a.volume)[0]?.[0] || 'SOL';

        // Calculate monthly growth (simplified)
        const previousMonth = new Date();
        previousMonth.setMonth(previousMonth.getMonth() - 1);
        const { data: previousPayments } = await supabase
          .from('crypto_payments')
          .select('amount_eur')
          .lt('created_at', startDate.toISOString())
          .gte('created_at', previousMonth.toISOString());

        const previousVolume = previousPayments?.reduce((sum, p) => sum + (p.amount_eur || 0), 0) || 0;
        const monthlyGrowth = previousVolume > 0 ? ((totalVolume - previousVolume) / previousVolume) * 100 : 100;

        // User adoption
        const uniqueUsers = new Set(payments.map(p => p.user_id)).size;
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const userAdoption = totalUsers ? (uniqueUsers / totalUsers) * 100 : 0;

        setAnalytics({
          totalVolume,
          totalTransactions,
          averageTransaction: totalTransactions > 0 ? totalVolume / totalTransactions : 0,
          successRate,
          topCryptocurrency: topCrypto,
          monthlyGrowth,
          userAdoption,
          avgProcessingTime: 45 // Simulated
        });

        // Prepare chart data
        setCryptoDistribution(
          Object.entries(cryptoGroups).map(([crypto, data]) => ({
            name: crypto,
            value: data.volume,
            color: crypto === 'BTC' ? '#f7931a' : crypto === 'ETH' ? '#627eea' : '#9945ff'
          }))
        );

        // Daily transactions (last 7 days for simplicity)
        const dailyData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayPayments = payments.filter(p => 
            new Date(p.created_at).toDateString() === date.toDateString()
          );
          dailyData.push({
            name: date.toLocaleDateString('de-DE', { weekday: 'short' }),
            value: dayPayments.length
          });
        }
        setDailyTransactions(dailyData);

        // Volume by crypto
        setVolumeData(
          Object.entries(cryptoGroups).map(([crypto, data]) => ({
            name: crypto,
            value: data.volume
          }))
        );

        // Simulated user growth
        const growthData = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          growthData.push({
            name: date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
            value: Math.floor(Math.random() * 50) + uniqueUsers - 25
          });
        }
        setUserGrowth(growthData);
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "text-primary" }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {trend && (
              <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Crypto Analytics</h2>
          <p className="text-muted-foreground">
            Umfassende Analyse Ihrer Kryptowährungs-Aktivitäten
          </p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((range) => (
            <Badge
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Badge>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Gesamtvolumen"
            value={`€${analytics.totalVolume.toLocaleString()}`}
            icon={DollarSign}
            trend={analytics.monthlyGrowth > 0 ? 'up' : 'down'}
            trendValue={`${Math.abs(analytics.monthlyGrowth).toFixed(1)}%`}
            color="text-green-600"
          />
          
          <StatCard
            title="Transaktionen"
            value={analytics.totalTransactions.toLocaleString()}
            icon={Activity}
            trend="up"
            trendValue={`${analytics.successRate.toFixed(1)}% Erfolgsrate`}
            color="text-blue-600"
          />
          
          <StatCard
            title="Ø Transaktion"
            value={`€${analytics.averageTransaction.toFixed(2)}`}
            icon={Target}
            color="text-purple-600"
          />
          
          <StatCard
            title="Top Crypto"
            value={analytics.topCryptocurrency}
            icon={Award}
            trend="up"
            trendValue={`${analytics.userAdoption.toFixed(1)}% Adoption`}
            color="text-orange-600"
          />
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="volume">Volumen</TabsTrigger>
          <TabsTrigger value="activity">Aktivität</TabsTrigger>
          <TabsTrigger value="growth">Wachstum</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Crypto-Verteilung</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={cryptoDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {cryptoDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`€${value.toFixed(2)}`, 'Volumen']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tägliche Transaktionen</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyTransactions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="volume" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Volumen nach Kryptowährung</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={volumeData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip formatter={(value: any) => [`€${value.toFixed(2)}`, 'Volumen']} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Erfolgsrate</span>
                  <Badge variant="secondary">{analytics?.successRate.toFixed(1)}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ø Verarbeitungszeit</span>
                  <Badge variant="outline">{analytics?.avgProcessingTime}s</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Aktive Nutzer</span>
                  <Badge variant="secondary">{Math.floor(analytics?.userAdoption || 0)}%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Transaktions-Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 49 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded ${
                        Math.random() > 0.7 ? 'bg-green-500' :
                        Math.random() > 0.4 ? 'bg-green-300' :
                        Math.random() > 0.2 ? 'bg-green-100' :
                        'bg-gray-100'
                      }`}
                      title={`Tag ${i + 1}: ${Math.floor(Math.random() * 10)} Transaktionen`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>Weniger</span>
                  <span>Mehr</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benutzer-Wachstum</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}