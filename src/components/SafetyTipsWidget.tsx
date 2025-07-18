import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Eye, Shield } from 'lucide-react';

export function SafetyTipsWidget() {
  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/10 dark:border-orange-800">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">
            Sicherheitshinweise
          </span>
        </div>
        
        <div className="space-y-2 text-xs text-orange-700 dark:text-orange-300">
          <div className="flex items-center gap-2">
            <Eye className="h-3 w-3" />
            <span>Treffen Sie sich nur an öffentlichen Orten</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3" />
            <span>Prüfen Sie Bewertungen vor dem Handel</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}