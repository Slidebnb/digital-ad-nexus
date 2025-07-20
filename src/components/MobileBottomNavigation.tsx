
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Search, 
  PlusCircle, 
  MessageCircle, 
  User,
  LogOut,
  BarChart3,
  ShoppingBag,
  Heart
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useMessagesRealtime } from "@/hooks/useMessagesRealtime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";

export function MobileBottomNavigation() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const device = useDeviceDetection();
  const { unreadCount, loading: messagesLoading } = useMessagesRealtime();

  logger.debug('MobileBottomNavigation render', 'Navigation', { 
    unreadCount, 
    messagesLoading, 
    userId: user?.id 
  });

  // Only show for touch devices
  const showBottomNav = device.isTouchDevice || device.isMobile || device.isTablet;

  if (!showBottomNav) {
    return null;
  }

  // Check if we're on dashboard and extract current tab
  const isDashboard = location.pathname === '/dashboard';
  const searchParams = new URLSearchParams(location.search);
  const currentDashboardTab = searchParams.get('tab') || 'overview';

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
    // Show dashboard navigation when on dashboard, otherwise show general navigation
    ...(user && isDashboard ? [
      {
        label: "Übersicht",
        href: "/dashboard?tab=overview",
        icon: BarChart3,
        requireAuth: true,
        isDashboardTab: true,
        active: currentDashboardTab === 'overview'
      },
      {
        label: "Chats",
        href: "/dashboard?tab=messages",
        icon: MessageCircle,
        badge: unreadCount,
        requireAuth: true,
        loading: messagesLoading,
        isDashboardTab: true,
        active: currentDashboardTab === 'messages'
      },
      {
        label: "Profil",
        href: "/dashboard?tab=settings",
        icon: User,
        requireAuth: true,
        isDashboardTab: true,
        active: currentDashboardTab === 'settings'
      }
    ] : [
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
        requireAuth: true,
        loading: messagesLoading
      },
      {
        label: "Profil",
        href: user ? "/dashboard" : "/login",
        icon: User,
        showAlways: true
      }
    ])
  ];

  // Filter items based on auth state
  const visibleItems = navItems.filter(item => 
    item.showAlways || (item.requireAuth && user)
  );

  const isActive = (href: string, item?: any) => {
    if (item?.isDashboardTab) {
      return item.active;
    }
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href.split('?')[0]);
  };

  const handleSignOut = async () => {
    try {
      logger.info('User signing out', 'Navigation', { userId: user?.id });
      await signOut();
    } catch (error) {
      logger.error('Sign out failed', 'Navigation', { error });
    }
  };

  // Dynamic sizing based on device
  const getNavHeight = () => {
    if (device.isIPad) return "h-20";
    if (device.isTablet) return "h-16";
    return "h-16";
  };

  const getButtonSize = () => {
    if (device.isIPad) return "max-w-[90px]";
    if (device.isTablet) return "max-w-[80px]";
    return "max-w-[70px]";
  };

  const getIconSize = () => {
    if (device.isIPad) return "h-6 w-6";
    if (device.isTablet) return "h-5 w-5";
    return "h-5 w-5";
  };

  const getTextSize = () => {
    if (device.isIPad) return "text-sm";
    if (device.isTablet) return "text-xs";
    return "text-xs";
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50 safe-area-pb",
      getNavHeight()
    )}>
      <div className={cn(
        "flex items-center justify-around",
        device.isIPad && "px-2 py-3",
        device.isTablet && "px-1 py-2",
        device.isMobile && "px-1 py-2"
      )}>
        {visibleItems.slice(0, 5).map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.href, item);
          
          return (
            <Link
              key={`${item.href}-${index}`}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg transition-all duration-200",
                "min-w-0 flex-1 relative",
                device.isIPad && "px-3 py-3",
                device.isTablet && "px-2 py-2",
                device.isMobile && "px-2 py-2",
                getButtonSize(),
                active 
                  ? "text-primary bg-primary/10 scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon className={cn(
                  getIconSize(),
                  "transition-transform duration-200",
                  active && "scale-110"
                )} />
                
                {item.badge !== undefined && item.badge > 0 && !item.loading && (
                  <Badge 
                    variant="destructive" 
                    className={cn(
                      "absolute -top-2 -right-2 p-0 flex items-center justify-center animate-pulse",
                      device.isIPad && "h-5 w-5 text-xs",
                      device.isTablet && "h-4 w-4 text-xs",
                      device.isMobile && "h-4 w-4 text-xs"
                    )}
                    aria-label={`${item.badge} ungelesene Nachrichten`}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </Badge>
                )}

                {item.loading && (
                  <div className={cn(
                    "absolute -top-2 -right-2 rounded-full bg-muted animate-pulse",
                    device.isIPad && "h-5 w-5",
                    device.isTablet && "h-4 w-4",
                    device.isMobile && "h-4 w-4"
                  )} />
                )}
              </div>
              
              <span className={cn(
                "font-medium truncate leading-tight",
                getTextSize(),
                active && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
        
        {/* Logout button for authenticated users when not on dashboard */}
        {user && !isDashboard && visibleItems.length < 5 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg transition-all duration-200",
              "min-w-0 flex-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              device.isIPad && "px-3 py-3",
              device.isTablet && "px-2 py-2",
              device.isMobile && "px-2 py-2",
              getButtonSize()
            )}
            aria-label="Abmelden"
          >
            <LogOut className={getIconSize()} />
            <span className={cn(
              "font-medium truncate leading-tight",
              getTextSize()
            )}>
              Abmelden
            </span>
          </Button>
        )}
      </div>
    </nav>
  );
}
