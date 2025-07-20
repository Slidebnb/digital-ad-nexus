
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  Coins,
  TrendingUp,
  Shield,
  Smartphone,
  Server,
  Globe,
  Zap,
  Users,
  ArrowRight
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  active: boolean;
  sort_order: number;
  ad_count?: number;
}

const CATEGORY_ICONS: Record<string, any> = {
  'bitcoin': Coins,
  'altcoins': TrendingUp,
  'stablecoins': Shield,
  'hardware': Smartphone,
  'mining': Server,
  'services': Globe,
  'defi': Zap,
  'nft': Users,
  'krypto-services': Globe,
  'mining-hardware': Server
};

export function CategoryDisplayFix() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategoriesWithCounts = async () => {
    try {
      // Fetch all categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Fetch ad counts for each category
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count } = await supabase
            .from('ads')
            .select('id', { count: 'exact' })
            .eq('category_id', category.id)
            .eq('status', 'active');

          return {
            ...category,
            ad_count: count || 0
          };
        })
      );

      console.log('Categories with counts:', categoriesWithCounts);
      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesWithCounts();
  }, []);

  const getIconComponent = (iconName: string) => {
    const IconComponent = CATEGORY_ICONS[iconName.toLowerCase()] || Coins;
    return IconComponent;
  };

  const handleCategoryClick = (category: Category) => {
    navigate(`/browse?category=${category.slug}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Entdecke Kategorien</h2>
        <p className="text-muted-foreground">
          Finde die perfekte Kryptowährung für deine Bedürfnisse
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => {
          const IconComponent = getIconComponent(category.icon);
          
          return (
            <Card 
              key={category.id}
              className="gradient-card hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => handleCategoryClick(category)}
            >
              <CardHeader className="text-center pb-3">
                <div className="mx-auto mb-3 p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {category.description || 'Entdecke Angebote in dieser Kategorie'}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {category.ad_count || 0} Anzeigen
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-primary hover:text-primary/80 p-0"
                  >
                    Entdecken
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-lg font-semibold mb-2">Keine Kategorien gefunden</h3>
            <p className="text-muted-foreground">
              Es wurden noch keine Kategorien erstellt.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
