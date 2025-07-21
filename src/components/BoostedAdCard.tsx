
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Eye, Heart, MapPin, Calendar, Zap, Crown, Timer } from "lucide-react";

interface BoostedAd {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  created_at: string;
  images: string[];
  view_count: number;
  favorite_count: number;
  boosted_until: string;
  condition: string;
  featured: boolean;
}

interface BoostedAdCardProps {
  ad: BoostedAd;
  onClick: () => void;
}

export function BoostedAdCard({ ad, onClick }: BoostedAdCardProps) {
  const isVIP = ad.featured;
  const daysLeft = Math.ceil((new Date(ad.boosted_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="relative group" onClick={onClick}>
      <Card className={`h-full cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] ${
        isVIP 
          ? 'border-2 border-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 shadow-lg' 
          : 'border-2 border-primary bg-gradient-to-br from-primary/5 via-purple-50 to-pink-50 shadow-md'
      }`}>
        {/* Premium Boost Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className={`${
            isVIP 
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
              : 'bg-gradient-to-r from-primary to-purple-600 text-white'
          } font-semibold px-3 py-1 text-xs shadow-lg`}>
            <div className="flex items-center gap-1">
              {isVIP ? (
                <>
                  <Crown className="h-3 w-3" />
                  <span>PREMIUM</span>
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3" />
                  <span>GESPONSERT</span>
                </>
              )}
            </div>
          </Badge>
        </div>

        {/* Timer Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="bg-black/80 text-white backdrop-blur-sm">
            <Timer className="h-3 w-3 mr-1" />
            {daysLeft}d
          </Badge>
        </div>

        {/* Image */}
        <div className="aspect-video bg-muted rounded-t-lg overflow-hidden relative">
          {ad.images && ad.images.length > 0 ? (
            <img
              src={ad.images[0]}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center">
                <div className="text-4xl mb-2">📦</div>
                <span className="text-sm">Kein Bild</span>
              </div>
            </div>
          )}
          
          {/* Premium Glow Effect */}
          <div className={`absolute inset-0 ${
            isVIP 
              ? 'bg-gradient-to-t from-yellow-500/20 via-transparent to-orange-500/20' 
              : 'bg-gradient-to-t from-primary/20 via-transparent to-purple-500/20'
          } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        </div>
        
        <CardContent className="p-5">
          {/* Title and Price */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-2 flex-1">
              {ad.title}
            </h3>
            <div className="text-right flex-shrink-0 ml-3">
              <div className="text-2xl font-bold text-primary">
                €{Number(ad.price).toLocaleString()}
              </div>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
            {ad.description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {ad.location || 'Keine Angabe'}
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {ad.view_count || 0}
              </div>
              <div className="flex items-center">
                <Heart className="h-3 w-3 mr-1" />
                {ad.favorite_count || 0}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(ad.created_at), { 
                addSuffix: true, 
                locale: de 
              })}
            </div>
            {ad.condition && (
              <Badge variant="outline" className="text-xs">
                {ad.condition}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
