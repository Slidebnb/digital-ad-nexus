
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function QuickActionWidget() {
  const { user } = useAuth();

  return (
    <Card className="border-accent/20 bg-accent/5">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-3">Schnellzugriff</h3>
        
        <div className="space-y-2">
          <Button 
            asChild 
            size="sm" 
            className="w-full justify-start h-8"
          >
            <Link to="/browse">
              <Search className="h-3 w-3 mr-2" />
              Anzeigen durchsuchen
            </Link>
          </Button>
          
          {user && (
            <Button 
              asChild 
              variant="outline" 
              size="sm" 
              className="w-full justify-start h-8"
            >
              <Link to="/create-ad">
                <Plus className="h-3 w-3 mr-2" />
                Anzeige erstellen
              </Link>
            </Button>
          )}
          
          {!user && (
            <Button 
              asChild 
              variant="outline" 
              size="sm" 
              className="w-full justify-start h-8"
            >
              <Link to="/login">
                <MessageCircle className="h-3 w-3 mr-2" />
                Anmelden
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
