import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Filter, X, MapPin, Euro, Star, Shield } from "lucide-react";

interface FilterState {
  priceRange: [number, number];
  location: string;
  categories: string[];
  coins: string[];
  verified: boolean;
  minRating: number;
  sortBy: string;
  condition: string[];
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

const CATEGORIES = [
  'Hardware Wallets', 'Mining Equipment', 'Trading Bots', 
  'NFTs', 'DeFi Services', 'Staking Services'
];

const COINS = [
  'BTC', 'ETH', 'ADA', 'SOL', 'DOT', 'MATIC', 'LINK', 'UNI', 'LTC', 'XRP'
];

const CONDITIONS = ['Neu', 'Wie neu', 'Sehr gut', 'Gut', 'Akzeptabel'];

export function AdvancedFilters({ onFiltersChange, className }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 100000],
    location: '',
    categories: [],
    coins: [],
    verified: false,
    minRating: 0,
    sortBy: 'newest',
    condition: []
  });

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      priceRange: [0, 100000],
      location: '',
      categories: [],
      coins: [],
      verified: false,
      minRating: 0,
      sortBy: 'newest',
      condition: []
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.categories.length > 0) count++;
    if (filters.coins.length > 0) count++;
    if (filters.verified) count++;
    if (filters.minRating > 0) count++;
    if (filters.condition.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Erweiterte Filter
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Zurücksetzen
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? 'Schließen' : 'Öffnen'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="space-y-6">
          {/* Price Range */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Preisbereich: {filters.priceRange[0]}€ - {filters.priceRange[1]}€
            </Label>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
              max={100000}
              step={100}
              className="w-full"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Standort
            </Label>
            <Input
              id="location"
              placeholder="Stadt oder PLZ eingeben..."
              value={filters.location}
              onChange={(e) => updateFilters({ location: e.target.value })}
            />
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <Label>Kategorien</Label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilters({ categories: [...filters.categories, category] });
                      } else {
                        updateFilters({ 
                          categories: filters.categories.filter(c => c !== category) 
                        });
                      }
                    }}
                  />
                  <Label htmlFor={category} className="text-sm">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Accepted Coins */}
          <div className="space-y-3">
            <Label>Akzeptierte Kryptowährungen</Label>
            <div className="grid grid-cols-5 gap-2">
              {COINS.map((coin) => (
                <div key={coin} className="flex items-center space-x-2">
                  <Checkbox
                    id={coin}
                    checked={filters.coins.includes(coin)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilters({ coins: [...filters.coins, coin] });
                      } else {
                        updateFilters({ 
                          coins: filters.coins.filter(c => c !== coin) 
                        });
                      }
                    }}
                  />
                  <Label htmlFor={coin} className="text-sm font-mono">
                    {coin}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div className="space-y-3">
            <Label>Zustand</Label>
            <div className="grid grid-cols-3 gap-2">
              {CONDITIONS.map((condition) => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={condition}
                    checked={filters.condition.includes(condition)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilters({ condition: [...filters.condition, condition] });
                      } else {
                        updateFilters({ 
                          condition: filters.condition.filter(c => c !== condition) 
                        });
                      }
                    }}
                  />
                  <Label htmlFor={condition} className="text-sm">
                    {condition}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Verification & Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.verified}
                onCheckedChange={(checked) => updateFilters({ verified: !!checked })}
              />
              <Label htmlFor="verified" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Nur verifizierte Verkäufer
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Mindestbewertung: {filters.minRating}★
              </Label>
              <Slider
                value={[filters.minRating]}
                onValueChange={(value) => updateFilters({ minRating: value[0] })}
                max={5}
                step={0.5}
                className="w-full"
              />
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label htmlFor="sortBy">Sortieren nach</Label>
            <Select 
              value={filters.sortBy} 
              onValueChange={(value) => updateFilters({ sortBy: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Neueste zuerst</SelectItem>
                <SelectItem value="oldest">Älteste zuerst</SelectItem>
                <SelectItem value="price_low">Preis: Niedrig → Hoch</SelectItem>
                <SelectItem value="price_high">Preis: Hoch → Niedrig</SelectItem>
                <SelectItem value="rating">Beste Bewertung</SelectItem>
                <SelectItem value="popular">Beliebteste</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="pt-4 border-t">
              <Label className="text-sm font-medium mb-2 block">
                Aktive Filter ({activeFiltersCount})
              </Label>
              <div className="flex flex-wrap gap-2">
                {filters.location && (
                  <Badge variant="secondary">
                    Standort: {filters.location}
                  </Badge>
                )}
                {filters.categories.map(cat => (
                  <Badge key={cat} variant="secondary">
                    {cat}
                  </Badge>
                ))}
                {filters.coins.map(coin => (
                  <Badge key={coin} variant="secondary">
                    {coin}
                  </Badge>
                ))}
                {filters.verified && (
                  <Badge variant="secondary">Verifiziert</Badge>
                )}
                {filters.minRating > 0 && (
                  <Badge variant="secondary">
                    Min. {filters.minRating}★
                  </Badge>
                )}
                {filters.condition.map(cond => (
                  <Badge key={cond} variant="secondary">
                    {cond}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}