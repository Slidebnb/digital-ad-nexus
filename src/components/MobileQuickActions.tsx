import { Button } from '@/components/ui/button';
import { Plus, Search, MessageCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function MobileQuickActions() {
  const { user } = useAuth();

  return (
    <div className="md:hidden fixed bottom-20 left-4 right-4 z-40">
      <div className="bg-background/95 backdrop-blur-sm border rounded-2xl p-3 shadow-lg">
        <div className="grid grid-cols-4 gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-col h-16 p-2"
          >
            <Link to="/browse">
              <Search className="h-4 w-4 mb-1" />
              <span className="text-xs">Suchen</span>
            </Link>
          </Button>
          
          {user && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-col h-16 p-2"
            >
              <Link to="/create-ad">
                <Plus className="h-4 w-4 mb-1" />
                <span className="text-xs">Erstellen</span>
              </Link>
            </Button>
          )}
          
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-col h-16 p-2"
          >
            <Link to="/crypto-hub">
              <TrendingUp className="h-4 w-4 mb-1" />
              <span className="text-xs">Krypto</span>
            </Link>
          </Button>
          
          {user ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-col h-16 p-2"
            >
              <Link to="/dashboard">
                <MessageCircle className="h-4 w-4 mb-1" />
                <span className="text-xs">Chats</span>
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="default"
              size="sm"
              className="flex-col h-16 p-2"
            >
              <Link to="/login">
                <MessageCircle className="h-4 w-4 mb-1" />
                <span className="text-xs">Login</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}