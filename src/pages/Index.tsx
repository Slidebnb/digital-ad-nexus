
import { PageLayout } from "@/components/PageLayout";
import { HeroSection } from "@/components/HeroSection";
import { CategoriesSection } from "@/components/CategoriesSection";
import { FeaturedAdsSection } from "@/components/FeaturedAdsSection";
import { BoostedAdsSection } from "@/components/BoostedAdsSection";
import { Footer } from "@/components/Footer";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { MobilePerformanceOptimizer } from "@/components/MobilePerformanceOptimizer";
import { CryptoPriceUpdater } from "@/components/CryptoPriceUpdater";
import { QuickActionWidget } from "@/components/QuickActionWidget";
import { FloatingChatWidget } from "@/components/FloatingChatWidget";
import { MobileQuickActions } from "@/components/MobileQuickActions";
import { RealTimeStatsWidget } from "@/components/RealTimeStatsWidget";
import { MobileBottomNavigation } from "@/components/MobileBottomNavigation";
import { ProductionReadyBanner } from "@/components/ProductionReadyBanner";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { isAdmin } = useAuth();
  
  return (
    <PageLayout>
      <MobilePerformanceOptimizer />
      
      {/* Admin Production Ready Banner */}
      {isAdmin && (
        <div className="container mx-auto px-4 pt-4">
          <ProductionReadyBanner />
        </div>
      )}
      
      <main>
        <HeroSection />
        
        {/* Schnellzugriff & Stats Widget - Zentral für Marktplatz */}
        <div className="container mx-auto px-4 -mt-8 relative z-10 mb-8">
          <div className="flex justify-center gap-4">
            <div className="w-full max-w-sm">
              <QuickActionWidget />
            </div>
            <div className="hidden lg:block w-full max-w-xs">
              <RealTimeStatsWidget />
            </div>
          </div>
        </div>
        
        <CategoriesSection />
        
        {/* Gesponserte Anzeigen Sektion */}
        <section className="container mx-auto px-4 py-12">
          <BoostedAdsSection maxAds={6} showHeader={true} />
        </section>
        
        <FeaturedAdsSection />
        <HowItWorksSection />
      </main>
      <CryptoPriceUpdater />
      <FloatingChatWidget />
      <MobileQuickActions />
    </PageLayout>
  );
}
