import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, Wifi, RefreshCw } from 'lucide-react';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { useManualPriceUpdate } from '@/hooks/useManualPriceUpdate';

const cryptoNames = {
  'BTC': 'Bitcoin',
  'ETH': 'Ethereum', 
  'SOL': 'Solana'
};

export function MarketTrendsWidget() {
  const { prices, loading, error } = useCryptoPrices();
  const { updatePrices, isUpdating } = useManualPriceUpdate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(price);
  };

  if (loading) {
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
            {['BTC', 'ETH', 'SOL'].map((symbol) => (
              <div key={symbol} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{symbol}</span>
                  </div>
                  <div className="w-20 h-4 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="text-right">
                  <div className="w-16 h-4 bg-muted animate-pulse rounded mb-1"></div>
                  <div className="w-12 h-3 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Markt-Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>Fehler beim Laden der Marktdaten</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Markt-Trends
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={updatePrices}
              disabled={isUpdating}
              className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isUpdating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Update</span>
            </button>
            <div className="flex items-center gap-1">
              <Wifi className="h-3 w-3 text-green-500 animate-pulse" />
              <span className="text-xs text-green-500 font-medium">LIVE</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(prices).map(([symbol, data]) => {
            const changeColor = (data.change_24h || 0) >= 0 ? 'text-green-600' : 'text-red-600';
            const ChangeIcon = (data.change_24h || 0) >= 0 ? TrendingUp : TrendingDown;
            
            return (
              <div 
                key={symbol} 
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{symbol}</span>
                  </div>
                  <span className="font-medium text-sm">{cryptoNames[symbol as keyof typeof cryptoNames]}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm transition-colors duration-500">
                    {formatPrice(data.price_eur)}
                  </p>
                  <div className="flex items-center gap-1">
                    <ChangeIcon className={`h-3 w-3 ${changeColor} transition-colors duration-500`} />
                    <span className={`text-xs ${changeColor} transition-colors duration-500`}>
                      {data.change_24h !== null && data.change_24h !== undefined 
                        ? `${data.change_24h > 0 ? '+' : ''}${data.change_24h.toFixed(2)}%`
                        : '—'
                      }
                    </span>
                  </div>
                  {data.volume_24h && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Vol: {new Intl.NumberFormat('de-DE', {
                        style: 'currency',
                        currency: 'EUR',
                        notation: 'compact'
                      }).format(data.volume_24h)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}