import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorId: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log structured error
    console.group(`🚨 Error Boundary [${this.state.errorId}]`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Timestamp:', new Date().toISOString());
    console.error('URL:', window.location.href);
    console.error('User Agent:', navigator.userAgent);
    console.groupEnd();

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Show toast notification
    toast.error('Ein unerwarteter Fehler ist aufgetreten. Das Problem wurde gemeldet.');
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/20 to-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Ups! Etwas ist schiefgelaufen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Ein unerwarteter Fehler ist aufgetreten. Unser Team wurde automatisch benachrichtigt.
              </p>
              
              {this.state.errorId && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground text-center">
                    Fehler-ID: <code className="font-mono">{this.state.errorId}</code>
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={this.handleRetry}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Erneut versuchen
                </Button>
                <Button 
                  onClick={this.handleGoHome}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Zur Startseite
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error);
    
    // Log structured error
    const errorLog = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    console.error('Structured Error Log:', errorLog);
    
    // Show user-friendly message
    toast.error(
      context 
        ? `Fehler in ${context}: ${error.message}` 
        : `Ein Fehler ist aufgetreten: ${error.message}`
    );
  }, []);

  return { handleError };
};