
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MobileOptimizedNavigation } from "@/components/MobileOptimizedNavigation";
import { Footer } from "@/components/Footer";
import { MobileBottomNavigation } from "@/components/MobileBottomNavigation";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, X, Heart, Eye, MapPin, Euro, Calendar, Loader2, ShoppingBag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  created_at: string;
  images: string[];
  view_count: number;
  favorite_count: number;
  status: string;
  category_id: string;
  user_id: string;
  currency: string;
  condition: string;
  tags: string[];
}

export default function Browse() {
  const urlParams = new URLSearchParams(window.location.search);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  const [search, setSearch] = useState(urlParams.get("search") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    urlParams.getAll("category") || []
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    urlParams.getAll("location") || []
  );
  const [priceRange, setPriceRange] = useState<number[]>([
    Number(urlParams.get("priceMin")) || 0,
    Number(urlParams.get("priceMax")) || 10000
  ]);
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Lade Kategorien
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
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
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Lade verfügbare Standorte aus der Datenbank
  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await supabase
        .from('ads')
        .select('location')
        .not('location', 'is', null)
        .eq('status', 'active');
      
      if (data) {
        const uniqueLocations = [...new Set(data.map(ad => ad.location).filter(Boolean))];
        setLocations(uniqueLocations.sort());
      }
    };

    fetchLocations();
  }, []);

  // Lade Anzeigen basierend auf Filtern
  useEffect(() => {
    const fetchAds = async () => {
      setLoading(true);
      
      let query = supabase
        .from('ads')
        .select('*')
        .eq('status', 'active')
        .gte('price', priceRange[0])
        .lte('price', priceRange[1]);

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
      }

      if (selectedCategories.length > 0) {
        // Konvertiere Category-Slugs zu IDs
        const categoryIds = categories
          .filter(cat => selectedCategories.includes(cat.slug))
          .map(cat => cat.id);
        
        if (categoryIds.length > 0) {
          query = query.in('category_id', categoryIds);
        }
      }

      if (selectedLocations.length > 0) {
        query = query.in('location', selectedLocations);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Fehler beim Laden der Anzeigen:', error);
      } else {
        setAds(data || []);
      }
      
      setLoading(false);
    };

    if (!categoriesLoading) {
      fetchAds();
    }
  }, [search, selectedCategories, selectedLocations, priceRange, categories, categoriesLoading]);

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategories(prev =>
      prev.includes(categorySlug)
        ? prev.filter(c => c !== categorySlug)
        : [...prev, categorySlug]
    );
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedLocations([]);
    setPriceRange([0, 10000]);
    window.history.replaceState({}, '', window.location.pathname);
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (search) params.set("search", search);
    if (priceRange[0] > 0) params.set("priceMin", String(priceRange[0]));
    if (priceRange[1] < 10000) params.set("priceMax", String(priceRange[1]));
    
    selectedCategories.forEach(category => params.append("category", category));
    selectedLocations.forEach(location => params.append("location", location));
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  const activeFiltersCount = selectedCategories.length + selectedLocations.length + 
    (search ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <MobileOptimizedNavigation />
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Anzeigen durchsuchen
          </h1>
          <p className="text-muted-foreground">
            Finde genau das, was du suchst - aus {ads.length} verfügbaren Anzeigen
          </p>
        </div>

        {/* Suchleiste */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Nach Anzeigen suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg rounded-full border-2 focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Filter Toggle Button (Mobile) */}
        <div className="flex justify-center mb-6 md:hidden">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <div className={`lg:col-span-1 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24 space-y-6">
              {/* Filter Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Filter</h2>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Zurücksetzen
                  </Button>
                )}
              </div>

              {/* Preis Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Preis (€)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{priceRange[0]}€</span>
                      <span>{priceRange[1]}€</span>
                    </div>
                    <Slider
                      min={0}
                      max={10000}
                      step={50}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Kategorien Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Kategorien</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`category-${category.slug}`}
                          checked={selectedCategories.includes(category.slug)}
                          onCheckedChange={() => handleCategoryChange(category.slug)}
                        />
                        <Label 
                          htmlFor={`category-${category.slug}`} 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                        >
                          {category.name}
                          <span className="text-muted-foreground ml-1">({category.count})</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Standorte Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Standorte</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {locations.map((location) => (
                      <div key={location} className="flex items-center space-x-3">
                        <Checkbox
                          id={`location-${location}`}
                          checked={selectedLocations.includes(location)}
                          onCheckedChange={() => handleLocationChange(location)}
                        />
                        <Label 
                          htmlFor={`location-${location}`} 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {location}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Filter anwenden Button */}
              <Button onClick={applyFilters} className="w-full">
                Filter anwenden
              </Button>
            </div>
          </div>

          {/* Anzeigen Liste */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Anzeigen werden geladen...</p>
                </div>
              </div>
            ) : ads.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Keine Anzeigen gefunden</h3>
                  <p className="text-muted-foreground mb-4">
                    Versuche es mit anderen Filtern oder erweitere deine Suche.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Alle Filter zurücksetzen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Ergebnisse Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {search ? `Suchergebnisse für "${search}"` : "Alle Anzeigen"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {ads.length} Anzeige{ads.length !== 1 ? 'n' : ''} gefunden
                    </p>
                  </div>
                </div>

                {/* Anzeigen Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ads.map((ad) => (
                    <div key={ad.id} onClick={() => window.location.href = `/ad/${ad.id}`}>
                      <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-primary/50">
                        <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                          {ad.images && ad.images.length > 0 ? (
                            <img
                              src={ad.images[0]}
                              alt={ad.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <ShoppingBag className="h-12 w-12" />
                            </div>
                          )}
                        </div>
                        
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                              {ad.title}
                            </h3>
                            <div className="text-right flex-shrink-0 ml-2">
                              <div className="text-xl font-bold text-primary">
                                {ad.price}€
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {ad.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {ad.location || 'Keine Angabe'}
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                {ad.view_count || 0}
                              </div>
                              <div className="flex items-center">
                                <Heart className="h-3 w-3 mr-1" />
                                {ad.favorite_count || 0}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDistanceToNow(new Date(ad.created_at), { 
                                addSuffix: true, 
                                locale: de 
                              })}
                            </div>
                            {ad.condition && (
                              <Badge variant="secondary" className="text-xs">
                                {ad.condition}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <MobileBottomNavigation />
      <Footer />
    </div>
  );
}
