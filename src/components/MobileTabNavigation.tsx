
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  MessageSquare, 
  ShoppingBag, 
  Shield, 
  Settings, 
  Heart,
  TrendingUp,
  Bell,
  Crown,
  BarChart,
  Users,
  UserCheck,
  Activity,
  AlertTriangle
} from "lucide-react";

interface MobileTabNavigationProps {
  value: string;
  onValueChange: (value: string) => void;
  isAdmin?: boolean;
}

export function MobileTabNavigation({ value, onValueChange, isAdmin = false }: MobileTabNavigationProps) {
  const userTabs = [
    { value: "overview", label: "Übersicht", icon: BarChart3 },
    { value: "premium", label: "Premium", icon: Crown },
    { value: "messages", label: "Nachrichten", icon: MessageSquare },
    { value: "ads", label: "Anzeigen", icon: ShoppingBag },
    { value: "favorites", label: "Favoriten", icon: Heart },
    { value: "trades", label: "Trades", icon: TrendingUp },
    { value: "analytics", label: "Analytics", icon: BarChart },
    { value: "verification", label: "Verifikation", icon: Shield },
    { value: "security", label: "Sicherheit", icon: Shield },
    { value: "notifications", label: "Benachrichtigungen", icon: Bell },
    { value: "settings", label: "Einstellungen", icon: Settings },
  ];

  const adminTabs = [
    { value: "welcome", label: "Willkommen", icon: BarChart3 },
    { value: "stats", label: "Statistiken", icon: Activity },
    { value: "users", label: "Benutzer", icon: Users },
    { value: "ads-management", label: "Anzeigen", icon: ShoppingBag },
    { value: "verification", label: "Verifikation", icon: UserCheck },
    { value: "reports", label: "Reports", icon: AlertTriangle },
    { value: "crypto", label: "Krypto", icon: Crown },
    { value: "system", label: "System", icon: Settings },
    { value: "security", label: "Sicherheit", icon: Shield },
    { value: "settings", label: "Einstellungen", icon: Settings },
  ];

  const tabs = isAdmin ? adminTabs : userTabs;

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex p-1 space-x-1">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              variant={value === tab.value ? "default" : "ghost"}
              size="sm"
              onClick={() => onValueChange(tab.value)}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 min-w-fit px-3",
                value === tab.value && "bg-primary text-primary-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span className="text-xs">{tab.label}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
