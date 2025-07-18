import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, CheckCircle, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function SecurityWidget() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Sicherheit</span>
          <Badge variant="secondary" className="ml-auto text-xs">
            Verifiziert
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="flex flex-col items-center gap-1">
            <Lock className="h-3 w-3 text-success" />
            <span className="text-xs text-muted-foreground">SSL</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CheckCircle className="h-3 w-3 text-success" />
            <span className="text-xs text-muted-foreground">KYC</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Eye className="h-3 w-3 text-success" />
            <span className="text-xs text-muted-foreground">DSGVO</span>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Ihre Daten sind sicher verschlüsselt
        </p>
      </CardContent>
    </Card>
  );
}