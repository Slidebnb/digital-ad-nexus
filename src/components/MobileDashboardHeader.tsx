
import { useAuth } from "@/hooks/useAuth";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  LogOut, 
  Settings, 
  Shield,
  Bell
} from "lucide-react";
import { ResponsiveNavigation } from "@/components/ResponsiveNavigation";
import { cn } from "@/lib/utils";

export function MobileDashboardHeader() {
  const { user, signOut, isAdmin, userRole } = useAuth();
  const device = useDeviceDetection();

  // Show header for touch devices (mobile + tablet)
  const showMobileHeader = device.isTouchDevice || device.isMobile || device.isTablet;

  if (!showMobileHeader) {
    return null;
  }

  return (
    <div className={cn(
      "sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm",
      device.isIPad && "h-16",
      device.isTablet && "h-14", 
      device.isMobile && "h-14"
    )}>
      <div className={cn(
        "flex items-center justify-between",
        device.isIPad && "px-6 py-4",
        device.isTablet && "px-4 py-3",
        device.isMobile && "px-4 py-3"
      )}>
        <div className="flex items-center gap-3">
          {/* Responsive Navigation Menu */}
          <ResponsiveNavigation />
          
          <div className="flex items-center gap-2">
            <h1 className={cn(
              "font-bold",
              device.isIPad && "text-xl",
              device.isTablet && "text-lg",
              device.isMobile && "text-lg"
            )}>
              Dashboard
            </h1>
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size={device.isIPad ? "default" : "icon"}
              className={cn(
                "relative hover:bg-primary/10",
                device.isIPad && "px-4 py-2 h-12",
                device.isTablet && "h-10 w-10",
                device.isMobile && "h-10 w-10"
              )}
            >
              <User className={cn(
                device.isIPad && "h-5 w-5",
                device.isTablet && "h-5 w-5",
                device.isMobile && "h-5 w-5"
              )} />
              {device.isIPad && (
                <span className="ml-2">Profil</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className={cn(
              "bg-background border shadow-lg z-50",
              device.isIPad && "w-64",
              device.isTablet && "w-56",
              device.isMobile && "w-56"
            )}
          >
            <div className={cn(
              "px-2 py-1.5",
              device.isIPad && "px-3 py-2"
            )}>
              <p className={cn(
                "font-medium truncate",
                device.isIPad && "text-base",
                device.isTablet && "text-sm",
                device.isMobile && "text-sm"
              )}>
                {user?.email}
              </p>
              <p className={cn(
                "text-muted-foreground",
                device.isIPad && "text-sm",
                device.isTablet && "text-xs",
                device.isMobile && "text-xs"
              )}>
                {isAdmin ? 'Administrator' : 'Benutzer'}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className={cn(
              device.isIPad && "py-3 px-3",
              device.isTablet && "py-2 px-2",
              device.isMobile && "py-2 px-2"
            )}>
              <Settings className="h-4 w-4 mr-2" />
              Einstellungen
            </DropdownMenuItem>
            <DropdownMenuItem className={cn(
              device.isIPad && "py-3 px-3",
              device.isTablet && "py-2 px-2", 
              device.isMobile && "py-2 px-2"
            )}>
              <Bell className="h-4 w-4 mr-2" />
              Benachrichtigungen
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={signOut} 
              className={cn(
                "text-destructive focus:text-destructive",
                device.isIPad && "py-3 px-3",
                device.isTablet && "py-2 px-2",
                device.isMobile && "py-2 px-2"
              )}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
