import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FavoritesManager } from "@/components/FavoritesManager";
import { AuthGuard } from "@/components/AuthGuard";

export default function Favorites() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">
                <span className="text-gradient-primary">Meine</span> Favoriten
              </h1>
              <p className="text-muted-foreground">
                Verwalten Sie Ihre gespeicherten Anzeigen und bleiben Sie über Updates informiert.
              </p>
            </div>

            {/* Favorites Content */}
            <FavoritesManager />
          </div>
        </div>

        <Footer />
      </div>
    </AuthGuard>
  );
}