import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  User, 
  MessageCircle,
  PlusCircle,
  Coins,
  Home,
  Grid3X3,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function MobileOptimizedNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Close menu on route change
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 md:h-18 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0 group" onClick={closeMenu}>
            <div className="relative">
              <Coins className="h-7 w-7 md:h-9 md:w-9 text-primary group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent hidden xs:inline leading-tight">
                KRYPTOANZEIGEN.DE
              </span>
              <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline leading-none">
                Deutschlands Krypto-Marktplatz
              </span>
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent xs:hidden">
              KRYPTO
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link to="/browse">
              <Button variant="ghost" size="sm">
                Durchsuchen
              </Button>
            </Link>
            <Link to="/categories">
              <Button variant="ghost" size="sm">
                Kategorien
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="ghost" size="sm">
                So funktioniert's
              </Button>
            </Link>
            
            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <Bell className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/chat">
                  <Button variant="ghost" size="icon">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/create-ad">
                  <Button variant="gradient" size="sm">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Anzeige erstellen
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  Abmelden
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Anmelden
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="gradient" size="sm">
                    Registrieren
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile/Tablet Menu */}
          <div className="flex items-center gap-2 lg:hidden">
            {user && (
              <Link to="/create-ad">
                <Button 
                  variant="gradient" 
                  size="sm" 
                  className="px-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                  onClick={closeMenu}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden sm:ml-1 sm:inline">Erstellen</span>
                </Button>
              </Link>
            )}
            
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden hover:bg-primary/10 transition-colors duration-200"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background/95 backdrop-blur-xl">
                <SheetHeader className="border-b border-border/50 pb-4">
                  <SheetTitle className="flex items-center gap-3">
                    <div className="relative">
                      <Coins className="h-7 w-7 text-primary" />
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-lg font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        KRYPTOANZEIGEN.DE
                      </span>
                      <span className="text-xs text-muted-foreground font-normal">
                        Deutschlands Krypto-Marktplatz
                      </span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Suche nach Anzeigen..."
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-input bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 text-sm"
                    />
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-2">
                    <Link to="/" onClick={toggleMenu}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Home className="h-4 w-4 mr-3" />
                        Startseite
                      </Button>
                    </Link>
                    <Link to="/browse" onClick={toggleMenu}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Search className="h-4 w-4 mr-3" />
                        Durchsuchen
                      </Button>
                    </Link>
                    <Link to="/categories" onClick={toggleMenu}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Grid3X3 className="h-4 w-4 mr-3" />
                        Kategorien
                      </Button>
                    </Link>
                    <Link to="/how-it-works" onClick={toggleMenu}>
                      <Button variant="ghost" className="w-full justify-start">
                        <BookOpen className="h-4 w-4 mr-3" />
                        So funktioniert's
                      </Button>
                    </Link>
                  </div>

                  {/* User Actions */}
                  <div className="border-t pt-4 space-y-2">
                    {user ? (
                      <>
                        <Link to="/dashboard" onClick={toggleMenu}>
                          <Button variant="ghost" className="w-full justify-start">
                            <User className="h-4 w-4 mr-3" />
                            Dashboard
                          </Button>
                        </Link>
                        <Link to="/chat" onClick={toggleMenu}>
                          <Button variant="ghost" className="w-full justify-start">
                            <MessageCircle className="h-4 w-4 mr-3" />
                            Nachrichten
                          </Button>
                        </Link>
                        <Link to="/create-ad" onClick={toggleMenu}>
                          <Button variant="gradient" className="w-full">
                            <PlusCircle className="h-4 w-4 mr-3" />
                            Anzeige erstellen
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start" 
                          onClick={() => { signOut(); toggleMenu(); }}
                        >
                          Abmelden
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Link to="/login" onClick={toggleMenu}>
                          <Button variant="ghost" className="w-full">
                            Anmelden
                          </Button>
                        </Link>
                        <Link to="/login" onClick={toggleMenu}>
                          <Button variant="gradient" className="w-full">
                            Registrieren
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}