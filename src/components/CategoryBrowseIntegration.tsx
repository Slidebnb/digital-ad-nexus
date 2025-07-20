import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CategoryBrowseIntegrationProps {
  onCategoryFilter: (categorySlug: string | null) => void;
  selectedCategory: string | null;
}

export function CategoryBrowseIntegration({ 
  onCategoryFilter, 
  selectedCategory 
}: CategoryBrowseIntegrationProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const categoryFilter = searchParams.get('filter') || searchParams.get('category');
    if (categoryFilter) {
      onCategoryFilter(categoryFilter);
    }
  }, [searchParams, onCategoryFilter]);

  const clearCategoryFilter = () => {
    onCategoryFilter(null);
    setSearchParams(prev => {
      prev.delete('filter');
      prev.delete('category');
      return prev;
    });
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