import { useEffect } from 'react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export function NetworkMonitor() {
  useEffect(() => {
    // Monitor network status
    const handleOnline = () => {
      logger.info('Network connection restored', 'network-monitor');
      toast.success('Internetverbindung wiederhergestellt');
    };

    const handleOffline = () => {
      logger.warn('Network connection lost', 'network-monitor');
      toast.error('Internetverbindung unterbrochen');
    };

    // Performance monitoring
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          logger.info('Page load performance', 'network-monitor', {
            loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            firstPaint: navEntry.responseEnd - navEntry.requestStart
          });
        }
        
        if (entry.entryType === 'measure') {
          logger.debug('Performance measure', 'network-monitor', {
            name: entry.name,
            duration: entry.duration
          });
        }
      }
    });

    // Intercept fetch requests for monitoring
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof URL ? args[0].href : args[0].url;
      const method = args[1]?.method || 'GET';
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;
        
        logger.logNetworkRequest(url, method, duration, response.status);
        
        // Log slow requests
        if (duration > 3000) {
          logger.warn('Slow network request detected', 'network-monitor', {
            url,
            method,
            duration,
            status: response.status
          });
        }
        
        return response;
      } catch (error) {
        const duration = performance.now() - start;
        logger.logNetworkRequest(url, method, duration, 0, (error as Error).message);
        throw error;
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    observer.observe({ entryTypes: ['navigation', 'measure'] });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      observer.disconnect();
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}