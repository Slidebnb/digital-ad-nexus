import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Clock, Shield } from 'lucide-react';
import { useHomepageStats } from '@/hooks/useHomepageStats';

export function QuickStatsWidget() {
  const { stats } = useHomepageStats();

  if (stats.loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-lg font-bold text-primary">
                {stats.totalAds}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Aktive Anzeigen</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-3 w-3 text-primary" />
              <span className="text-lg font-bold text-primary">
                {stats.activeUsers}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Aktive Nutzer</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t">
          <Clock className="h-3 w-3 text-success" />
          <span className="text-xs text-success font-medium">24/7 verfügbar</span>
        </div>
      </CardContent>
    </Card>
  );
}