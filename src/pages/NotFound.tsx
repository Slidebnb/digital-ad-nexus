
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Search, AlertTriangle } from "lucide-react";
import { MobileOptimizedNavigation } from "@/components/MobileOptimizedNavigation";
import { Footer } from "@/components/Footer";
import { MobileBottomNavigation } from "@/components/MobileBottomNavigation";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Einheitliche Navigation wie auf der Startseite */}
      <MobileOptimizedNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-12 w-12 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-4xl font-bold mb-2">404</CardTitle>
              <p className="text-xl text-muted-foreground">
                Seite nicht gefunden
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Die angeforderte Seite <code className="bg-muted px-2 py-1 rounded text-sm">{location.pathname}</code> konnte nicht gefunden werden.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/">
                  <Button variant="gradient" className="w-full sm:w-auto">
                    <Home className="h-4 w-4 mr-2" />
                    Zur Startseite
                  </Button>
                </Link>
                <Link to="/browse">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Search className="h-4 w-4 mr-2" />
                    Anzeigen durchsuchen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Bottom Navigation - einheitlich auf allen Seiten */}
      <MobileBottomNavigation />
      
      {/* Footer wie auf der Startseite */}
      <Footer />
    </div>
  );
};

export default NotFound;
