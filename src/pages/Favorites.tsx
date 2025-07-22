
import { FavoritesManager } from "@/components/FavoritesManager";
import { AuthGuard } from "@/components/AuthGuard";
import { PageLayout } from "@/components/PageLayout";

export default function Favorites() {
  return (
    <AuthGuard>
      <PageLayout>
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
      </PageLayout>
    </AuthGuard>
  );
}
