import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { logger } from '@/utils/logger';

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

export function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log critical error
    logger.critical(error.message, 'global-error-boundary', {
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'global'
    });
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}