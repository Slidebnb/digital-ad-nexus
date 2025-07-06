import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Smartphone, 
  Laptop, 
  Car, 
  Home, 
  Gamepad2, 
  Shirt,
  Camera,
  Music,
  ArrowRight,
  TrendingUp
} from "lucide-react";

// Mock data - wird später durch echte Kategorien aus Supabase ersetzt
const categories = [
  {
    id: 1,
    name: "Elektronik",
    icon: Smartphone,
    count: 1234,
    trending: true,
    gradient: "from-blue-500 to-purple-600"
  },
  {
    id: 2,
    name: "Computer",
    icon: Laptop,
    count: 856,
    trending: true,
    gradient: "from-green-500 to-teal-600"
  },
  {
    id: 3,
    name: "Fahrzeuge",
    icon: Car,
    count: 432,
    trending: false,
    gradient: "from-red-500 to-pink-600"
  },
  {
    id: 4,
    name: "Immobilien",
    icon: Home,
    count: 289,
    trending: false,
    gradient: "from-yellow-500 to-orange-600"
  },
  {
    id: 5,
    name: "Gaming",
    icon: Gamepad2,
    count: 1067,
    trending: true,
    gradient: "from-purple-500 to-indigo-600"
  },
  {
    id: 6,
    name: "Mode",
    icon: Shirt,
    count: 743,
    trending: false,
    gradient: "from-pink-500 to-rose-600"
  },
  {
    id: 7,
    name: "Foto & Video",
    icon: Camera,
    count: 345,
    trending: false,
    gradient: "from-cyan-500 to-blue-600"
  },
  {
    id: 8,
    name: "Musik",
    icon: Music,
    count: 234,
    trending: false,
    gradient: "from-emerald-500 to-green-600"
  }
];

export function CategoriesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-primary">Entdecke</span> Kategorien
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Von Elektronik bis Gaming - finde genau das, was du suchst
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link key={category.id} to={`/browse?category=${category.id}`}>
                <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer gradient-card border-border/50 hover:border-primary/20">
                  <CardContent className="p-6 text-center">
                    {/* Icon with gradient background */}
                    <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                      <IconComponent className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                      {category.trending && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                          <TrendingUp className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Category Info */}
                    <h3 className="font-semibold text-sm md:text-base mb-1 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {category.count.toLocaleString()} Anzeigen
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* View All Categories Button */}
        <div className="text-center">
          <Link to="/categories">
            <Button variant="outline" size="lg" className="group">
              Alle Kategorien anzeigen
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}