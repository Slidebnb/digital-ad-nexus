import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Zap, 
  Users, 
  TrendingUp,
  ArrowRight,
  Bitcoin,
  Coins
} from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import { useHomepageStats } from "@/hooks/useHomepageStats";

export function HeroSection() {
  const { stats } = useHomepageStats();

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `€${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `€${(volume / 1000).toFixed(0)}K`;
    }
    return `€${volume}`;
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Crypto Background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 gradient-hero" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 z-1">
        <div className="absolute top-20 left-10 animate-float">
          <Bitcoin className="h-8 w-8 text-primary/30" />
        </div>
        <div className="absolute top-32 right-20 animate-float" style={{ animationDelay: '1s' }}>
          <Coins className="h-6 w-6 text-secondary/30" />
        </div>
        <div className="absolute bottom-32 left-20 animate-float" style={{ animationDelay: '2s' }}>
          <TrendingUp className="h-10 w-10 text-accent/30" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-gradient-primary">Krypto</span>
            <span className="text-foreground"> trifft auf </span>
            <span className="text-gradient-secondary">Kleinanzeigen</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Die dezentrale Plattform für den sicheren Handel mit Kryptowährungen. 
            Kaufe, verkaufe und tausche direkt mit anderen Nutzern.
          </p>

          {/* Call to Action - Vereinfacht */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/browse">
              <Button variant="gradient" size="lg" className="text-lg px-8 py-4">
                Jetzt durchsuchen
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                Kostenlos registrieren
              </Button>
            </Link>
          </div>

          {/* Features - Vereinfacht auf 2 wichtigste */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-2xl mx-auto">
            <div className="text-center p-6 rounded-xl gradient-card shadow-elevation">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">100% Sicher</h3>
              <p className="text-muted-foreground text-sm">
                Bewertungssystem und Verifizierung für maximale Sicherheit
              </p>
            </div>

            <div className="text-center p-6 rounded-xl gradient-card shadow-elevation">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-4">
                <Zap className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Sofort verfügbar</h3>
              <p className="text-muted-foreground text-sm">
                Direkte Kommunikation und schnelle Abwicklung
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}