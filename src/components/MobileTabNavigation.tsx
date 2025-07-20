
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  MessageSquare, 
  ShoppingBag, 
  Settings,
  MoreHorizontal
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
    { value: "verification", label: "Verifikation", icon: ShoppingBag },
    { value: "settings", label: "Einstellungen", icon: Settings }
  ] : [
    { value: "overview", label: "Übersicht", icon: BarChart3 },
    { value: "messages", label: "Nachrichten", icon: MessageSquare },
    { value: "ads", label: "Anzeigen", icon: ShoppingBag },
    { value: "settings", label: "Einstellungen", icon: Settings }
  ];

  const secondaryTabs = isAdmin ? [
    { value: "security", label: "Sicherheit" },
    { value: "monitor", label: "System" }
  ] : [
    { value: "favorites", label: "Favoriten" },
    { value: "trades", label: "Trades" },
    { value: "verification", label: "Verifikation" },
    { value: "notifications", label: "Benachrichtigungen" }
  ];

  return (
    <div className="flex items-center justify-between bg-background border-b border-border sticky top-0 z-30">
      <div className="flex-1 overflow-x-auto">
        <TabsList className="grid w-full grid-cols-4 h-12">
          {primaryTabs.map((tab) => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value} 
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 text-xs",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              )}
              onClick={() => onValueChange(tab.value)}
            >
              <tab.icon className="h-4 w-4" />
              <span className="truncate">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0 ml-2 mr-2">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {secondaryTabs.map((tab) => (
            <DropdownMenuItem 
              key={tab.value}
              onClick={() => onValueChange(tab.value)}
              className={cn(
                value === tab.value && "bg-primary/10 text-primary"
              )}
            >
              {tab.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
