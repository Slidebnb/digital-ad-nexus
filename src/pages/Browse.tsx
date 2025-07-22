import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/PageLayout";
import { MobileBottomNavigation } from "@/components/MobileBottomNavigation";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, X, Heart, Eye, MapPin, Euro, Calendar, Loader2, ShoppingBag, Zap, Crown } from "lucide-react";
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

export default function BrowseFixed() {
  // Sichere URL-Parameter-Extraktion mit lazy initialization
  const [urlInitialized, setUrlInitialized] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [boostedOnly, setBoostedOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [boostedAds, setBoostedAds] = useState<Ad[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // URL-Parameter beim ersten Laden auslesen
  useEffect(() => {
    if (!urlInitialized) {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get("boosted") === "true") setBoostedOnly(true);
        if (params.get("search")) setSearch(params.get("search") || "");
        if (params.getAll("category").length > 0) setSelectedCategories(params.getAll("category"));
        if (params.getAll("location").length > 0) setSelectedLocations(params.getAll("location"));
        
        const minPrice = params.get("priceMin");
        const maxPrice = params.get("priceMax");
        if (minPrice || maxPrice) {
          setPriceRange([
            minPrice ? Number(minPrice) : 0,
            maxPrice ? Number(maxPrice) : 10000
          ]);
        }
      } catch (error) {
        console.warn('Error parsing URL parameters:', error);
      }
      setUrlInitialized(true);
    }
  }, [urlInitialized]);

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
    if (!urlInitialized || categoriesLoading) return;
    
    const fetchAds = async () => {
      setLoading(true);
      
      // Erst geboostete Anzeigen laden
      let boostedQuery = supabase
        .from('ads')
        .select('*')
        .eq('status', 'active')
        .gt('boosted_until', new Date().toISOString())
        .gte('price', priceRange[0])
        .lte('price', priceRange[1]);

      if (search) {
        boostedQuery = boostedQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
      }

      if (selectedCategories.length > 0) {
        const categoryIds = categories
          .filter(cat => selectedCategories.includes(cat.slug))
          .map(cat => cat.id);
        
        if (categoryIds.length > 0) {
          boostedQuery = boostedQuery.in('category_id', categoryIds);
        }
      }

      if (selectedLocations.length > 0) {
        boostedQuery = boostedQuery.in('location', selectedLocations);
      }

      const { data: boostedData } = await boostedQuery
        .order('featured', { ascending: false })
        .order('boosted_until', { ascending: false });

      setBoostedAds(boostedData || []);

      // Wenn nur geboostete Anzeigen angezeigt werden sollen
      if (boostedOnly) {
        setAds(boostedData || []);
        setLoading(false);
        return;
      }

      // Dann normale Anzeigen laden (ohne geboostete)
      const boostedIds = (boostedData || []).map(ad => ad.id);
      
      let query = supabase
        .from('ads')
        .select('*')
        .eq('status', 'active')
        .gte('price', priceRange[0])
        .lte('price', priceRange[1]);

      if (boostedIds.length > 0) {
        query = query.not('id', 'in', `(${boostedIds.join(',')})`);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
      }

      if (selectedCategories.length > 0) {
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

    fetchAds();
  }, [urlInitialized, search, selectedCategories, selectedLocations, priceRange, categories, categoriesLoading, boostedOnly]);

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
    setBoostedOnly(false);
    try {
      window.history.replaceState({}, '', window.location.pathname);
    } catch (error) {
      console.warn('Error updating URL:', error);
    }
  };

  const applyFilters = () => {
    try {
      const params = new URLSearchParams();
      
      if (search) params.set("search", search);
      if (priceRange[0] > 0) params.set("priceMin", String(priceRange[0]));
      if (priceRange[1] < 10000) params.set("priceMax", String(priceRange[1]));
      if (boostedOnly) params.set("boosted", "true");
      
      selectedCategories.forEach(category => params.append("category", category));
      selectedLocations.forEach(location => params.append("location", location));
      
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    } catch (error) {
      console.warn('Error updating URL:', error);
    }
  };

  const activeFiltersCount = selectedCategories.length + selectedLocations.length + 
    (search ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0) + (boostedOnly ? 1 : 0);

  const totalAds = boostedAds.length + ads.length;

  if (!urlInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Anzeigen durchsuchen
          </h1>
          <p className="text-muted-foreground">
            Finde genau das, was du suchst - aus {totalAds} verfügbaren Anzeigen
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

              {/* Boost Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Anzeigentyp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="boosted-only"
                      checked={boostedOnly}
                      onChange={(e) => setBoostedOnly(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="boosted-only" className="text-sm font-medium">
                      Nur gesponserte Anzeigen
                      <span className="text-muted-foreground ml-1">({boostedAds.length})</span>
                    </label>
                  </div>
                </CardContent>
              </Card>

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
            ) : totalAds === 0 ? (
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
                {/* Geboostete Anzeigen Sektion */}
                {boostedAds.length > 0 && !boostedOnly && (
                  <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        <Crown className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Gesponserte Anzeigen</h3>
                        <p className="text-sm text-muted-foreground">
                          {boostedAds.length} premium Anzeige{boostedAds.length !== 1 ? 'n' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {boostedAds.map((ad) => (
                        <Card key={ad.id} className="group hover:shadow-lg transition-all duration-200 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-yellow-500/5">
                          <CardContent className="p-0">
                            <div className="relative">
                              <div className="absolute top-2 left-2 z-10">
                                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Sponsored
                                </Badge>
                              </div>
                              {ad.images && ad.images.length > 0 ? (
                                <img
                                  src={ad.images[0]}
                                  alt={ad.title}
                                  className="w-full h-48 object-cover rounded-t-lg"
                                />
                              ) : (
                                <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/70 rounded-t-lg flex items-center justify-center">
                                  <ShoppingBag className="h-16 w-16 text-muted-foreground/40" />
                                </div>
                              )}
                            </div>
                            
                            <div className="p-4 space-y-3">
                              <div className="space-y-2">
                                <h3 className="font-semibold text-lg line-clamp-1">{ad.title}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-2">{ad.description}</p>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Euro className="h-4 w-4 text-primary" />
                                  <span className="font-bold text-lg text-primary">
                                    {ad.price.toLocaleString('de-DE')} {ad.currency}
                                  </span>
                                </div>
                                <Badge variant={ad.condition === 'new' ? 'default' : 'secondary'}>
                                  {ad.condition === 'new' ? 'Neu' : 'Gebraucht'}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  <span>{ad.location}</span>
                                  <Calendar className="h-4 w-4 ml-auto" />
                                  <span>{formatDistanceToNow(new Date(ad.created_at), { addSuffix: true, locale: de })}</span>
                                </div>
                                
                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      <span>{ad.view_count || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Heart className="h-3 w-3" />
                                      <span>{ad.favorite_count || 0}</span>
                                    </div>
                                  </div>
                                  
                                  <Button size="sm" variant="outline">
                                    Details
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Tags */}
                              {ad.tags && ad.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {ad.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {ad.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{ad.tags.length - 3} mehr
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reguläre Anzeigen */}
                {ads.length > 0 && (
                  <div>
                    {!boostedOnly && (
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Alle Anzeigen</h3>
                          <p className="text-sm text-muted-foreground">
                            {ads.length} Anzeige{ads.length !== 1 ? 'n' : ''}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {ads.map((ad) => (
                        <Card key={ad.id} className="group hover:shadow-lg transition-all duration-200">
                          <CardContent className="p-0">
                            <div className="relative">
                              {ad.images && ad.images.length > 0 ? (
                                <img
                                  src={ad.images[0]}
                                  alt={ad.title}
                                  className="w-full h-48 object-cover rounded-t-lg"
                                />
                              ) : (
                                <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/70 rounded-t-lg flex items-center justify-center">
                                  <ShoppingBag className="h-16 w-16 text-muted-foreground/40" />
                                </div>
                              )}
                            </div>
                            
                            <div className="p-4 space-y-3">
                              <div className="space-y-2">
                                <h3 className="font-semibold text-lg line-clamp-1">{ad.title}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-2">{ad.description}</p>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Euro className="h-4 w-4 text-primary" />
                                  <span className="font-bold text-lg text-primary">
                                    {ad.price.toLocaleString('de-DE')} {ad.currency}
                                  </span>
                                </div>
                                <Badge variant={ad.condition === 'new' ? 'default' : 'secondary'}>
                                  {ad.condition === 'new' ? 'Neu' : 'Gebraucht'}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  <span>{ad.location}</span>
                                  <Calendar className="h-4 w-4 ml-auto" />
                                  <span>{formatDistanceToNow(new Date(ad.created_at), { addSuffix: true, locale: de })}</span>
                                </div>
                                
                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      <span>{ad.view_count || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Heart className="h-3 w-3" />
                                      <span>{ad.favorite_count || 0}</span>
                                    </div>
                                  </div>
                                  
                                  <Button size="sm" variant="outline">
                                    Details
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Tags */}
                              {ad.tags && ad.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {ad.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {ad.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{ad.tags.length - 3} mehr
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}