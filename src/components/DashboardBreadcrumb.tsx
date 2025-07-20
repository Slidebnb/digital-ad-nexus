
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Home, ChevronRight } from "lucide-react";
import { MainNavigationMenu } from "@/components/MainNavigationMenu";

interface DashboardBreadcrumbProps {
  currentTab?: string;
}

export function DashboardBreadcrumb({ currentTab }: DashboardBreadcrumbProps) {
  const getTabLabel = (tab: string) => {
    const tabLabels: Record<string, string> = {
      overview: "Übersicht",
      messages: "Nachrichten", 
      ads: "Anzeigen",
      favorites: "Favoriten",
      trades: "Trades",
      verification: "Verifikation",
      notifications: "Benachrichtigungen",
      settings: "Einstellungen"
    };
    return tabLabels[tab] || tab;
  };

  return (
    <div className="hidden md:flex items-center justify-between mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Startseite
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold">
              Dashboard{currentTab && ` - ${getTabLabel(currentTab)}`}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <MainNavigationMenu
        trigger={
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            Navigation
            <ChevronRight className="h-4 w-4" />
          </Button>
        }
      />
    </div>
  );
}
