import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Star, Sparkles } from 'lucide-react';
import { PremiumSubscriptionModal } from './PremiumSubscriptionModal';
import { PremiumBadge } from './PremiumBadge';
import { usePremium } from '@/hooks/usePremium';

interface PremiumButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function PremiumButton({ variant = 'default', size = 'default', className = '' }: PremiumButtonProps) {
  const { isPremium, subscription, getDaysRemaining } = usePremium();
  const [modalOpen, setModalOpen] = useState(false);

  const daysLeft = getDaysRemaining();
  const isExpiringSoon = daysLeft <= 7;

  if (isPremium && subscription) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <PremiumBadge size={size === 'sm' ? 'sm' : 'md'} />
        {isExpiringSoon && (
          <Button
            variant="outline"
            size={size}
            onClick={() => setModalOpen(true)}
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Verlängern
          </Button>
        )}
        <PremiumSubscriptionModal open={modalOpen} onOpenChange={setModalOpen} />
      </div>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setModalOpen(true)}
        className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg ${className}`}
      >
        <Crown className="h-4 w-4 mr-2" />
        Premium werden
        <Sparkles className="h-4 w-4 ml-2" />
      </Button>
      <PremiumSubscriptionModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}