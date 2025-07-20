
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Button } from "@/components/ui/button";

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
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-2 py-2">
        <div className="flex-1 overflow-x-auto">
          <div className="flex items-center min-w-max">
            {primaryTabs.map((tab) => (
              <Button
                key={tab.value}
                variant={value === tab.value ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 h-auto min-w-[70px] mx-1",
                  "text-xs transition-all duration-200",
                  value === tab.value 
                    ? "bg-primary text-primary-foreground shadow-sm scale-105" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => onValueChange(tab.value)}
              >
                <tab.icon className="h-4 w-4" />
                <span className="truncate leading-tight">{tab.label}</span>
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
                "shrink-0 ml-2 h-10 w-10",
                secondaryTabs.some(tab => tab.value === value) && "bg-primary/10 text-primary"
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 bg-background border shadow-lg z-[60]"
          >
            {secondaryTabs.map((tab) => (
              <DropdownMenuItem 
                key={tab.value}
                onClick={() => onValueChange(tab.value)}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
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
