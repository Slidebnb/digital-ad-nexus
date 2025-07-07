import { Badge } from "@/components/ui/badge";
import { Shield, Star, Crown } from "lucide-react";

interface VerificationLevelBadgeProps {
  level: 'none' | 'bronze' | 'silver' | 'gold';
  verified?: boolean;
  totalTrades?: number;
  rating?: number;
  className?: string;
}

export function VerificationLevelBadge({ 
  level, 
  verified = false, 
  totalTrades = 0, 
  rating = 0,
  className 
}: VerificationLevelBadgeProps) {
  if (level === 'none' || !verified) {
    return (
      <Badge variant="outline" className={className}>
        Nicht verifiziert
      </Badge>
    );
  }

  const getBadgeContent = () => {
    switch (level) {
      case 'bronze':
        return {
          icon: <Shield className="h-3 w-3 mr-1" />,
          text: 'Bronze',
          variant: 'secondary' as const,
          description: 'Identität verifiziert'
        };
      case 'silver':
        return {
          icon: <Star className="h-3 w-3 mr-1" />,
          text: 'Silber',
          variant: 'default' as const,
          description: `${totalTrades}+ Trades abgeschlossen`
        };
      case 'gold':
        return {
          icon: <Crown className="h-3 w-3 mr-1" />,
          text: 'Gold',
          variant: 'destructive' as const,
          description: `${totalTrades}+ Trades, ${rating.toFixed(1)}⭐ Bewertung`
        };
      default:
        return {
          icon: <Shield className="h-3 w-3 mr-1" />,
          text: 'Verifiziert',
          variant: 'outline' as const,
          description: 'Verifiziert'
        };
    }
  };

  const badgeContent = getBadgeContent();

  return (
    <div className="inline-flex flex-col items-start">
      <Badge 
        variant={badgeContent.variant} 
        className={`${className} ${level === 'gold' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : ''}`}
        title={badgeContent.description}
      >
        {badgeContent.icon}
        {badgeContent.text}
      </Badge>
      {(level === 'silver' || level === 'gold') && (
        <span className="text-xs text-muted-foreground mt-1">
          {badgeContent.description}
        </span>
      )}
    </div>
  );
}