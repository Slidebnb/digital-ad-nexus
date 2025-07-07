import { MobileOptimizedNavigation } from "@/components/MobileOptimizedNavigation";
import { HeroSection } from "@/components/HeroSection";
import { CategoriesSection } from "@/components/CategoriesSection";
import { FeaturedAdsSection } from "@/components/FeaturedAdsSection";
import { Footer } from "@/components/Footer";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { TrustSection } from "@/components/TrustSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <MobileOptimizedNavigation />
      <main>
      
      {/* PWA Install Prompt */}
      <div className="container mx-auto px-4 py-4">
        <PWAInstallPrompt />
      </div>
      
      <HeroSection />
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