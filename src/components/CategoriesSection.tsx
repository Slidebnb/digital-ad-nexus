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
  TrendingUp,
  Package,
  Monitor,
  Cpu,
  Headphones,
  Wrench,
  GraduationCap
} from "lucide-react";
import { useCategoriesWithCounts } from "@/hooks/useCategoriesWithCounts";

// Icon mapping for categories
const iconMap: { [key: string]: any } = {
  'smartphone': Smartphone,
  'laptop': Laptop,
  'car': Car,
  'home': Home,
  'gamepad2': Gamepad2,
  'shirt': Shirt,
  'camera': Camera,
  'music': Music,
  'package': Package,
  'monitor': Monitor,
  'cpu': Cpu,
  'headphones': Headphones,
  'wrench': Wrench,
  'graduation-cap': GraduationCap
};

export function CategoriesSection() {
  const { categories, loading } = useCategoriesWithCounts();

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient-primary">Entdecke</span> Kategorien
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Von Elektronik bis Gaming - finde genau das, was du suchst
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="gradient-card border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-xl mb-4 mx-auto bg-muted animate-pulse" />
                  <div className="h-4 bg-muted rounded mb-2 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/2 mx-auto animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
            const IconComponent = iconMap[category.icon] || Package;
            return (
              <Link key={category.id} to={`/browse?category=${category.name}`}>
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