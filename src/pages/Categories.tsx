import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { 
  Coins,
  TrendingUp,
  Shield,
  Smartphone,
  Server,
  Globe,
  Zap,
  Users,
  Car,
  Home,
  Shirt,
  Wrench,
  Package
} from "lucide-react";

// Erweiterte Icon-Mapping für alle deutschen Kategorien
const CATEGORY_ICONS: Record<string, any> = {
  'elektronik': Smartphone,
  'fahrzeuge': Car,
  'immobilien': Home,
  'mode': Shirt,
  'dienstleistungen': Wrench,
  'mining-hardware': Server,
  'krypto-services': Globe,
  'bitcoin': Coins,
  'altcoins': TrendingUp,
  'stablecoins': Shield,
  'hardware': Smartphone,
  'mining': Server,
  'services': Globe,
  'defi': Zap,
  'nft': Users,
  'trading': TrendingUp,
  'wallet': Shield,
  'exchange': Users,
  'payment': Coins,
  'sonstiges': Package,
  'default': Package
};

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*, count:ads(count)')
        .eq('active', true)
        .order('sort_order');

      if (error) throw error;
      
      const categoriesWithCounts = await Promise.all(
        (data || []).map(async (category) => {
          const { count } = await supabase
            .from('ads')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('status', 'active');
          
          return {
            ...category,
            count: count || 0
          };
        })
      );
      
      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const normalizedIconName = iconName?.toLowerCase() || 'default';
    return CATEGORY_ICONS[normalizedIconName] || CATEGORY_ICONS['default'];
  };

  const handleCategoryClick = (category: any) => {
    window.location.href = `/browse?category=${category.slug}`;
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Kategorien werden geladen...</h1>
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-gradient-primary">Kategorien</span> entdecken
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Finden Sie Kryptowährungen und Services in allen verfügbaren Kategorien
            </p>
          </div>

          {/* Suchfeld */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Kategorie suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Kategorien Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => {
              const IconComponent = getIconComponent(category.icon || category.slug);
              
              return (
                <Card 
                  key={category.id} 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 bg-gradient-to-br from-background to-muted/20"
                  onClick={() => handleCategoryClick(category)}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    {category.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {category.count || 0} Anzeigen
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-xs p-2 h-8 group-hover:bg-primary/10"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Keine Ergebnisse */}
          {filteredCategories.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Keine Kategorien gefunden</h3>
              <p className="text-muted-foreground">
                Versuchen Sie es mit einem anderen Suchbegriff.
              </p>
            </div>
          )}

          {/* Statistiken */}
          {categories.length > 0 && (
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-4 text-sm text-muted-foreground bg-muted/30 px-6 py-3 rounded-full">
                <span>📊 {categories.length} Kategorien verfügbar</span>
                <span>•</span>
                <span>🎯 {categories.reduce((sum, cat) => sum + (cat.count || 0), 0)} aktive Anzeigen</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}