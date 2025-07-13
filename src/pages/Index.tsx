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
      
      {/* Live User Count */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <LiveUserCount />
      </div>
      
        <CategoriesSection />
        <FeaturedAdsSection />
        <HowItWorksSection />
        <TrustSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;