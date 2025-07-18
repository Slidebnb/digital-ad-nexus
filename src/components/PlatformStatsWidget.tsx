import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Clock, Shield, Users } from 'lucide-react';

export function PlatformStatsWidget() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardContent className="p-4">
        <div className="text-center mb-3">
          <h3 className="text-sm font-bold text-primary">Live Platform Stats</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-lg font-bold text-green-600">98.7%</span>
            </div>
            <p className="text-xs text-muted-foreground">Erfolgsrate</p>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-3 w-3 text-blue-500" />
              <span className="text-lg font-bold text-blue-600">&lt;5min</span>
            </div>
            <p className="text-xs text-muted-foreground">Ø Trade-Zeit</p>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Shield className="h-3 w-3 text-purple-500" />
              <span className="text-lg font-bold text-purple-600">100%</span>
            </div>
            <p className="text-xs text-muted-foreground">Sicherheit</p>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-3 w-3 text-orange-500" />
              <span className="text-lg font-bold text-orange-600">24/7</span>
            </div>
            <p className="text-xs text-muted-foreground">Support</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}