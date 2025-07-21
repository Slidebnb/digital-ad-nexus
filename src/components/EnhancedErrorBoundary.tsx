import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'page' | 'component' | 'critical';
  context?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { level = 'component', context = 'Unknown' } = this.props;
    
    // Enhanced error logging
    logger.critical(
      `Error Boundary caught error: ${error.message}`, 
      `ErrorBoundary-${context}`,
      {
        errorId: this.state.errorId,
        level,
        context,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorBoundaryProps: {
          level,
          context
        },
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    );

    this.setState({
      error,
      errorInfo
    });

    // Report to external error tracking service if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: level === 'critical',
        custom_map: {
          error_id: this.state.errorId,
          error_level: level,
          error_context: context
        }
      });
    }
  }

  private handleRetry = () => {
    logger.info(`User retrying after error`, `ErrorBoundary-${this.props.context}`, {
      errorId: this.state.errorId,
      action: 'retry'
    });
    
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: ''
    });
  };

  private handleReportError = () => {
    const { error, errorId } = this.state;
    const subject = `Fehler auf KryptoAnzeigen.de - ID: ${errorId}`;
    const body = `Hallo,\n\nIch bin auf einen Fehler gestoßen:\n\nFehler-ID: ${errorId}\nSeite: ${window.location.href}\nFehler: ${error?.message}\n\nWeitere Details:\n[Bitte beschreiben Sie, was Sie getan haben, als der Fehler auftrat]\n\nVielen Dank!`;
    
    const mailtoUrl = `mailto:support@kryptoanzeigen.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
    
    logger.info('User reported error via email', `ErrorBoundary-${this.props.context}`, {
      errorId,
      action: 'report_email'
    });
  };

  private handleGoHome = () => {
    logger.info(`User navigating home after error`, `ErrorBoundary-${this.props.context}`, {
      errorId: this.state.errorId,
      action: 'go_home'
    });
    
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { level = 'component', fallback } = this.props;
      const { error, errorId } = this.state;

      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      // Component-level error (less disruptive)
      if (level === 'component') {
        return (
          <Alert variant="destructive" className="my-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Komponente konnte nicht geladen werden</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>Es ist ein Fehler beim Laden dieser Komponente aufgetreten.</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleRetry}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Erneut versuchen
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        );
      }

      // Page or critical level error (more comprehensive)
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">
                {level === 'critical' ? 'Kritischer Fehler' : 'Etwas ist schief gelaufen'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-muted-foreground">
                <p className="mb-2">
                  {level === 'critical' 
                    ? 'Ein kritischer Fehler ist aufgetreten. Bitte kontaktieren Sie unseren Support.'
                    : 'Es ist ein unerwarteter Fehler aufgetreten. Versuchen Sie es erneut oder kehren Sie zur Startseite zurück.'
                  }
                </p>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  Fehler-ID: {errorId}
                </p>
              </div>

              {import.meta.env.DEV && error && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Entwicklungsinfo</AlertTitle>
                  <AlertDescription>
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium">Fehlerdetails anzeigen</summary>
                      <pre className="mt-2 text-xs overflow-auto max-h-40 bg-muted p-2 rounded">
                        {error.stack}
                      </pre>
                    </details>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  onClick={this.handleRetry}
                  className="gap-2"
                  size="lg"
                >
                  <RefreshCw className="h-4 w-4" />
                  Seite neu laden
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={this.handleGoHome}
                    className="gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Zur Startseite
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={this.handleReportError}
                    className="gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Fehler melden
                  </Button>
                </div>
              </div>

              <div className="text-center text-xs text-muted-foreground border-t pt-4">
                <p>
                  Wenn das Problem weiterhin besteht, kontaktieren Sie uns unter{' '}
                  <a 
                    href="mailto:support@kryptoanzeigen.de" 
                    className="text-primary hover:underline"
                  >
                    support@kryptoanzeigen.de
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Utility wrapper for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}