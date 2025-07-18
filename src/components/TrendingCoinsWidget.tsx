import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Flame } from 'lucide-react';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';

export function TrendingCoinsWidget() {
  const { prices, loading } = useCryptoPrices();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Flame className="h-4 w-4 text-orange-500" />
            Trending Coins
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex justify-between items-center">
              <div className="h-3 bg-muted rounded w-12"></div>
              <div className="h-3 bg-muted rounded w-16"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const sortedPrices = Object.entries(prices)
    .sort(([,a], [,b]) => (b.change_24h || 0) - (a.change_24h || 0))
    .slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Flame className="h-4 w-4 text-orange-500" />
          Trending Coins
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedPrices.map(([symbol, data], index) => {
          const isPositive = (data.change_24h || 0) >= 0;
          const ChangeIcon = isPositive ? TrendingUp : TrendingDown;
          const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
          
          return (
            <div key={symbol} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {index + 1}
                </div>
                <span className="text-sm font-medium">{symbol}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <ChangeIcon className={`h-3 w-3 ${changeColor}`} />
                <span className={`text-xs font-medium ${changeColor}`}>
                  {data.change_24h !== null && data.change_24h !== undefined 
                    ? `${data.change_24h > 0 ? '+' : ''}${data.change_24h.toFixed(1)}%`
                    : '—'
                  }
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}