
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Search, 
  PlusCircle, 
  MessageCircle, 
  User,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMessagesRealtime } from "@/hooks/useMessagesRealtime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function MobileBottomNavigation() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { unreadCount } = useMessagesRealtime();

  const navItems = [
    {
      label: "Start",
      href: "/",
      icon: Home,
      showAlways: true
    },
    {
      label: "Suchen", 
      href: "/browse",
      icon: Search,
      showAlways: true
    },
    {
      label: "Erstellen",
      href: "/create-ad", 
      icon: PlusCircle,
      requireAuth: true
    },
    {
      label: "Chats",
      href: "/dashboard",
      icon: MessageCircle,
      badge: unreadCount,
      requireAuth: true
    },
    {
      label: "Profil",
      href: user ? "/dashboard" : "/login",
      icon: User,
      showAlways: true
    }
  ];

  // Filter items based on auth state
  const visibleItems = navItems.filter(item => 
    item.showAlways || (item.requireAuth && user)
  );

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all duration-200",
                "min-w-0 flex-1 max-w-[80px] relative",
                active 
                  ? "text-primary bg-primary/10 scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  active && "scale-110"
                )} />
                
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </Badge>
                )}
              </div>
              
              <span className={cn(
                "text-xs font-medium truncate leading-tight",
                active && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
        
        {/* Logout button for authenticated users */}
        {user && (
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all duration-200",
              "min-w-0 flex-1 max-w-[80px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            )}
          >
            <LogOut className="h-5 w-5" />
            <span className="text-xs font-medium truncate leading-tight">
              Abmelden
            </span>
          </Button>
        )}
      </div>
    </nav>
  );
}
