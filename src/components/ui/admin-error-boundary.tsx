
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Bug, Mail } from "lucide-react";
import { logger } from "@/utils/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
  retryCount: number;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: '',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `admin-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
      retryCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || `admin-error-${Date.now()}`;
    
    // Log comprehensive error information
    logger.error('Admin component error boundary triggered', 'AdminErrorBoundary', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to monitoring service (would be implemented in production)
    this.reportError(error, errorInfo, errorId);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo, errorId: string) => {
    // In production, this would send to error monitoring service
    console.group(`🚨 Admin Error Report - ${errorId}`);
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Retry Count:', this.state.retryCount);
    console.groupEnd();
  };

  private handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    
    logger.info('Admin error boundary retry attempted', 'AdminErrorBoundary', {
      errorId: this.state.errorId,
      retryCount: newRetryCount
    });

    this.setState({
      hasError: false,
      error: null,
      retryCount: newRetryCount
    });
  };

  private handleReportIssue = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount
    };

    // In production, this would open support ticket or email
    const mailtoLink = `mailto:support@example.com?subject=Admin Dashboard Error&body=${encodeURIComponent(
      `Error ID: ${errorDetails.errorId}\n` +
      `Message: ${errorDetails.message}\n` +
      `Timestamp: ${errorDetails.timestamp}\n` +
      `Retry Count: ${errorDetails.retryCount}\n\n` +
      `Please describe what you were doing when this error occurred:`
    )}`;
    
    window.open(mailtoLink);
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default admin error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Admin Dashboard Fehler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-semibold">
                      Ein unerwarteter Fehler ist aufgetreten
                    </div>
                    <div className="text-sm">
                      Error ID: <code className="bg-muted px-1 rounded">{this.state.errorId}</code>
                    </div>
                    {this.state.error && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium">
                          Technische Details anzeigen
                        </summary>
                        <div className="mt-2 p-3 bg-muted rounded text-xs font-mono break-all">
                          <div><strong>Fehler:</strong> {this.state.error.message}</div>
                          {this.state.error.stack && (
                            <div className="mt-2">
                              <strong>Stack Trace:</strong>
                              <pre className="whitespace-pre-wrap text-xs mt-1">
                                {this.state.error.stack}
                              </pre>
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Erneut versuchen
                  {this.state.retryCount > 0 && (
                    <span className="ml-2 text-xs">
                      (Versuch {this.state.retryCount + 1})
                    </span>
                  )}
                </Button>
                
                <Button 
                  onClick={this.handleReportIssue} 
                  variant="outline" 
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Problem melden
                </Button>
              </div>

              {this.state.retryCount >= 3 && (
                <Alert>
                  <AlertDescription className="text-sm">
                    <strong>Mehrere Versuche fehlgeschlagen.</strong><br />
                    Bitte laden Sie die Seite neu oder kontaktieren Sie den Support.
                    <Button 
                      variant="link" 
                      className="p-0 ml-2 h-auto"
                      onClick={() => window.location.reload()}
                    >
                      Seite neu laden
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience wrapper with admin-specific error handling
export const withAdminErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => (
    <AdminErrorBoundary>
      <Component {...props} />
    </AdminErrorBoundary>
  );
};
