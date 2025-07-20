
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Search, 
  PlusCircle, 
  MessageCircle, 
  User,
  Heart,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  requireAuth?: boolean;
}

export function BottomNavigation() {
  const location = useLocation();
  const { user } = useAuth();

  const navItems: NavItem[] = [
    {
      label: "Start",
      href: "/",
      icon: Home
    },
    {
      label: "Suchen",
      href: "/browse",
      icon: Search
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
      badge: 0, // TODO: Add unread count
      requireAuth: true
    },
    {
      label: "Profil",
      href: user ? "/dashboard" : "/login",
      icon: User
    }
  ];

  // Filter items based on auth state
  const visibleItems = navItems.filter(item => !item.requireAuth || user);

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                "min-w-0 flex-1 max-w-[80px]",
                active 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "h-5 w-5",
                  active && "scale-110"
                )} />
                
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </Badge>
                )}
              </div>
              
              <span className={cn(
                "text-xs font-medium truncate",
                active && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Alternative Compact Version
export function CompactBottomNavigation() {
  const location = useLocation();
  const { user } = useAuth();

  const quickActions = [
    { icon: Home, href: "/", label: "Home" },
    { icon: Search, href: "/browse", label: "Suchen" },
    { icon: TrendingUp, href: "/crypto-hub", label: "Krypto" },
    user && { icon: Heart, href: "/favorites", label: "Favoriten" },
    user && { icon: MessageCircle, href: "/dashboard", label: "Chats" }
  ].filter(Boolean) as { icon: React.ComponentType<any>, href: string, label: string }[];

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-background/95 backdrop-blur-lg border rounded-2xl p-3 shadow-lg">
        <div className="flex items-center justify-around">
          {quickActions.map(({ icon: Icon, href, label }) => (
            <Link
              key={href}
              to={href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                location.pathname === href || (href !== "/" && location.pathname.startsWith(href))
                  ? "text-primary bg-primary/10 scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
