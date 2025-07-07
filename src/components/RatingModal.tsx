import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Send } from "lucide-react";
import { useRatings } from "@/hooks/useRatings";
import { cn } from "@/lib/utils";

interface RatingModalProps {
  toUserId: string;
  adId: string;
  adTitle: string;
  sellerName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RatingModal({ 
  toUserId, 
  adId, 
  adTitle, 
  sellerName, 
  onSuccess, 
  onCancel 
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const { submitRating, loading } = useRatings();

  const handleSubmit = async () => {
    if (rating === 0) return;

    const success = await submitRating(toUserId, adId, rating, reviewText);
    if (success) {
      onSuccess?.();
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={index}
          type="button"
          className={cn(
            "p-1 transition-colors rounded",
            isFilled ? "text-yellow-400" : "text-muted-foreground hover:text-yellow-300"
          )}
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          <Star 
            className={cn(
              "h-8 w-8 transition-all",
              isFilled && "fill-current"
            )} 
          />
        </button>
      );
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Verkäufer bewerten</CardTitle>
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">Bewerten Sie {sellerName}</p>
          <Badge variant="outline" className="text-xs">
            {adTitle}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Star Rating */}
        <div className="text-center">
          <p className="text-sm font-medium mb-3">Wie war Ihre Erfahrung?</p>
          <div className="flex justify-center space-x-1">
            {renderStars()}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {rating === 1 && "Sehr schlecht"}
              {rating === 2 && "Schlecht"}
              {rating === 3 && "Okay"}
              {rating === 4 && "Gut"}
              {rating === 5 && "Ausgezeichnet"}
            </p>
          )}
        </div>

        {/* Review Text */}
        <div>
          <label className="text-sm font-medium block mb-2">
            Bewertung (optional)
          </label>
          <Textarea
            placeholder="Teilen Sie Ihre Erfahrung mit anderen Nutzern..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            maxLength={500}
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {reviewText.length}/500 Zeichen
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={onCancel}
            disabled={loading}
          >
            Abbrechen
          </Button>
          <Button 
            className="flex-1" 
            onClick={handleSubmit}
            disabled={rating === 0 || loading}
          >
            {loading ? (
              "Speichert..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Bewertung abgeben
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}