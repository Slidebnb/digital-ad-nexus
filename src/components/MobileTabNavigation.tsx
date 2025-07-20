
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  MessageSquare, 
  ShoppingBag, 
  Settings,
  MoreHorizontal,
  Heart,
  TrendingUp,
  Shield,
  Bell
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileTabNavigationProps {
  value: string;
  onValueChange: (value: string) => void;
  isAdmin?: boolean;
}

export function MobileTabNavigation({ 
  value, 
  onValueChange, 
  isAdmin = false 
}: MobileTabNavigationProps) {
  const device = useDeviceDetection();
  
  // Show tab navigation for touch devices
  const showTabNavigation = device.isTouchDevice || device.isMobile || device.isTablet;

  if (!showTabNavigation) {
    return null;
  }

  const primaryTabs = isAdmin ? [
    { value: "overview", label: "Übersicht", icon: BarChart3 },
    { value: "users", label: "Nutzer", icon: MessageSquare },
    { value: "verification", label: "Verifikation", icon: Shield },
    { value: "settings", label: "Einstellungen", icon: Settings }
  ] : [
    { value: "overview", label: "Übersicht", icon: BarChart3 },
    { value: "messages", label: "Nachrichten", icon: MessageSquare },
    { value: "ads", label: "Anzeigen", icon: ShoppingBag },
    { value: "settings", label: "Einstellungen", icon: Settings }
  ];

  const secondaryTabs = isAdmin ? [
    { value: "security", label: "Sicherheit", icon: Shield },
    { value: "monitor", label: "System", icon: BarChart3 }
  ] : [
    { value: "favorites", label: "Favoriten", icon: Heart },
    { value: "trades", label: "Trades", icon: TrendingUp },
    { value: "verification", label: "Verifikation", icon: Shield },
    { value: "notifications", label: "Benachrichtigungen", icon: Bell }
  ];

  return (
    <div className={cn(
      "sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm",
      device.isIPad && "py-3",
      device.isTablet && "py-2",
      device.isMobile && "py-2"
    )}>
      <div className={cn(
        "flex items-center justify-between",
        device.isIPad && "px-6",
        device.isTablet && "px-4",
        device.isMobile && "px-2"
      )}>
        <div className="flex-1 overflow-x-auto">
          <div className={cn(
            "flex items-center min-w-max",
            device.isIPad && "gap-2",
            device.isTablet && "gap-1",
            device.isMobile && "gap-1"
          )}>
            {primaryTabs.map((tab) => (
              <Button
                key={tab.value}
                variant={value === tab.value ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex flex-col items-center gap-1 h-auto transition-all duration-200",
                  device.isIPad && "px-4 py-3 min-w-[90px]",
                  device.isTablet && "px-3 py-2 min-w-[75px]",
                  device.isMobile && "px-3 py-2 min-w-[70px]",
                  "mx-1 text-xs",
                  value === tab.value 
                    ? "bg-primary text-primary-foreground shadow-sm scale-105" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => onValueChange(tab.value)}
              >
                <tab.icon className={cn(
                  device.isIPad && "h-5 w-5",
                  device.isTablet && "h-4 w-4",
                  device.isMobile && "h-4 w-4"
                )} />
                <span className={cn(
                  "truncate leading-tight",
                  device.isIPad && "text-xs",
                  device.isTablet && "text-xs",
                  device.isMobile && "text-xs"
                )}>
                  {tab.label}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "shrink-0 ml-2",
                device.isIPad && "h-12 w-12",
                device.isTablet && "h-10 w-10",
                device.isMobile && "h-10 w-10",
                secondaryTabs.some(tab => tab.value === value) && "bg-primary/10 text-primary"
              )}
            >
              <MoreHorizontal className={cn(
                device.isIPad && "h-5 w-5",
                device.isTablet && "h-4 w-4",
                device.isMobile && "h-4 w-4"
              )} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className={cn(
              "bg-background border shadow-lg z-[60]",
              device.isIPad && "w-52",
              device.isTablet && "w-48",
              device.isMobile && "w-48"
            )}
          >
            {secondaryTabs.map((tab) => (
              <DropdownMenuItem 
                key={tab.value}
                onClick={() => onValueChange(tab.value)}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  device.isIPad && "py-3 px-3",
                  device.isTablet && "py-2 px-2",
                  device.isMobile && "py-2 px-2",
                  value === tab.value && "bg-primary/10 text-primary font-medium"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
