import { Crown, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePremium } from '@/hooks/usePremium';

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'text' | 'icon';
  className?: string;
}

export function PremiumBadge({ size = 'md', variant = 'badge', className = '' }: PremiumBadgeProps) {
  const { isPremium, subscription, getDaysRemaining } = usePremium();

  if (!isPremium || !subscription) return null;

  const daysLeft = getDaysRemaining();
  const isVIP = subscription.plan_type.includes('12');
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {isVIP ? (
          <Crown className={`${iconSize[size]} text-yellow-500`} />
        ) : (
          <Star className={`${iconSize[size]} text-purple-500`} />
        )}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <span className={`${sizeClasses[size]} font-medium text-primary ${className}`}>
        {isVIP ? '👑 VIP' : '⭐ Premium'}
      </span>
    );
  }

  return (
    <Badge 
      className={`${sizeClasses[size]} ${
        isVIP 
          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
      } ${className}`}
    >
      <div className="flex items-center gap-1">
        {isVIP ? (
          <Crown className={iconSize[size]} />
        ) : (
          <Star className={iconSize[size]} />
        )}
        <span>{isVIP ? 'VIP' : 'Premium'}</span>
        {daysLeft <= 7 && (
          <span className="ml-1 text-xs opacity-90">
            ({daysLeft}d)
          </span>
        )}
      </div>
    </Badge>
  );
}