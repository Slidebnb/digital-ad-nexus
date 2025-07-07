import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const mockData = [
  { symbol: 'BTC', name: 'Bitcoin', price: 42150.50, change24h: 2.3 },
  { symbol: 'ETH', name: 'Ethereum', price: 2580.75, change24h: -1.2 },
  { symbol: 'SOL', name: 'Solana', price: 98.45, change24h: 5.7 },
];

export function MarketTrendsWidget() {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Markt-Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockData.map((coin) => {
            const ChangeIcon = coin.change24h >= 0 ? TrendingUp : TrendingDown;
            const changeColor = coin.change24h >= 0 ? 'text-green-600' : 'text-red-600';
            
            return (
              <div key={coin.symbol} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{coin.symbol}</span>
                  </div>
                  <span className="font-medium text-sm">{coin.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{formatPrice(coin.price)}</p>
                  <div className="flex items-center gap-1">
                    <ChangeIcon className={`h-3 w-3 ${changeColor}`} />
                    <span className={`text-xs ${changeColor}`}>
                      {coin.change24h > 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}