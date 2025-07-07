import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SlidersHorizontal, X, ChevronDown, ChevronUp, MapPin, Calendar, Star, Verified } from "lucide-react";

export interface SearchFilters {
  searchTerm: string;
  category: string;
  location: string;
  priceRange: [number, number];
  condition: string[];
  verifiedSellers: boolean;
  minRating: number;
  dateRange: string;
  acceptedCoins: string[];
  featuredOnly: boolean;
  sortBy: string;
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  availableCategories: string[];
  availableLocations: string[];
}

const CONDITIONS = ["neu", "wie neu", "sehr gut", "gut", "gebraucht"];
const CRYPTO_COINS = ["BTC", "ETH", "ADA", "SOL", "DOT", "MATIC", "LINK", "UNI", "LTC", "XRP"];
const DATE_RANGES = [
  { value: "all", label: "Alle Zeiten" },
  { value: "today", label: "Heute" },
  { value: "week", label: "Diese Woche" },
  { value: "month", label: "Dieser Monat" },
  { value: "3months", label: "Letzte 3 Monate" }
];

const SORT_OPTIONS = [
  { value: "newest", label: "Neueste zuerst" },
  { value: "oldest", label: "Älteste zuerst" },
  { value: "price_low", label: "Preis: Niedrig → Hoch" },
  { value: "price_high", label: "Preis: Hoch → Niedrig" },
  { value: "rating", label: "Beste Bewertung" },
  { value: "popular", label: "Beliebteste" }
];

export function AdvancedFilters({ onFiltersChange, availableCategories, availableLocations }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    category: "Alle Kategorien",
    location: "",
    priceRange: [0, 10000],
    condition: [],
    verifiedSellers: false,
    minRating: 0,
    dateRange: "all",
    acceptedCoins: [],
    featuredOnly: false,
    sortBy: "newest"
  });

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: SearchFilters = {
      searchTerm: "",
      category: "Alle Kategorien",
      location: "",
      priceRange: [0, 10000],
      condition: [],
      verifiedSellers: false,
      minRating: 0,
      dateRange: "all",
      acceptedCoins: [],
      featuredOnly: false,
      sortBy: "newest"
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.category !== "Alle Kategorien") count++;
    if (filters.location) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    if (filters.condition.length > 0) count++;
    if (filters.verifiedSellers) count++;
    if (filters.minRating > 0) count++;
    if (filters.dateRange !== "all") count++;
    if (filters.acceptedCoins.length > 0) count++;
    if (filters.featuredOnly) count++;
    return count;
  };

  const handleConditionChange = (condition: string, checked: boolean) => {
    const newConditions = checked 
      ? [...filters.condition, condition]
      : filters.condition.filter(c => c !== condition);
    updateFilters({ condition: newConditions });
  };

  const handleCoinChange = (coin: string, checked: boolean) => {
    const newCoins = checked 
      ? [...filters.acceptedCoins, coin]
      : filters.acceptedCoins.filter(c => c !== coin);
    updateFilters({ acceptedCoins: newCoins });
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="w-full mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Erweiterte Filter
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Search Term */}
            <div className="space-y-2">
              <Label>Suchbegriff</Label>
              <Input
                placeholder="Suche nach Produkten, Beschreibungen..."
                value={filters.searchTerm}
                onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              />
            </div>

            {/* Category & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Kategorie
                </Label>
                <Select value={filters.category} onValueChange={(value) => updateFilters({ category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Standort
                </Label>
                <Select value={filters.location} onValueChange={(value) => updateFilters({ location: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Standort auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle Standorte</SelectItem>
                    {availableLocations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <Label>Preisspanne: €{filters.priceRange[0].toLocaleString()} - €{filters.priceRange[1].toLocaleString()}</Label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                max={10000}
                min={0}
                step={50}
                className="w-full"
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange[0]}
                  onChange={(e) => updateFilters({ priceRange: [Number(e.target.value), filters.priceRange[1]] })}
                  className="w-24"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange[1]}
                  onChange={(e) => updateFilters({ priceRange: [filters.priceRange[0], Number(e.target.value)] })}
                  className="w-24"
                />
              </div>
            </div>

            {/* Condition */}
            <div className="space-y-3">
              <Label>Zustand</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CONDITIONS.map(condition => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition}
                      checked={filters.condition.includes(condition)}
                      onCheckedChange={(checked) => handleConditionChange(condition, !!checked)}
                    />
                    <Label htmlFor={condition} className="text-sm capitalize">{condition}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Seller Verification & Rating */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={filters.verifiedSellers}
                    onCheckedChange={(checked) => updateFilters({ verifiedSellers: !!checked })}
                  />
                  <Label htmlFor="verified" className="flex items-center gap-2">
                    <Verified className="h-4 w-4" />
                    Nur verifizierte Verkäufer
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Mindest-Bewertung: {filters.minRating > 0 ? `${filters.minRating} Sterne` : "Alle"}
                </Label>
                <Slider
                  value={[filters.minRating]}
                  onValueChange={(value) => updateFilters({ minRating: value[0] })}
                  max={5}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Zeitraum
              </Label>
              <Select value={filters.dateRange} onValueChange={(value) => updateFilters({ dateRange: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map(range => (
                    <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Accepted Coins */}
            <div className="space-y-3">
              <Label>Akzeptierte Kryptowährungen</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {CRYPTO_COINS.map(coin => (
                  <div key={coin} className="flex items-center space-x-2">
                    <Checkbox
                      id={coin}
                      checked={filters.acceptedCoins.includes(coin)}
                      onCheckedChange={(checked) => handleCoinChange(coin, !!checked)}
                    />
                    <Label htmlFor={coin} className="text-sm">{coin}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Only */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={filters.featuredOnly}
                onCheckedChange={(checked) => updateFilters({ featuredOnly: !!checked })}
              />
              <Label htmlFor="featured">Nur beworbene Anzeigen</Label>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <Label>Sortierung</Label>
              <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="flex items-center gap-2"
                disabled={activeFiltersCount === 0}
              >
                <X className="h-4 w-4" />
                Filter zurücksetzen
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                className="ml-auto"
              >
                Filter anwenden
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}