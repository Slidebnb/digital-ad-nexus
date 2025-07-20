
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { LazyImage } from "@/components/ui/lazy-image";
import { SwipeActions } from "@/components/ui/swipe-actions";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { AdCardSkeleton } from "@/components/ui/skeleton-loader";
import { useOptimisticUpdate } from "@/hooks/useOptimisticUpdate";
import { useSwipeActions } from "@/components/ui/swipe-actions";
import { useInfiniteQuery } from "@tanstack/react-query";
import { 
  Heart, 
  MapPin, 
  Clock, 
  Euro,
  Star,
  Shield,
  Trash2
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location?: string;
  images?: string[];
  created_at: string;
  user: {
    id: string;
    name: string;
    verified: boolean;
    rating?: number;
  };
  category: {
    name: string;
    icon: string;
  };
  favorites_count: number;
  is_favorited: boolean;
  is_boosted: boolean;
}

interface MobileOptimizedAdListProps {
  queryKey: string[];
  fetchAds: ({ pageParam }: { pageParam: number }) => Promise<{
    data: Ad[];
    nextPage?: number;
    hasNextPage: boolean;
  }>;
  enableSwipeActions?: boolean;
  onRefresh?: () => Promise<void>;
  className?: string;
}

export function MobileOptimizedAdList({
  queryKey,
  fetchAds,
  enableSwipeActions = true,
  onRefresh,
  className
}: MobileOptimizedAdListProps) {
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    refetch
  } = useInfiniteQuery({
    queryKey,
    queryFn: fetchAds,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const ads = useMemo(() => 
    data?.pages.flatMap(page => page.data) ?? [], 
    [data]
  );

  const { createFavoriteAction, createDeleteAction } = useSwipeActions();

  // Optimistic Updates
  const { performOptimisticUpdate: toggleFavorite } = useOptimisticUpdate({
    queryKey,
    updateFn: (oldData: any) => {
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          data: page.data.map((ad: Ad) => 
            ad.id === 'current-ad-id' ? {
              ...ad,
              is_favorited: !ad.is_favorited,
              favorites_count: ad.is_favorited ? ad.favorites_count - 1 : ad.favorites_count + 1
            } : ad
          )
        }))
      };
    },
    mutationFn: async () => {
      // Favorite API call implementation
    },
    successMessage: "Favorit aktualisiert",
    errorMessage: "Fehler beim Aktualisieren der Favoriten"
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh?.();
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    
    if (diffHours < 1) return 'Vor wenigen Minuten';
    if (diffHours < 24) return `Vor ${Math.floor(diffHours)} Stunden`;
    if (diffHours < 168) return `Vor ${Math.floor(diffHours / 24)} Tagen`;
    return date.toLocaleDateString('de-DE');
  };

  const AdCard = ({ ad }: { ad: Ad }) => {
    const favoriteAction = createFavoriteAction(() => toggleFavorite());
    const deleteAction = createDeleteAction(() => {
      // Delete implementation
    });

    const cardContent = (
      <Card className={cn(
        "gradient-card hover:shadow-md transition-shadow",
        ad.is_boosted && "ring-2 ring-primary/20"
      )}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-lg">{ad.category.icon}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm line-clamp-1">{ad.title}</h3>
                {ad.is_boosted && (
                  <Badge variant="secondary" className="text-xs">Promoted</Badge>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {ad.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-primary font-bold">
                  <Euro className="h-3 w-3" />
                  <span className="text-sm">
                    {Number(ad.price).toLocaleString('de-DE')}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite();
                  }}
                >
                  <Heart 
                    className={cn(
                      "h-4 w-4",
                      ad.is_favorited && "fill-red-500 text-red-500"
                    )} 
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Images */}
          {ad.images && ad.images.length > 0 && (
            <div className="mb-3">
              <div className="grid grid-cols-3 gap-1">
                {ad.images.slice(0, 3).map((image, index) => (
                  <LazyImage
                    key={index}
                    src={image}
                    alt={`${ad.title} Bild ${index + 1}`}
                    className="aspect-square rounded"
                    priority={index === 0}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {ad.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{ad.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatTimeAgo(ad.created_at)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {ad.user.verified && (
                <Shield className="h-3 w-3 text-primary" />
              )}
              
              {ad.user.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{ad.user.rating.toFixed(1)}</span>
                </div>
              )}
              
              <Badge variant="outline" className="text-xs">
                {ad.category.name}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );

    if (enableSwipeActions) {
      return (
        <SwipeActions
          leftActions={[favoriteAction]}
          rightActions={[deleteAction]}
          className="mb-4"
        >
          <Link to={`/ad/${ad.id}`}>
            {cardContent}
          </Link>
        </SwipeActions>
      );
    }

    return (
      <Link to={`/ad/${ad.id}`} className="block mb-4">
        {cardContent}
      </Link>
    );
  };

  if (isLoading) {
    return (
      <div className={className}>
        <AdCardSkeleton count={6} />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} className={className}>
      <InfiniteScroll
        hasNextPage={hasNextPage ?? false}
        isFetching={isFetching}
        fetchNextPage={fetchNextPage}
        className="space-y-4"
      >
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </InfiniteScroll>
    </PullToRefresh>
  );
}
