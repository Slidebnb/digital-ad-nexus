import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeToggle() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Sun className="h-4 w-4 transition-all" />
          <span className="sr-only">Theme wechseln</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-background border border-border shadow-lg z-50 min-w-[140px]"
      >
        <DropdownMenuItem 
          onClick={() => console.log('Light theme')}
          className="flex items-center gap-2 cursor-pointer hover:bg-muted"
        >
          <Sun className="h-4 w-4" />
          Hell
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => console.log('Dark theme')}
          className="flex items-center gap-2 cursor-pointer hover:bg-muted"
        >
          <Moon className="h-4 w-4" />
          Dunkel
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => console.log('System theme')}
          className="flex items-center gap-2 cursor-pointer hover:bg-muted"
        >
          <Monitor className="h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}