
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";
import { 
  Coins,
  TrendingUp,
  Shield,
  Smartphone,
  Server,
  Globe,
  Zap,
  Users,
  ArrowRight,
  Package
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

// Erweiterte Icon-Mapping für alle Kategorien
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
  'mining-hardware': Server,
  'trading': TrendingUp,
  'wallet': Shield,
  'exchange': Users,
  'payment': Coins,
  'default': Package
};

export function CategoriesSection() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      logger.debug('Fetching categories', 'CategoriesSection');
      
      // Fetch all active categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (categoriesError) {
        logger.error('Categories error', 'CategoriesSection', { error: categoriesError.message });
        throw categoriesError;
      }

      logger.debug('Categories fetched', 'CategoriesSection', { count: categoriesData?.length });

      if (!categoriesData || categoriesData.length === 0) {
        logger.info('No categories found, showing empty state', 'CategoriesSection');
        setCategories([]);
        setLoading(false);
        return;
      }

      // Fetch ad counts for each category in parallel
      const categoriesWithCounts = await Promise.all(
        categoriesData.map(async (category) => {
          try {
            const { count, error: countError } = await supabase
              .from('ads')
              .select('id', { count: 'exact' })
              .eq('category_id', category.id)
              .eq('status', 'active');

            if (countError) {
              logger.warn('Count error for category', 'CategoriesSection', { 
                category: category.name, 
                error: countError.message 
              });
            }

            return {
              ...category,
              ad_count: count || 0
            };
          } catch (error) {
            logger.warn('Error counting ads for category', 'CategoriesSection', { 
              category: category.name, 
              error: (error as Error).message 
            });
            return {
              ...category,
              ad_count: 0
            };
          }
        })
      );

      logger.debug('Categories with counts', 'CategoriesSection', { categoriesCount: categoriesWithCounts.length });
      setCategories(categoriesWithCounts);
    } catch (error) {
      logger.error('Error fetching categories', 'CategoriesSection', { 
        error: (error as Error).message 
      });
      // Show empty state instead of error
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    // Set up real-time subscription for categories
    const channel = supabase
      .channel('categories-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'categories'
      }, (payload) => {
        logger.debug('Categories updated', 'CategoriesSection', payload);
        fetchCategories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getIconComponent = (iconName: string) => {
    const normalizedIconName = iconName?.toLowerCase() || 'default';
    return CATEGORY_ICONS[normalizedIconName] || CATEGORY_ICONS['default'];
  };

  const handleCategoryClick = (category: Category) => {
    navigate(`/browse?category=${category.slug}`);
  };

  const handleViewAllClick = () => {
    navigate('/categories');
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Entdecke Kategorien</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Finde die perfekte Kryptowährung für deine Bedürfnisse. 
            Von Bitcoin bis hin zu den neuesten DeFi-Tokens.
          </p>
        </div>

        {categories.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Kategorien werden geladen</h3>
              <p className="text-muted-foreground text-sm">
                Die Kategorien werden gerade eingerichtet. Bitte versuche es in wenigen Minuten erneut.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {categories.slice(0, 8).map((category) => {
                const IconComponent = getIconComponent(category.icon);
                
                return (
                  <Card 
                    key={category.id}
                    className="gradient-card hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <CardHeader className="text-center pb-3">
                      <div className="mx-auto mb-3 p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pt-0">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {category.description || `Entdecke ${category.name} Angebote`}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {category.ad_count || 0} Anzeige{category.ad_count !== 1 ? 'n' : ''}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-primary hover:text-primary/80 p-0 group-hover:translate-x-1 transition-transform"
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

            {/* View All Button */}
            <div className="text-center">
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleViewAllClick}
                className="group"
              >
                Alle Kategorien anzeigen
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
