import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CategoryBrowseIntegrationProps {
  onCategoryFilter: (categorySlug: string | null) => void;
  selectedCategory: string | null;
}

// Sichere URL-Parameter-Extraktion
const getUrlParams = () => {
  try {
    return new URLSearchParams(window.location.search);
  } catch (error) {
    console.warn('Error parsing URL parameters:', error);
    return new URLSearchParams();
  }
};

export function CategoryBrowseIntegration({ 
  onCategoryFilter, 
  selectedCategory 
}: CategoryBrowseIntegrationProps) {
  useEffect(() => {
    try {
      const params = getUrlParams();
      const categoryFilter = params.get('filter') || params.get('category');
      if (categoryFilter) {
        onCategoryFilter(categoryFilter);
      }
    } catch (error) {
      console.warn('Error reading URL parameters:', error);
    }
  }, [onCategoryFilter]);

  const clearCategoryFilter = () => {
    onCategoryFilter(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('filter');
      url.searchParams.delete('category');
      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.warn('Error updating URL:', error);
    }
  };

  if (!selectedCategory) return null;

  const getCategoryDisplayName = (slug: string): string => {
    const categoryNames: Record<string, string> = {
      'mining-hardware': 'Mining & Hardware',
      'krypto-services': 'Krypto-Services',
      'trading-bots': 'Trading Bots',
      'wallets-security': 'Wallets & Security',
      'nfts-collectibles': 'NFTs & Collectibles',
      'defi-protocols': 'DeFi Protocols',
      'educational-content': 'Educational Content',
      'altcoins': 'Altcoins'
    };
    return categoryNames[slug] || slug;
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm text-muted-foreground">Gefiltert nach:</span>
      <Badge variant="secondary" className="flex items-center gap-2">
        {getCategoryDisplayName(selectedCategory)}
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 hover:bg-transparent"
          onClick={clearCategoryFilter}
        >
          <X className="h-3 w-3" />
        </Button>
      </Badge>
    </div>
  );
}