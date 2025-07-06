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

// Mock data - wird später durch Supabase-Daten ersetzt
const mockAds = [
  {
    id: 1,
    title: "MacBook Pro M3 16\" - Wie neu",
    price: 2499,
    currency: "EUR",
    cryptoPrices: [{ symbol: "BTC", price: 0.0578 }],
    location: "Berlin",
    timeAgo: "vor 2 Stunden",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"],
    seller: { name: "TechMaster2023", rating: 4.9, verified: true },
    category: "Computer",
    featured: true,
    condition: "Wie neu",
    views: 234,
    likes: 12
  },
  {
    id: 2,
    title: "Bitcoin Mining Rig - ASIC Antminer S19",
    price: 1850,
    currency: "EUR",
    cryptoPrices: [{ symbol: "BTC", price: 0.0428 }],
    location: "München",
    timeAgo: "vor 4 Stunden", 
    images: ["https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400"],
    seller: { name: "CryptoMiner", rating: 4.7, verified: true },
    category: "Elektronik",
    featured: false,
    condition: "Gebraucht",
    views: 189,
    likes: 8
  }
];

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
  const [filteredAds, setFilteredAds] = useState(mockAds);

  // Filter ads based on current filters
  useEffect(() => {
    let filtered = [...mockAds];

    if (searchTerm) {
      filtered = filtered.filter(ad => 
        ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "Alle Kategorien") {
      filtered = filtered.filter(ad => ad.category === selectedCategory);
    }

    if (selectedCondition !== "Alle") {
      filtered = filtered.filter(ad => ad.condition === selectedCondition);
    }

    filtered = filtered.filter(ad => ad.price >= priceRange[0] && ad.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case "Preis: Niedrig-Hoch":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "Preis: Hoch-Niedrig":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "Beliebtheit":
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      default:
        break;
    }

    setFilteredAds(filtered);
  }, [searchTerm, selectedCategory, selectedCondition, sortBy, priceRange]);

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

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAds.map((ad) => (
            <Card key={ad.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer gradient-card border-border/50 hover:border-primary/20 overflow-hidden">
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={ad.images[0]} 
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

                {/* Like Button */}
                <button className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors">
                  <Heart className="h-4 w-4 text-muted-foreground hover:text-red-500 transition-colors" />
                </button>

                {/* Condition Badge */}
                <div className="absolute bottom-3 left-3">
                  <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
                    {ad.condition}
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
                    €{ad.price.toLocaleString()}
                  </div>
                  {ad.cryptoPrices.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {ad.cryptoPrices.map((crypto, index) => (
                        <span key={index} className="text-xs text-muted-foreground">
                          {crypto.price} {crypto.symbol}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Location & Time */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{ad.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{ad.timeAgo}</span>
                  </div>
                </div>

                {/* Seller Info */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{ad.seller.name}</span>
                    {ad.seller.verified && (
                      <Verified className="h-3 w-3 text-primary" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span>{ad.seller.rating}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                  <span>{ad.views} Aufrufe</span>
                  <span>{ad.likes} Likes</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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