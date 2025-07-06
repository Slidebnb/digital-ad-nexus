import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { CategoriesSection } from "@/components/CategoriesSection";
import { FeaturedAdsSection } from "@/components/FeaturedAdsSection";
import { Footer } from "@/components/Footer";
import { TrustSection } from "@/components/TrustSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
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