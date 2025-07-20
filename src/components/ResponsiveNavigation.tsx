
import { useState } from "react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Shield,
  Bell,
  Home,
  Search,
  Grid3X3,
  TrendingUp,
  Heart,
  PlusCircle,
  MessageCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function ResponsiveNavigation() {
  const { user, signOut, isAdmin, userRole } = useAuth();
  const device = useDeviceDetection();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Show hamburger menu for all touch devices (mobile + tablet) with fallback
  const showHamburgerMenu = device.isTouchDevice || device.isMobile || device.isTablet || device.isIPad;
  
  // Additional fallback: if window width suggests tablet/mobile, show menu anyway
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const fallbackShowMenu = windowWidth < 1024;
  
  const finalShowMenu = showHamburgerMenu || fallbackShowMenu;

  // Debug logging - same as MobileDashboardHeader
  console.log('ResponsiveNavigation Debug:', {
    showHamburgerMenu,
    fallbackShowMenu,
    finalShowMenu,
    windowWidth,
    device
  });

  const navigationItems = [
    { label: "Startseite", href: "/", icon: Home },
    { label: "Durchsuchen", href: "/browse", icon: Search },
    { label: "Kategorien", href: "/categories", icon: Grid3X3 },
    { label: "Krypto Hub", href: "/crypto-hub", icon: TrendingUp },
    { label: "Favoriten", href: "/favorites", icon: Heart },
    ...(user ? [{ label: "Anzeige erstellen", href: "/create-ad", icon: PlusCircle }] : [])
  ];

  const closeMenu = () => setIsMenuOpen(false);

  // Dynamic button and menu sizing based on device
  const getButtonSize = () => {
    if (device.isIPad) return "default";
    if (device.isTablet) return "default"; 
    return "icon";
  };

  const getMenuWidth = () => {
    if (device.isIPad) return "400px";
    if (device.isTablet) return "350px";
    return "300px";
  };

  // Force show menu if we're on a touch device or small screen
  if (!finalShowMenu) {
    console.log('ResponsiveNavigation: Menu hidden because finalShowMenu is false');
    return null;
  }

  return (
    <div className="relative z-[999]">
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size={getButtonSize()}
            className={cn(
              "hover:bg-primary/10 transition-colors duration-200 relative z-[999]",
              "border border-border/50 bg-background/95 backdrop-blur-sm",
              device.isIPad && "px-4 py-2 h-12 min-w-[48px]",
              device.isTablet && "px-3 py-2 h-10 min-w-[44px]",
              device.isMobile && "h-10 w-10",
              "shadow-sm hover:shadow-md"
            )}
            style={{ 
              display: 'flex !important',
              visibility: 'visible !important',
              opacity: 1,
              zIndex: 999
            }}
          >
            <Menu className={cn(
              "text-foreground",
              device.isIPad && "h-6 w-6",
              device.isTablet && "h-5 w-5", 
              device.isMobile && "h-5 w-5"
            )} />
            {(device.isIPad || device.isTablet) && (
              <span className="ml-2 text-foreground font-medium">Menü</span>
            )}
          </Button>
        </SheetTrigger>
        
        <SheetContent 
          side="left" 
          className="bg-background/98 backdrop-blur-xl border-r z-[1000]"
          style={{ width: getMenuWidth(), zIndex: 1000 }}
        >
          <SheetHeader className="border-b border-border/50 pb-6">
            <SheetTitle className="flex items-center gap-3 text-left">
              <div className="flex flex-col">
                <span className={cn(
                  "font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent",
                  device.isIPad && "text-xl",
                  device.isTablet && "text-lg",
                  device.isMobile && "text-base"
                )}>
                  KRYPTOANZEIGEN.DE
                </span>
                <span className={cn(
                  "text-muted-foreground font-normal",
                  device.isIPad && "text-sm",
                  device.isTablet && "text-xs",
                  device.isMobile && "text-xs"
                )}>
                  Navigation
                </span>
              </div>
            </SheetTitle>
          </SheetHeader>
          
          <div className={cn(
            "space-y-6",
            device.isIPad && "mt-8",
            device.isTablet && "mt-6",
            device.isMobile && "mt-6"
          )}>
            {/* Main Navigation */}
            <div className="space-y-2">
              <h3 className={cn(
                "font-semibold text-muted-foreground px-2",
                device.isIPad && "text-sm",
                device.isTablet && "text-xs",
                device.isMobile && "text-xs"
              )}>
                HAUPTNAVIGATION
              </h3>
              {navigationItems.map((item) => (
                <Link key={item.href} to={item.href} onClick={closeMenu}>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full justify-start gap-3 hover:bg-primary/10",
                      device.isIPad && "h-12 px-4 text-base",
                      device.isTablet && "h-10 px-3 text-sm",
                      device.isMobile && "h-10 px-3 text-sm"
                    )}
                  >
                    <item.icon className={cn(
                      device.isIPad && "h-5 w-5",
                      device.isTablet && "h-4 w-4",
                      device.isMobile && "h-4 w-4"
                    )} />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* User Section */}
            {user && (
              <div className="border-t pt-4 space-y-2">
                <h3 className={cn(
                  "font-semibold text-muted-foreground px-2",
                  device.isIPad && "text-sm",
                  device.isTablet && "text-xs", 
                  device.isMobile && "text-xs"
                )}>
                  BENUTZER
                </h3>
                
                <div className={cn(
                  "px-2 py-3 bg-muted/30 rounded-lg",
                  device.isIPad && "py-4",
                  device.isTablet && "py-3",
                  device.isMobile && "py-2"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className={cn(
                      "font-medium truncate",
                      device.isIPad && "text-base",
                      device.isTablet && "text-sm",
                      device.isMobile && "text-sm"
                    )}>
                      {user.email}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {isAdmin && (
                      <Badge variant="destructive" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {userRole || 'user'}
                    </Badge>
                  </div>
                </div>

                <Link to="/dashboard?tab=settings" onClick={closeMenu}>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full justify-start gap-3",
                      device.isIPad && "h-12 px-4",
                      device.isTablet && "h-10 px-3",
                      device.isMobile && "h-10 px-3"
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    Einstellungen
                  </Button>
                </Link>

                <Link to="/dashboard?tab=notifications" onClick={closeMenu}>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full justify-start gap-3",
                      device.isIPad && "h-12 px-4",
                      device.isTablet && "h-10 px-3", 
                      device.isMobile && "h-10 px-3"
                    )}
                  >
                    <Bell className="h-4 w-4" />
                    Benachrichtigungen
                  </Button>
                </Link>

                <Button 
                  variant="ghost" 
                  onClick={() => { signOut(); closeMenu(); }}
                  className={cn(
                    "w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10",
                    device.isIPad && "h-12 px-4",
                    device.isTablet && "h-10 px-3",
                    device.isMobile && "h-10 px-3"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Abmelden
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
