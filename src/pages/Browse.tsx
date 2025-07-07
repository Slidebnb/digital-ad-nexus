import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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

type Ad = Tables<'ads'> & {
  categories?: { name: string } | null;
  profiles?: { 
    full_name: string | null; 
    rating: number | null; 
    verified: boolean | null;
    avatar_url: string | null;
  }[] | null;
};

const categories = [
  "Alle Kategorien", "Elektronik", "Computer", "Smartphones", "Gaming", 
  "Fahrzeuge", "Mode", "Immobilien", "Kunst"
];

const conditions = ["Alle", "Neu", "Wie neu", "Sehr gut", "Gut", "Gebraucht"];
const sortOptions = ["Neueste", "Preis: Niedrig-Hoch", "Preis: Hoch-Niedrig", "Entfernung", "Beliebtheit"];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "Alle Kategorien");
  const [selectedCondition, setSelectedCondition] = useState("Alle");
  const [sortBy, setSortBy] = useState("Neueste");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const [filteredAds, setFilteredAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch ads from Supabase
  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          categories (name),
          profiles!ads_user_id_fkey (full_name, rating, verified, avatar_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter ads based on current filters
  useEffect(() => {
    let filtered = [...ads];

    if (searchTerm) {
      filtered = filtered.filter(ad => 
        ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "Alle Kategorien") {
      filtered = filtered.filter(ad => ad.categories?.name === selectedCategory);
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

    setFilteredAds(filtered);
  }, [searchTerm, selectedCategory, selectedCondition, sortBy, priceRange, ads]);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            <span className="text-gradient-primary">Durchsuche</span> Anzeigen
          </h1>
          <p className="text-muted-foreground">
            {filteredAds.length} Anzeigen gefunden
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Suche nach Produkten, Kategorien..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="gradient">
              Suchen
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </form>

          {/* Filters */}
          <div className={cn(
            "grid grid-cols-1 md:grid-cols-4 gap-4 transition-all duration-300",
            showFilters ? "opacity-100 max-h-96" : "opacity-0 max-h-0 overflow-hidden"
          )}>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
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

            <div className="space-y-2">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-muted"></div>
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAds.map((ad) => (
              <Card key={ad.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer gradient-card border-border/50 hover:border-primary/20 overflow-hidden">
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

                <CardContent className="p-4">
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
    </div>
  );
}