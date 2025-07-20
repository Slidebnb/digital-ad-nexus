
import { CategoryDisplayFix } from "@/components/CategoryDisplayFix";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function Categories() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <CategoryDisplayFix />
      </div>
      <Footer />
    </div>
  );
}
