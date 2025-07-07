import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageCircle } from "lucide-react";
import { useRatings } from "@/hooks/useRatings";

interface UserRatingDisplayProps {
  userId: string;
  showReviews?: boolean;
  compact?: boolean;
}

export function UserRatingDisplay({ 
  userId, 
  showReviews = false, 
  compact = false 
}: UserRatingDisplayProps) {
  const { getUserRatingStats, getUserRatings } = useRatings();
  const [stats, setStats] = useState({ averageRating: 0, totalRatings: 0 });
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatingData();
  }, [userId]);

  const loadRatingData = async () => {
    setLoading(true);
    try {
      const ratingStats = await getUserRatingStats(userId);
      setStats(ratingStats);

      if (showReviews) {
        const userReviews = await getUserRatings(userId);
        setReviews(userReviews);
      }
    } catch (error) {
      console.error('Error loading rating data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" = "md") => {
    const starSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
    
    return Array.from({ length: 5 }, (_, index) => {
      const isFilled = index < Math.floor(rating);
      const isHalf = index < rating && index >= Math.floor(rating);
      
      return (
        <Star
          key={index}
          className={`${starSize} ${
            isFilled 
              ? "text-yellow-400 fill-current" 
              : isHalf 
              ? "text-yellow-400 fill-current opacity-50"
              : "text-muted-foreground"
          }`}
        />
      );
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-muted rounded w-24"></div>
        <div className="h-3 bg-muted rounded w-16"></div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {renderStars(stats.averageRating, "sm")}
        </div>
        <span className="text-sm text-muted-foreground">
          {stats.averageRating.toFixed(1)} ({stats.totalRatings})
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Rating Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Bewertungen</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.totalRatings > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {renderStars(stats.averageRating)}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {stats.averageRating.toFixed(1)}
                  </span>
                  {" "}von 5 Sternen
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Basierend auf {stats.totalRatings} Bewertung{stats.totalRatings !== 1 ? 'en' : ''}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Noch keine Bewertungen vorhanden
            </p>
          )}
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      {showReviews && reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Rezensionen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {renderStars(review.rating, "sm")}
                      </div>
                      <span className="text-sm font-medium">
                        {review.from_user?.full_name || 'Anonymer Nutzer'}
                      </span>
                      {review.from_user?.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verifiziert
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                  
                  {review.review_text && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {review.review_text}
                    </p>
                  )}
                  
                  {review.ad?.title && (
                    <Badge variant="outline" className="text-xs">
                      Anzeige: {review.ad.title}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}