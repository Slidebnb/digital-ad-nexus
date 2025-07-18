import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, Zap, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function CryptoFeesWidget() {
  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/10 dark:border-blue-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <TrendingDown className="h-4 w-4 text-blue-600" />
          Niedrige Gebühren
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-yellow-500" />
              <span className="text-xs">Bitcoin (BTC)</span>
            </div>
            <Badge variant="secondary" className="text-xs">0.5%</Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-purple-500" />
              <span className="text-xs">Ethereum (ETH)</span>
            </div>
            <Badge variant="secondary" className="text-xs">0.3%</Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-green-500" />
              <span className="text-xs">Solana (SOL)</span>
            </div>
            <Badge variant="secondary" className="text-xs">0.2%</Badge>
          </div>
        </div>
        
        <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-200">
          <strong>Kostenlos:</strong> Anmeldung, Suchen, Chatten
        </div>
      </CardContent>
    </Card>
  );
}