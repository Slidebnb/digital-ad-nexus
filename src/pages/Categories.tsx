import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCategoriesWithCounts } from "@/hooks/useCategoriesWithCounts";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search,
  Smartphone, 
  Laptop, 
  Car, 
  Home, 
  Gamepad2, 
  Shirt,
  Camera,
  Music,
  Palette,
  Wrench,
  BookOpen,
  Heart,
  TrendingUp,
  ArrowRight,
  Grid3X3,
  Package,
  Cpu,
  Coins,
  ShoppingCart,
  Settings,
  HelpCircle
} from "lucide-react";

// Icon mapping for categories
const getIconForCategory = (categoryName: string) => {
  const iconMap: Record<string, any> = {
    'Elektronik': Smartphone,
    'Computer': Laptop,
    'Gaming': Gamepad2,
    'Fahrzeuge': Car,
    'Immobilien': Home,
    'Mode': Shirt,
    'Foto': Camera,
    'Musik': Music,
    'Kunst': Palette,
    'Werkzeuge': Wrench,
    'Bücher': BookOpen,
    'Sport': Heart,
    'Dienstleistungen': Settings,
    'Mining': Cpu,
    'Krypto': Coins,
    'Hardware': Cpu,
    'Services': HelpCircle,
    'Sonstiges': Package
  };
  
  // Find matching icon by partial name match
  for (const [key, icon] of Object.entries(iconMap)) {
    if (categoryName.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }
  
  return Package; // Default icon
};

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { categories, loading, refetch } = useCategoriesWithCounts();

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('categories-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'ads' 
      }, () => {
        refetch();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'categories' 
      }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const trendingCategories = categories.filter(cat => cat.trending);
  const totalAds = categories.reduce((sum, cat) => sum + cat.count, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Lade Kategorien...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient-primary">Krypto</span> Kategorien
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Entdecke über {totalAds.toLocaleString()} aktive Krypto-Anzeigen in {categories.length} verschiedenen Kategorien
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Kategorie suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                Liste
              </Button>
            </div>
          </div>
        </div>

        {/* Trending Categories */}
        {!searchTerm && trendingCategories.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Trending Kategorien</h2>
              <Badge variant="outline" className="text-primary">
                {trendingCategories.length} aktive
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingCategories.map((category) => {
                const IconComponent = getIconForCategory(category.name);
                return (
                  <Link key={category.id} to={`/browse?category=${category.name}`}>
                    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer gradient-card border-border/50 hover:border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-xl overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                            <IconComponent className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <TrendingUp className="h-2 w-2 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                              {category.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {category.count.toLocaleString()} aktive Anzeigen
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {category.description || `Krypto-Handel in der Kategorie ${category.name}`}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* All Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {searchTerm ? `Suchergebnisse (${filteredCategories.length})` : "Alle Kategorien"}
          </h2>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category) => {
                const IconComponent = getIconForCategory(category.name);
                return (
                  <Link key={category.id} to={`/browse?category=${category.name}`}>
                    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer gradient-card border-border/50 hover:border-primary/20 h-full">
                      <CardContent className="p-6 text-center">
                        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 overflow-hidden">
                          <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                          <IconComponent className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                          {category.trending && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                              <TrendingUp className="h-2 w-2 text-white" />
                            </div>
                          )}
                        </div>

                        <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {category.count.toLocaleString()} Anzeigen
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {category.description || `Krypto-Handel und Trading in ${category.name}`}
                        </p>

                        {/* Real-time indicator */}
                        <div className="flex items-center justify-center gap-1 mt-3">
                          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                          <span className="text-xs text-muted-foreground">Live</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCategories.map((category) => {
                const IconComponent = getIconForCategory(category.name);
                return (
                  <Link key={category.id} to={`/browse?category=${category.name}`}>
                    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer gradient-card border-border/50 hover:border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-6">
                          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                            <IconComponent className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                            {category.trending && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                                <TrendingUp className="h-2 w-2 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                {category.name}
                              </h3>
                              {category.trending && (
                                <Badge className="bg-success text-white text-xs">Trending</Badge>
                              )}
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                                <span className="text-xs text-muted-foreground">Live</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {category.count.toLocaleString()} aktive Anzeigen • {category.description || `Krypto-Trading Kategorie`}
                            </p>
                          </div>

                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* No Results */}
        {filteredCategories.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Keine Kategorien gefunden</h3>
            <p className="text-muted-foreground mb-4">
              Versuche andere Suchbegriffe oder durchsuche alle verfügbaren Kategorien
            </p>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Alle Kategorien anzeigen
            </Button>
          </div>
        )}

        {/* Empty state */}
        {categories.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Noch keine Kategorien</h3>
            <p className="text-muted-foreground">
              Kategorien werden automatisch erstellt, sobald Anzeigen hinzugefügt werden.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}