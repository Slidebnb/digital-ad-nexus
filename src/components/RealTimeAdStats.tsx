import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle,
  Calendar,
  Zap,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { UserAd } from '@/hooks/useUserData';

interface RealTimeAdStatsProps {
  ads: UserAd[];
  onBoostAd: (adId: string, packageId?: number) => Promise<boolean>;
  onDeleteAd: (adId: string) => Promise<boolean>;
  loading?: boolean;
}

export function RealTimeAdStats({ ads, onBoostAd, onDeleteAd, loading }: RealTimeAdStatsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Keine Anzeigen vorhanden</p>
          <Button className="mt-4" onClick={() => window.location.href = '/create'}>
            Erste Anzeige erstellen
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {ads.map((ad) => {
        const isBoosted = ad.boosted_until && new Date(ad.boosted_until) > new Date();
        
        return (
          <Card key={ad.id} className={`transition-all duration-300 ${isBoosted ? 'ring-2 ring-primary/30 bg-primary/5' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {ad.title}
                    {isBoosted && (
                      <Badge variant="default" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        Geboostet
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-medium text-primary">
                      €{ad.price.toLocaleString()} {ad.currency}
                    </span>
                    <Badge variant={ad.status === 'active' ? 'default' : 'secondary'}>
                      {ad.status === 'active' ? 'Aktiv' : 
                       ad.status === 'sold' ? 'Verkauft' : 
                       ad.status === 'paused' ? 'Pausiert' : ad.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onBoostAd(ad.id, 1)}>
                    <Zap className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDeleteAd(ad.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{ad.views || 0}</span>
                  <span className="text-xs text-muted-foreground">Aufrufe</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{ad.favorites || 0}</span>
                  <span className="text-xs text-muted-foreground">Favoriten</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {new Date(ad.created_at).toLocaleDateString('de-DE')}
                  </span>
                </div>
              </div>
              
              {isBoosted && (
                <div className="mt-3 p-2 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-primary font-medium">
                      Boost läuft bis: {new Date(ad.boosted_until!).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}