import { MobileOptimizedNavigation } from "@/components/MobileOptimizedNavigation";
import { HeroSection } from "@/components/HeroSection";
import { CategoriesSection } from "@/components/CategoriesSection";
import { FeaturedAdsSection } from "@/components/FeaturedAdsSection";
import { Footer } from "@/components/Footer";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { TrustSection } from "@/components/TrustSection";
import { MobilePerformanceOptimizer } from "@/components/MobilePerformanceOptimizer";
import { LiveUserCount } from "@/components/LiveUserCount";
import { MarketTrendsWidget } from "@/components/MarketTrendsWidget";
import { CryptoPriceUpdater } from "@/components/CryptoPriceUpdater";
import { SecurityWidget } from "@/components/SecurityWidget";
import { QuickStatsWidget } from "@/components/QuickStatsWidget";
import { QuickActionWidget } from "@/components/QuickActionWidget";
import { TrustSignalsWidget } from "@/components/TrustSignalsWidget";
import { SafetyTipsWidget } from "@/components/SafetyTipsWidget";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <MobilePerformanceOptimizer />
      <MobileOptimizedNavigation />
      <main>
      
      {/* PWA Install Prompt - Enhanced */}
      <div className="container mx-auto px-4 py-6">
        <PWAInstallPrompt />
      </div>
      
      <HeroSection />
      
      {/* Kompakte Widget-Sektion */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <LiveUserCount />
          <SecurityWidget />
          <QuickActionWidget />
          <TrustSignalsWidget />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <QuickStatsWidget />
          <MarketTrendsWidget />
        </div>
      </div>
      
      {/* Sicherheitshinweise */}
      <div className="container mx-auto px-4 mb-8">
        <SafetyTipsWidget />
      </div>
      
        <CategoriesSection />
        <FeaturedAdsSection />
        <HowItWorksSection />
        <TrustSection />
      </main>
      <Footer />
      <CryptoPriceUpdater />
    </div>
  );
};

export default Index;