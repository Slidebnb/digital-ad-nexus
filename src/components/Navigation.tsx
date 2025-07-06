import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  User, 
  MessageCircle,
  PlusCircle,
  Coins
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // TODO: Replace with actual auth state

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative">
              <Coins className="h-8 w-8 text-primary animate-pulse-glow" />
              <div className="absolute inset-0 h-8 w-8 rounded-full bg-primary/20 blur-lg animate-float" />
            </div>
            <span className="text-xl font-bold text-gradient-primary">
              KryptoMarkt
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Suche nach Anzeigen..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-input bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
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
            
            {isLoggedIn ? (
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
                <Link to="/profile?tab=create">
                  <Button variant="gradient" size="sm">
                    <PlusCircle className="h-4 w-4" />
                    Anzeige erstellen
                  </Button>
                </Link>
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

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "md:hidden transition-all duration-300 ease-in-out",
          isMenuOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0 overflow-hidden"
        )}>
          {/* Mobile Search */}
          <div className="py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Suche nach Anzeigen..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-input bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Mobile Navigation Links */}
          <div className="space-y-2">
            <Link to="/browse" className="block">
              <Button variant="ghost" className="w-full justify-start" onClick={toggleMenu}>
                Durchsuchen
              </Button>
            </Link>
            <Link to="/categories" className="block">
              <Button variant="ghost" className="w-full justify-start" onClick={toggleMenu}>
                Kategorien
              </Button>
            </Link>
            <Link to="/how-it-works" className="block">
              <Button variant="ghost" className="w-full justify-start" onClick={toggleMenu}>
                So funktioniert's
              </Button>
            </Link>
            
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="block">
                  <Button variant="ghost" className="w-full justify-start" onClick={toggleMenu}>
                    <User className="h-4 w-4 mr-2" />
                    Profil
                  </Button>
                </Link>
                <Link to="/chat" className="block">
                  <Button variant="ghost" className="w-full justify-start" onClick={toggleMenu}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Nachrichten
                  </Button>
                </Link>
                <Link to="/profile?tab=create" className="block">
                  <Button variant="gradient" className="w-full" onClick={toggleMenu}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Anzeige erstellen
                  </Button>
                </Link>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link to="/login" className="block">
                  <Button variant="ghost" className="w-full" onClick={toggleMenu}>
                    Anmelden
                  </Button>
                </Link>
                <Link to="/login" className="block">
                  <Button variant="gradient" className="w-full" onClick={toggleMenu}>
                    Registrieren
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}