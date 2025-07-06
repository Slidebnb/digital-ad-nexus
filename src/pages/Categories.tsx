import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
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
  Grid3X3
} from "lucide-react";

// Mock categories data - später durch Supabase ersetzt
const allCategories = [
  {
    id: 1,
    name: "Elektronik",
    icon: Smartphone,
    count: 1234,
    trending: true,
    description: "Smartphones, Tablets, Wearables und mehr",
    subcategories: ["Smartphones", "Tablets", "Smartwatches", "Kopfhörer", "Lautsprecher"],
    gradient: "from-blue-500 to-purple-600"
  },
  {
    id: 2,
    name: "Computer",
    icon: Laptop,
    count: 856,
    trending: true,
    description: "Laptops, PCs, Komponenten und Zubehör",
    subcategories: ["Laptops", "Desktop PCs", "Grafikkarten", "Prozessoren", "RAM"],
    gradient: "from-green-500 to-teal-600"
  },
  {
    id: 3,
    name: "Gaming",
    icon: Gamepad2,
    count: 1067,
    trending: true,
    description: "Konsolen, Spiele, Gaming-Hardware",
    subcategories: ["PlayStation", "Xbox", "Nintendo", "PC Gaming", "VR Headsets"],
    gradient: "from-purple-500 to-indigo-600"
  },
  {
    id: 4,
    name: "Fahrzeuge",
    icon: Car,
    count: 432,
    trending: false,
    description: "Autos, Motorräder, E-Bikes und Zubehör",
    subcategories: ["PKW", "Motorräder", "E-Bikes", "Fahrräder", "Autozubehör"],
    gradient: "from-red-500 to-pink-600"
  },
  {
    id: 5,
    name: "Immobilien",
    icon: Home,
    count: 289,
    trending: false,
    description: "Wohnungen, Häuser, Grundstücke",
    subcategories: ["Wohnungen", "Häuser", "WG-Zimmer", "Grundstücke", "Gewerbe"],
    gradient: "from-yellow-500 to-orange-600"
  },
  {
    id: 6,
    name: "Mode & Beauty",
    icon: Shirt,
    count: 743,
    trending: false,
    description: "Kleidung, Schuhe, Accessoires, Kosmetik",
    subcategories: ["Herrenmode", "Damenmode", "Schuhe", "Taschen", "Schmuck"],
    gradient: "from-pink-500 to-rose-600"
  },
  {
    id: 7,
    name: "Foto & Video",
    icon: Camera,
    count: 345,
    trending: false,
    description: "Kameras, Objektive, Video-Equipment",
    subcategories: ["DSLR Kameras", "Objektive", "Drohnen", "Camcorder", "Stative"],
    gradient: "from-cyan-500 to-blue-600"
  },
  {
    id: 8,
    name: "Musik & Instrumente",
    icon: Music,
    count: 234,
    trending: false,
    description: "Musikinstrumente, Equipment, Vinyl",
    subcategories: ["Gitarren", "Keyboards", "Schlagzeug", "DJ Equipment", "Vinyl"],
    gradient: "from-emerald-500 to-green-600"
  },
  {
    id: 9,
    name: "Kunst & Sammlerobjekte",
    icon: Palette,
    count: 156,
    trending: false,
    description: "Kunstwerke, Sammlerstücke, Antiquitäten",
    subcategories: ["Gemälde", "Skulpturen", "Sammelkarten", "Comics", "Antiquitäten"],
    gradient: "from-violet-500 to-purple-600"
  },
  {
    id: 10,
    name: "Werkzeuge & Garten",
    icon: Wrench,
    count: 387,
    trending: false,
    description: "Werkzeuge, Gartengeräte, Baumarkt",
    subcategories: ["Handwerkzeuge", "Elektrowerkzeuge", "Gartengeräte", "Baumaterial", "Möbel"],
    gradient: "from-orange-500 to-red-600"
  },
  {
    id: 11,
    name: "Bücher & Medien",
    icon: BookOpen,
    count: 278,
    trending: false,
    description: "Bücher, E-Books, DVDs, Blu-rays",
    subcategories: ["Romane", "Fachbücher", "Comics", "DVDs", "Blu-rays"],
    gradient: "from-teal-500 to-cyan-600"
  },
  {
    id: 12,
    name: "Freizeit & Sport",
    icon: Heart,
    count: 445,
    trending: false,
    description: "Sportgeräte, Outdoor-Equipment, Hobbys",
    subcategories: ["Fitness", "Outdoor", "Wassersport", "Wintersport", "Camping"],
    gradient: "from-lime-500 to-green-600"
  }
];

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredCategories = allCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const trendingCategories = allCategories.filter(cat => cat.trending);
  const totalAds = allCategories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient-primary">Alle</span> Kategorien
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Entdecke über {totalAds.toLocaleString()} Anzeigen in {allCategories.length} verschiedenen Kategorien
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
        {!searchTerm && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Trending Kategorien</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Link key={category.id} to={`/browse?category=${category.id}`}>
                    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer gradient-card border-border/50 hover:border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-xl overflow-hidden`}>
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
                              {category.count.toLocaleString()} Anzeigen
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {category.description}
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
                const IconComponent = category.icon;
                return (
                  <Link key={category.id} to={`/browse?category=${category.id}`}>
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
                          {category.description}
                        </p>

                        {/* Subcategories */}
                        <div className="flex flex-wrap gap-1 mt-3 justify-center">
                          {category.subcategories.slice(0, 3).map((sub, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {sub}
                            </Badge>
                          ))}
                          {category.subcategories.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{category.subcategories.length - 3}
                            </Badge>
                          )}
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
                const IconComponent = category.icon;
                return (
                  <Link key={category.id} to={`/browse?category=${category.id}`}>
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
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {category.count.toLocaleString()} Anzeigen • {category.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {category.subcategories.map((sub, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {sub}
                                </Badge>
                              ))}
                            </div>
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
              Versuche andere Suchbegriffe
            </p>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Alle Kategorien anzeigen
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}