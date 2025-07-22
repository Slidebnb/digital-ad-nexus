import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Clock, Euro } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";

export function FavoritesManager() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites, loading, getFavoriteAds } = useFavorites();
  const [favoriteAds, setFavoriteAds] = useState<any[]>([]);

  useEffect(() => {
    const loadFavoriteAds = async () => {
      const ads = await getFavoriteAds();
      setFavoriteAds(ads);
    };

    if (user && favorites.length > 0) {
      loadFavoriteAds();
    }
  }, [favorites, user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Meine Favoriten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (favoriteAds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Meine Favoriten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Sie haben noch keine Favoriten gespeichert.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Klicken Sie auf das Herz-Symbol bei Anzeigen, um sie hier zu sammeln.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Meine Favoriten ({favoriteAds.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {favoriteAds.map((ad) => (
            <div key={ad.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{ad.title}</h3>
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  <span className="font-bold text-primary">
                    {Number(ad.price).toLocaleString('de-DE')}€
                  </span>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {ad.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {ad.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{ad.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(ad.created_at).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {ad.categories?.name && (
                    <Badge variant="secondary">{ad.categories.name}</Badge>
                  )}
                  <Badge variant="outline">Favorisiert</Badge>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Gespeichert am {new Date(ad.created_at).toLocaleDateString('de-DE')}
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate(`/ad/${ad.id}`)}
                  >
                    Anzeigen
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}