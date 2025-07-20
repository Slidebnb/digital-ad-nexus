import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  MapPin,
  Clock,
  Heart,
  Star,
  Verified,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

// Real data from Supabase
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { FavoriteButton } from "@/components/FavoriteButton";
import { AdvancedFilters, SearchFilters } from "@/components/AdvancedFilters";

import { MobileBottomNavigation } from "@/components/MobileBottomNavigation";

type Ad = Tables<'ads'> & {
  categories?: { name: string } | null;
  profiles?: { 
    full_name: string | null; 
    rating: number | null; 
    verified: boolean | null;
    avatar_url: string | null;
  }[] | null;
};

const conditions = ["Alle", "neu", "wie neu", "sehr gut", "gut", "gebraucht"];
const sortOptions = ["Neueste", "Preis: Niedrig-Hoch", "Preis: Hoch-Niedrig", "Entfernung", "Beliebtheit"];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "Alle Kategorien");
  const [selectedCondition, setSelectedCondition] = useState("Alle");
  const [sortBy, setSortBy] = useState("Neueste");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const [filteredAds, setFilteredAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableCategories, setAvailableCategories] = useState<string[]>(["Alle Kategorien"]);
  const [advancedFilters, setAdvancedFilters] = useState<SearchFilters | null>(null);

  // Fetch ads and categories from Supabase
  useEffect(() => {
    fetchAds();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      
      const categoryNames = ["Alle Kategorien", ...(data?.map(cat => cat.name) || [])];
      setAvailableCategories(categoryNames);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          categories (name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ads:', error);
        throw error;
      }
      
      console.log('Fetched ads:', data?.length, data?.map(ad => ({ id: ad.id, title: ad.title, category: ad.category })));
      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time updates for ads
  useEffect(() => {
    const channel = supabase
      .channel('browse-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'ads' 
      }, () => {
        fetchAds();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter ads based on current filters and advanced filters
  useEffect(() => {
    let filtered = [...ads];

    // Apply advanced filters if they exist
    if (advancedFilters) {
      if (advancedFilters.searchTerm) {
        filtered = filtered.filter(ad => 
          ad.title.toLowerCase().includes(advancedFilters.searchTerm.toLowerCase()) ||
          ad.description.toLowerCase().includes(advancedFilters.searchTerm.toLowerCase()) ||
          ad.category.toLowerCase().includes(advancedFilters.searchTerm.toLowerCase())
        );
      }

      if (advancedFilters.category !== "Alle Kategorien") {
        filtered = filtered.filter(ad => 
          ad.categories?.name === advancedFilters.category || 
          ad.category === advancedFilters.category
        );
      }

      if (advancedFilters.location) {
        filtered = filtered.filter(ad => 
          ad.location?.toLowerCase().includes(advancedFilters.location.toLowerCase())
        );
      }

      if (advancedFilters.condition.length > 0) {
        filtered = filtered.filter(ad => 
          advancedFilters.condition.includes(ad.condition || '')
        );
      }

      if (advancedFilters.verifiedSellers) {
        filtered = filtered.filter(ad => ad.profiles?.[0]?.verified);
      }

      if (advancedFilters.minRating > 0) {
        filtered = filtered.filter(ad => 
          (ad.profiles?.[0]?.rating || 0) >= advancedFilters.minRating
        );
      }

      if (advancedFilters.acceptedCoins.length > 0) {
        filtered = filtered.filter(ad => 
          ad.accepted_coins.some(coin => advancedFilters.acceptedCoins.includes(coin))
        );
      }

      if (advancedFilters.featuredOnly) {
        filtered = filtered.filter(ad => ad.featured);
      }

      // Date range filter
      if (advancedFilters.dateRange !== "all") {
        const now = new Date();
        const filterDate = new Date();
        
        switch (advancedFilters.dateRange) {
          case "today":
            filterDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            filterDate.setDate(now.getDate() - 7);
            break;
          case "month":
            filterDate.setMonth(now.getMonth() - 1);
            break;
          case "3months":
            filterDate.setMonth(now.getMonth() - 3);
            break;
        }
        
        filtered = filtered.filter(ad => 
          new Date(ad.created_at || '') >= filterDate
        );
      }

      // Price range filter
      filtered = filtered.filter(ad => 
        ad.price >= advancedFilters.priceRange[0] && 
        ad.price <= advancedFilters.priceRange[1]
      );

      // Sort
      switch (advancedFilters.sortBy) {
        case "oldest":
          filtered.sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime());
          break;
        case "price_low":
          filtered.sort((a, b) => Number(a.price) - Number(b.price));
          break;
        case "price_high":
          filtered.sort((a, b) => Number(b.price) - Number(a.price));
          break;
        case "rating":
          filtered.sort((a, b) => (b.profiles?.[0]?.rating || 0) - (a.profiles?.[0]?.rating || 0));
          break;
        case "popular":
          filtered.sort((a, b) => (b.favorites || 0) - (a.favorites || 0));
          break;
        default: // newest
          filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
          break;
      }
    } else {
      // Fallback to basic filters if no advanced filters
      if (searchTerm) {
        filtered = filtered.filter(ad => 
          ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ad.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (selectedCategory !== "Alle Kategorien") {
        filtered = filtered.filter(ad => 
          ad.categories?.name === selectedCategory || 
          ad.category === selectedCategory
        );
      }

      if (selectedCondition !== "Alle") {
        filtered = filtered.filter(ad => ad.condition === selectedCondition);
      }

      filtered = filtered.filter(ad => ad.price >= priceRange[0] && ad.price <= priceRange[1]);

      // Sort
      switch (sortBy) {
        case "Preis: Niedrig-Hoch":
          filtered.sort((a, b) => Number(a.price) - Number(b.price));
          break;
        case "Preis: Hoch-Niedrig":
          filtered.sort((a, b) => Number(b.price) - Number(a.price));
          break;
        case "Beliebtheit":
          filtered.sort((a, b) => (b.favorites || 0) - (a.favorites || 0));
          break;
        default:
          break;
      }
    }

    setFilteredAds(filtered);
  }, [searchTerm, selectedCategory, selectedCondition, sortBy, priceRange, ads, advancedFilters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (selectedCategory !== "Alle Kategorien") params.set("category", selectedCategory);
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">
            <span className="text-gradient-primary">Durchsuche</span> Anzeigen
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {filteredAds.length} Anzeigen gefunden
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 md:mb-8 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Suche nach Produkten, Kategorien..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 md:h-11"
              />
            </div>
            <Button type="submit" variant="gradient" className="h-10 md:h-11 px-6">
              Suchen
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 h-10 md:h-11 px-4"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </form>

          {/* Filters */}
          <div className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 transition-all duration-300",
            showFilters ? "opacity-100 max-h-96" : "opacity-0 max-h-0 overflow-hidden"
          )}>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCondition} onValueChange={setSelectedCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Zustand" />
              </SelectTrigger>
              <SelectContent>
                {conditions.map(condition => (
                  <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sortieren" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-2 col-span-1 sm:col-span-2 lg:col-span-1">
              <label className="text-sm font-medium">Preis: €{priceRange[0]} - €{priceRange[1]}</label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={5000}
                min={0}
                step={50}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-muted"></div>
                <CardContent className="p-3 md:p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Advanced Filters */}
        <AdvancedFilters 
          onFiltersChange={setAdvancedFilters}
          availableCategories={availableCategories}
          availableLocations={[...new Set(ads.map(ad => ad.location).filter(Boolean))]}
        />

        {/* Results Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredAds.map((ad) => (
              <Card 
                key={ad.id} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer gradient-card border-border/50 hover:border-primary/20 overflow-hidden"
                onClick={() => navigate(`/ad/${ad.id}`)}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={ad.images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400"} 
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {ad.featured && (
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <div className="absolute top-3 right-3">
                    <FavoriteButton adId={ad.id} size="sm" />
                  </div>

                  {/* Condition Badge */}
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
                      {ad.condition || 'Gut'}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-3 md:p-4">
                  {/* Title */}
                  <h3 className="font-semibold text-sm md:text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {ad.title}
                  </h3>

                  {/* Price */}
                  <div className="mb-3">
                    <div className="text-xl font-bold text-primary">
                      €{Number(ad.price).toLocaleString()}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {ad.currency || 'EUR'} • {ad.categories?.name || 'Kategorie'}
                      </span>
                    </div>
                  </div>

                  {/* Location & Time */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{ad.location || 'Unbekannt'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(ad.created_at || '').toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{ad.profiles?.[0]?.full_name || 'Unbekannt'}</span>
                      {ad.profiles?.[0]?.verified && (
                        <Verified className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span>{ad.profiles?.[0]?.rating?.toFixed(1) || '—'}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                    <span>{ad.views || 0} Aufrufe</span>
                    <span>{ad.favorites || 0} Likes</span>
                  </div>
                </CardContent>
            </Card>
              ))}
          </div>
        )}

        {/* No Results */}
        {filteredAds.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Keine Anzeigen gefunden</h3>
            <p className="text-muted-foreground mb-4">
              Versuche andere Suchbegriffe oder ändere deine Filter
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setSelectedCategory("Alle Kategorien");
              setSelectedCondition("Alle");
              setPriceRange([0, 5000]);
            }}>
              Filter zurücksetzen
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredAds.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Mehr Anzeigen laden
            </Button>
          </div>
        )}
      </div>

      <Footer />
      <MobileBottomNavigation />
    </div>
  );
}
