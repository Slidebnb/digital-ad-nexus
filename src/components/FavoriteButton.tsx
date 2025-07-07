import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  adId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function FavoriteButton({ 
  adId, 
  className, 
  size = "md", 
  showText = false 
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(adId);

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-8 w-8";
      case "lg":
        return "h-12 w-12";
      default:
        return "h-10 w-10";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "h-3 w-3";
      case "lg":
        return "h-6 w-6";
      default:
        return "h-4 w-4";
    }
  };

  return (
    <Button
      variant={favorite ? "default" : "outline"}
      size={showText ? "sm" : "icon"}
      className={cn(
        !showText && getSizeClasses(),
        favorite && "text-red-500 border-red-500 hover:bg-red-50",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(adId);
      }}
      title={favorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
    >
      <Heart 
        className={cn(
          getIconSize(),
          favorite && "fill-current",
          showText && "mr-2"
        )} 
      />
      {showText && (favorite ? "Favorit entfernen" : "Favorit hinzufügen")}
    </Button>
  );
}