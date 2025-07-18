import { Card, CardContent } from '@/components/ui/card';
import { Shield, Star, Clock, CheckCircle } from 'lucide-react';
import { useHomepageStats } from '@/hooks/useHomepageStats';

export function TrustSignalsWidget() {
  const { stats } = useHomepageStats();

  return (
    <Card className="border-primary/10 bg-background">
      <CardContent className="p-4">
        <div className="text-center mb-3">
          <h3 className="text-sm font-semibold text-primary">Vertrauensgarantie</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Star className="h-3 w-3 text-yellow-500" />
            <div>
              <div className="text-sm font-semibold">{stats.satisfaction}%</div>
              <div className="text-xs text-muted-foreground">Zufriedenheit</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3 text-green-500" />
            <div>
              <div className="text-sm font-semibold">100%</div>
              <div className="text-xs text-muted-foreground">Sicher</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-blue-500" />
            <div>
              <div className="text-sm font-semibold">&lt;5min</div>
              <div className="text-xs text-muted-foreground">Antwortzeit</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-primary" />
            <div>
              <div className="text-sm font-semibold">Geprüft</div>
              <div className="text-xs text-muted-foreground">Nutzer</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}