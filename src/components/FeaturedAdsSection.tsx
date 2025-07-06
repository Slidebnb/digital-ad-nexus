import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Heart, 
  MapPin, 
  Clock, 
  Star,
  Verified,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data - wird später durch echte Anzeigen aus Supabase ersetzt
const featuredAds = [
  {
    id: 1,
    title: "MacBook Pro M3 16\" - Wie neu",
    price: 2499,
    currency: "EUR",
    cryptoPrices: [
      { symbol: "BTC", price: 0.0578 },
      { symbol: "ETH", price: 1.124 }
    ],
    location: "Berlin",
    timeAgo: "vor 2 Stunden",
    images: ["https://via.placeholder.com/400x300?text=MacBook+Pro"],
    seller: {
      name: "TechMaster2023",
      rating: 4.9,
      verified: true,
      trades: 47
    },
    category: "Computer",
    featured: true,
    boosted: true,
    condition: "Wie neu",
    views: 234,
    likes: 12
  },
  {
    id: 2,
    title: "Bitcoin Mining Rig - ASIC Antminer S19",
    price: 1850,
    currency: "EUR",
    cryptoPrices: [
      { symbol: "BTC", price: 0.0428 }
    ],
    location: "München",
    timeAgo: "vor 4 Stunden",
    images: ["https://via.placeholder.com/400x300?text=Mining+Rig"],
    seller: {
      name: "CryptoMiner",
      rating: 4.7,
      verified: true,
      trades: 23
    },
    category: "Elektronik",
    featured: true,
    boosted: false,
    condition: "Gebraucht",
    views: 189,
    likes: 8
  },
  {
    id: 3,
    title: "Ledger Nano X Hardware Wallet",
    price: 89,
    currency: "EUR",
    cryptoPrices: [
      { symbol: "BTC", price: 0.00206 },
      { symbol: "ETH", price: 0.04 }
    ],
    location: "Hamburg",
    timeAgo: "vor 1 Tag",
    images: ["https://via.placeholder.com/400x300?text=Ledger+Wallet"],
    seller: {
      name: "SecureWallet",
      rating: 5.0,
      verified: true,
      trades: 156
    },
    category: "Elektronik",
    featured: true,
    boosted: true,
    condition: "Neu",
    views: 456,
    likes: 23
  },
  {
    id: 4,
    title: "Gaming PC RTX 4080 + i7-13700K",
    price: 1899,
    currency: "EUR",
    cryptoPrices: [
      { symbol: "BTC", price: 0.044 },
      { symbol: "SOL", price: 8.7 }
    ],
    location: "Frankfurt",
    timeAgo: "vor 6 Stunden",
    images: ["https://via.placeholder.com/400x300?text=Gaming+PC"],
    seller: {
      name: "GameBuilder",
      rating: 4.8,
      verified: false,
      trades: 12
    },
    category: "Computer",
    featured: true,
    boosted: false,
    condition: "Gebraucht",
    views: 312,
    likes: 18
  }
];

export function FeaturedAdsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient-primary">Featured</span> Anzeigen
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Die besten und beliebtesten Anzeigen unserer Community
            </p>
          </div>
          <Link to="/browse?featured=true">
            <Button variant="outline" className="group mt-4 md:mt-0">
              Alle Featured Anzeigen
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Featured Ads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredAds.map((ad) => (
            <Link key={ad.id} to={`/ad/${ad.id}`}>
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer gradient-card border-border/50 hover:border-primary/20 overflow-hidden">
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
                    {ad.boosted && (
                      <Badge className="bg-accent text-accent-foreground text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Boosted
                      </Badge>
                    )}
                  </div>

                  {/* Like Button */}
                  <button 
                    className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // TODO: Implement like functionality
                    }}
                  >
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
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span>{ad.seller.rating}</span>
                      </div>
                      <span className="text-muted-foreground">({ad.seller.trades})</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                    <span>{ad.views} Aufrufe</span>
                    <span>{ad.likes} Likes</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link to="/browse">
            <Button variant="gradient" size="lg" className="group">
              Alle Anzeigen durchsuchen
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}