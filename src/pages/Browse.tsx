import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Browse() {
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState<number[]>([0, 100]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [locationFilters, setLocationFilters] = useState<string[]>([]);

  const [categories, setCategories] = useState([
    "Electronics",
    "Furniture",
    "Clothing",
    "Books",
    "Sports",
  ]);
  const [locations, setLocations] = useState([
    "Berlin",
    "Hamburg",
    "Munich",
    "Cologne",
    "Frankfurt",
  ]);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const initialSearch = searchParams.get("search") || "";
    const initialPriceMin = Number(searchParams.get("priceMin")) || 0;
    const initialPriceMax = Number(searchParams.get("priceMax")) || 100;
    const initialCategories = searchParams.getAll("category") || [];
    const initialLocations = searchParams.getAll("location") || [];

    setSearch(initialSearch);
    setPriceRange([initialPriceMin, initialPriceMax]);
    setCategoryFilters(initialCategories);
    setLocationFilters(initialLocations);
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const handleCategoryChange = (category: string) => {
    if (categoryFilters.includes(category)) {
      setCategoryFilters(categoryFilters.filter((c) => c !== category));
    } else {
      setCategoryFilters([...categoryFilters, category]);
    }
  };

  const handleLocationChange = (location: string) => {
    if (locationFilters.includes(location)) {
      setLocationFilters(locationFilters.filter((l) => l !== location));
    } else {
      setLocationFilters([...locationFilters, location]);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (search) {
      params.set("search", search);
    }

    params.set("priceMin", String(priceRange[0]));
    params.set("priceMax", String(priceRange[1]));

    categoryFilters.forEach((category) => {
      params.append("category", category);
    });

    locationFilters.forEach((location) => {
      params.append("location", location);
    });

    setSearchParams(params);
    navigate({ pathname: "/browse", search: params.toString() });
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <h1 className="text-3xl font-bold mb-4">Browse Listings</h1>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-4 mb-4">
            <Label htmlFor="search">Search</Label>
            <Input
              type="text"
              id="search"
              placeholder="Search for listings..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          {/* Price Range Filter */}
          <div className="md:col-span-1">
            <Card>
              <CardContent>
                <Label className="block mb-2">Price Range (€)</Label>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>{priceRange[0]}</span>
                  <span>{priceRange[1]}</span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={priceRange}
                  onValueChange={handlePriceChange}
                />
              </CardContent>
            </Card>
          </div>

          {/* Category Filters */}
          <div className="md:col-span-1">
            <Card>
              <CardContent>
                <Label className="block mb-2">Categories</Label>
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={categoryFilters.includes(category)}
                      onCheckedChange={() => handleCategoryChange(category)}
                    />
                    <Label htmlFor={`category-${category}`}>{category}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Location Filters */}
          <div className="md:col-span-1">
            <Card>
              <CardContent>
                <Label className="block mb-2">Locations</Label>
                {locations.map((location) => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={`location-${location}`}
                      checked={locationFilters.includes(location)}
                      onCheckedChange={() => handleLocationChange(location)}
                    />
                    <Label htmlFor={`location-${location}`}>{location}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Apply Filters Button */}
          <div className="md:col-span-1 flex items-end">
            <Button className="w-full" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Listings Display (Placeholder) */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            {search
              ? `Results for "${search}"`
              : "All Listings"}
          </h2>
          <p className="text-muted-foreground">
            Display listings based on applied filters here.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
