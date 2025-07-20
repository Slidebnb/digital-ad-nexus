import { createContext, useContext, useState, ReactNode } from 'react';
import { toast as sonnerToast } from 'sonner';
import { logger } from '@/utils/logger';

interface ToastContextType {
  showToast: (options: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success' | 'warning';
    duration?: number;
  }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = ({
    title,
    description,
    variant = 'default',
    duration = 4000
  }: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success' | 'warning';
    duration?: number;
  }) => {
    // Log toast for analytics
    logger.info('Toast shown', 'ToastProvider', { title, variant });

    switch (variant) {
      case 'destructive':
        sonnerToast.error(title, { description, duration });
        break;
      case 'success':
        sonnerToast.success(title, { description, duration });
        break;
      case 'warning':
        sonnerToast.warning(title, { description, duration });
        break;
      default:
        sonnerToast(title, { description, duration });
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useAppToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useAppToast must be used within a ToastProvider');
  }
  return context;
}