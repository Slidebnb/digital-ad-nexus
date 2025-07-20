
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { MobileOptimizedNavigation } from "@/components/MobileOptimizedNavigation";
import { Footer } from "@/components/Footer";
import { MobileBottomNavigation } from "@/components/MobileBottomNavigation";

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

const categoriesData: Category[] = [
  {
    id: 1,
    name: "Fashion",
    description: "Discover the latest trends in fashion.",
    image: "https://source.unsplash.com/300x200/?fashion",
  },
  {
    id: 2,
    name: "Electronics",
    description: "Explore the world of gadgets and electronics.",
    image: "https://source.unsplash.com/300x200/?electronics",
  },
  {
    id: 3,
    name: "Home & Garden",
    description: "Find everything for your home and garden.",
    image: "https://source.unsplash.com/300x200/?home",
  },
  {
    id: 4,
    name: "Sports & Outdoors",
    description: "Gear up for your next adventure.",
    image: "https://source.unsplash.com/300x200/?sports",
  },
  {
    id: 5,
    name: "Books",
    description: "Dive into the world of literature.",
    image: "https://source.unsplash.com/300x200/?books",
  },
  {
    id: 6,
    name: "Toys & Games",
    description: "Fun for all ages.",
    image: "https://source.unsplash.com/300x200/?toys",
  },
];

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>(categoriesData);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const filteredCategories = categoriesData.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setCategories(filteredCategories);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Einheitliche Navigation wie auf der Startseite */}
      <MobileOptimizedNavigation />
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Label htmlFor="search">Search Categories:</Label>
            <Input
              id="search"
              type="text"
              placeholder="Enter category name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link to={`/category/${category.id}`} key={category.id}>
              <Card className="hover:shadow-md transition-all">
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-40 object-cover mb-4 rounded-md"
                  />
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Bottom Navigation - einheitlich auf allen Seiten */}
      <MobileBottomNavigation />
      
      {/* Footer wie auf der Startseite */}
      <Footer />
    </div>
  );
}
