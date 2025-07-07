import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, Volume2 } from "lucide-react";
import { useMarketData } from "@/hooks/useMarketData";

export function MarketTrendsWidget() {
  const { marketData, loading, getLatestPrices, getTrendingCoins } = useMarketData();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Markttrends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const trendingCoins = getTrendingCoins();
  const latestPrices = getLatestPrices();

  if (latestPrices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Markttrends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Keine Marktdaten verfügbar.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Marktdaten werden automatisch aktualisiert, sobald Handel stattfindet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Trending */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Handelsvolumen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trendingCoins.slice(0, 5).map((coin, index) => (
              <div key={coin.coin} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="font-semibold">{coin.coin}</div>
                    <div className="text-sm text-muted-foreground">
                      {coin.trade_count} Trades heute
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold">
                    {Number(coin.avg_price_eur).toLocaleString('de-DE')}€
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Volume2 className="h-3 w-3" />
                    {Number(coin.total_volume).toLocaleString('de-DE')}€
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Coins Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Aktuelle Marktpreise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestPrices.map((coin) => {
              // Simulate price change (in real app, calculate from historical data)
              const mockChange = (Math.random() - 0.5) * 10;
              const isPositive = mockChange > 0;
              
              return (
                <div key={coin.coin} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg">{coin.coin}</span>
                    <Badge variant={isPositive ? "default" : "destructive"}>
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(mockChange).toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Preis:</span>
                      <span className="font-bold">
                        {Number(coin.avg_price_eur).toLocaleString('de-DE')}€
                      </span>
                    </div>
                    
                    {coin.min_price && coin.max_price && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Spanne:</span>
                        <span className="text-sm">
                          {Number(coin.min_price).toLocaleString('de-DE')}€ - {Number(coin.max_price).toLocaleString('de-DE')}€
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Volumen:</span>
                      <span className="text-sm">
                        {Number(coin.total_volume).toLocaleString('de-DE')}€
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Trades:</span>
                      <span className="text-sm">{coin.trade_count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}