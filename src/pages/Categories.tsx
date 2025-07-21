
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { MobileOptimizedNavigation } from "@/components/MobileOptimizedNavigation";
import { Footer } from "@/components/Footer";
import { MobileBottomNavigation } from "@/components/MobileBottomNavigation";
import { supabase } from "@/integrations/supabase/client";
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <MobileOptimizedNavigation />
        
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

        <MobileBottomNavigation />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <MobileOptimizedNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Alle Kategorien
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Durchsuche alle verfügbaren Kategorien und finde genau das, was du suchst
          </p>
        </div>

        {/* Suchleiste */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Kategorien durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-full border-2 focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Ergebnisse Anzeige */}
        {searchTerm && (
          <div className="text-center mb-6">
            <p className="text-muted-foreground">
              {filteredCategories.length} Kategorie{filteredCategories.length !== 1 ? 'n' : ''} 
              {searchTerm && ` für "${searchTerm}"`} gefunden
            </p>
          </div>
        )}

        {/* Kategorien Grid */}
        {filteredCategories.length === 0 && searchTerm ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Keine Kategorien gefunden</h3>
              <p className="text-muted-foreground text-sm">
                Versuche es mit einem anderen Suchbegriff oder durchsuche alle verfügbaren Kategorien.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchTerm("")}
              >
                Alle Kategorien anzeigen
              </Button>
            </CardContent>
          </Card>
        ) : filteredCategories.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Kategorien werden eingerichtet</h3>
              <p className="text-muted-foreground text-sm">
                Die Kategorien werden gerade vorbereitet. Bitte versuche es in wenigen Minuten erneut.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              
              return (
                <Card 
                  key={category.id}
                  className="gradient-card hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-primary/50"
                  onClick={() => handleCategoryClick(category)}
                >
                  <CardHeader className="text-center pb-3">
                    <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 min-h-[60px]">
                      {category.description || `Entdecke ${category.name} Angebote und finde genau das, was du suchst.`}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs font-medium">
                        {category.count || 0} Anzeige{category.count !== 1 ? 'n' : ''}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-primary hover:text-primary/80 p-0 group-hover:translate-x-1 transition-transform"
                      >
                        Durchsuchen
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Statistiken */}
        {!searchTerm && filteredCategories.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-6 bg-card/50 backdrop-blur-sm border border-border rounded-full px-8 py-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {filteredCategories.length}
                </div>
                <div className="text-sm text-muted-foreground">Kategorien</div>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {filteredCategories.reduce((sum, cat) => sum + (cat.count || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Anzeigen</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <MobileBottomNavigation />
      <Footer />
    </div>
  );
}
