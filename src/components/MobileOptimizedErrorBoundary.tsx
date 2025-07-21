import React from 'react';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileOptimizedErrorBoundaryProps {
  children: React.ReactNode;
  context?: string;
}

export function MobileOptimizedErrorBoundary({ children, context }: MobileOptimizedErrorBoundaryProps) {
  const isMobile = useIsMobile();

  // Mobile-specific fallback that's less intrusive
  const mobileFallback = (
    <div className="p-4">
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="space-y-3">
          <p className="text-sm">Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-2 w-full"
          >
            <RefreshCw className="h-4 w-4" />
            Neu laden
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );

  return (
    <EnhancedErrorBoundary
      level="component"
      context={context}
      fallback={isMobile ? mobileFallback : undefined}
    >
      {children}
    </EnhancedErrorBoundary>
  );
}