
import { Link } from "react-router-dom";
import { 
  Home, 
  Search, 
  Grid3X3, 
  TrendingUp, 
  Heart,
  PlusCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface MainNavigationMenuProps {
  trigger: React.ReactNode;
  align?: "start" | "center" | "end";
}

export function MainNavigationMenu({ trigger, align = "end" }: MainNavigationMenuProps) {
  const mainNavItems = [
    {
      label: "Startseite",
      href: "/",
      icon: Home,
      description: "Zurück zur Hauptseite"
    },
    {
      label: "Durchsuchen",
      href: "/browse",
      icon: Search,
      description: "Alle Anzeigen durchsuchen"
    },
    {
      label: "Kategorien",
      href: "/categories",
      icon: Grid3X3,
      description: "Nach Kategorien stöbern"
    },
    {
      label: "Krypto Hub",
      href: "/crypto-hub",
      icon: TrendingUp,
      description: "Kryptowährungen & Trading"
    },
    {
      label: "Favoriten",
      href: "/favorites",
      icon: Heart,
      description: "Gespeicherte Anzeigen"
    },
    {
      label: "Anzeige erstellen",
      href: "/create-ad",
      icon: PlusCircle,
      description: "Neue Anzeige aufgeben"
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-64">
        {mainNavItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={item.href}>
              <DropdownMenuItem asChild>
                <Link 
                  to={item.href}
                  className="flex items-center gap-3 p-3 cursor-pointer"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                </Link>
              </DropdownMenuItem>
              {index < mainNavItems.length - 1 && <DropdownMenuSeparator />}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
