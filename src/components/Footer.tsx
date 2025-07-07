import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Coins,
  Twitter,
  Github,
  Linkedin,
  Mail,
  Shield,
  BookOpen,
  Users,
  HeadphonesIcon
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="relative">
                <Coins className="h-8 w-8 text-primary" />
                <div className="absolute inset-0 h-8 w-8 rounded-full bg-primary/20 blur-lg" />
              </div>
              <span className="text-xl font-bold text-gradient-primary">
                KRYPTOANZEIGEN.DE
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4 max-w-xs">
              Die dezentrale Plattform für den sicheren Handel mit Kryptowährungen. 
              Direkt, sicher und transparent.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Marktplatz</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/browse" className="text-muted-foreground hover:text-primary transition-colors">
                  Alle Anzeigen
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-muted-foreground hover:text-primary transition-colors">
                  Kategorien
                </Link>
              </li>
              <li>
                <Link to="/browse?featured=true" className="text-muted-foreground hover:text-primary transition-colors">
                  Featured Anzeigen
                </Link>
              </li>
              <li>
                <Link to="/browse?sort=newest" className="text-muted-foreground hover:text-primary transition-colors">
                  Neueste Anzeigen
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors">
                  Anzeige aufgeben
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  So funktioniert's
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Sicherheit
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <HeadphonesIcon className="h-4 w-4" />
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Kontakt
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Rechtliches</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  AGB
                </Link>
              </li>
              <li>
                <Link to="/imprint" className="text-muted-foreground hover:text-primary transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                  Cookie-Richtlinie
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-muted-foreground hover:text-primary transition-colors">
                  Haftungsausschluss
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-muted/30 rounded-xl p-6 mb-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-lg font-semibold mb-2">Bleib auf dem Laufenden</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Erhalte die neuesten Updates zu neuen Features und exklusiven Angeboten
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Deine E-Mail-Adresse"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button variant="gradient" size="sm">
                Abonnieren
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 py-4 md:py-6 border-t border-border">
          <div className="text-center">
            <div className="text-lg md:text-xl font-bold text-primary">10,000+</div>
            <div className="text-xs text-muted-foreground">Registrierte Nutzer</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-secondary">5,000+</div>
            <div className="text-xs text-muted-foreground">Aktive Anzeigen</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-accent">€2.5M</div>
            <div className="text-xs text-muted-foreground">Handelsvolumen</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-success">99.2%</div>
            <div className="text-xs text-muted-foreground">Zufriedenheitsrate</div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-4 md:pt-6 border-t border-border text-xs md:text-sm text-muted-foreground">
          <p className="text-center md:text-left">
            © 2024 KRYPTOANZEIGEN.DE. Alle Rechte vorbehalten.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4 mt-4 md:mt-0 text-xs md:text-sm">
            <span>Gebaut mit ❤️ in Deutschland</span>
            <div className="flex items-center gap-1">
              <span>Status:</span>
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-success text-xs">Online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}