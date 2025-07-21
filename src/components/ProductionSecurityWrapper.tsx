import React, { useEffect } from 'react';
import { logger } from '@/utils/logger';

interface ProductionSecurityWrapperProps {
  children: React.ReactNode;
}

export function ProductionSecurityWrapper({ children }: ProductionSecurityWrapperProps) {
  useEffect(() => {
    // Production Security Measures
    if (process.env.NODE_ENV === 'production') {
      
      // 1. Disable right-click context menu for production (optional)
      const disableRightClick = (e: MouseEvent) => {
        if (e.button === 2) {
          e.preventDefault();
          return false;
        }
      };
      
      // 2. Disable F12 and other dev tools shortcuts
      const disableDevTools = (e: KeyboardEvent) => {
        // F12 or Ctrl+Shift+I or Ctrl+Shift+J or Ctrl+U
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
            (e.ctrlKey && e.key === 'U')) {
          e.preventDefault();
          logger.warn('Dev tools access attempt blocked', 'Security');
          return false;
        }
      };
      
      // 3. Detect dev tools opening (approximate)
      let devToolsOpen = false;
      const element = new Image();
      Object.defineProperty(element, 'id', {
        get: function() {
          devToolsOpen = true;
          logger.warn('Dev tools potentially opened', 'Security');
          return 'devtools-detector';
        }
      });
      
      const checkDevTools = () => {
        console.log(element);
        if (devToolsOpen) {
          // Don't be too aggressive - just log for monitoring
          logger.warn('Dev tools detected', 'Security', {
            timestamp: Date.now(),
            userAgent: navigator.userAgent
          });
        }
        devToolsOpen = false;
      };
      
      // Uncomment these for stronger security if needed:
      // document.addEventListener('contextmenu', disableRightClick);
      // document.addEventListener('keydown', disableDevTools);
      
      // Check for dev tools periodically (less intrusive monitoring)
      const devToolsInterval = setInterval(checkDevTools, 60000); // Every minute
      
      // 4. Console warning for users
      console.log(
        '%c🚨 WARNUNG / WARNING 🚨',
        'color: #ff4444; font-size: 20px; font-weight: bold;'
      );
      console.log(
        '%cDies ist eine Browserfunktion für Entwickler. Wenn Sie aufgefordert wurden, hier etwas einzufügen, handelt es sich wahrscheinlich um einen Betrug.',
        'color: #ff6666; font-size: 14px;'
      );
      console.log(
        '%cThis is a browser feature intended for developers. If someone told you to copy and paste something here, it is likely a scam.',
        'color: #ff6666; font-size: 14px;'
      );
      
      return () => {
        clearInterval(devToolsInterval);
        // document.removeEventListener('contextmenu', disableRightClick);
        // document.removeEventListener('keydown', disableDevTools);
      };
    }
  }, []);

  useEffect(() => {
    // Content Security Policy warnings
    const checkCSP = () => {
      try {
        // Test inline script execution
        eval('1+1');
        logger.warn('CSP may not be properly configured - eval() executed', 'Security');
      } catch {
        logger.info('CSP properly blocking eval()', 'Security');
      }
    };

    // Performance monitoring
    const monitorPerformance = () => {
      const paintEntries = performance.getEntriesByType('paint');
      const navigationEntries = performance.getEntriesByType('navigation');
      
      logger.info('Performance metrics collected', 'Performance', {
        paintEntries: paintEntries.map(entry => ({
          name: entry.name,
          startTime: Math.round(entry.startTime)
        })),
        navigation: navigationEntries.length > 0 ? {
          loadStart: Math.round(navigationEntries[0].startTime),
          domContentLoaded: Math.round((navigationEntries[0] as PerformanceNavigationTiming).domContentLoadedEventEnd),
          loadComplete: Math.round((navigationEntries[0] as PerformanceNavigationTiming).loadEventEnd)
        } : null
      });
    };

    // Initial checks
    setTimeout(checkCSP, 1000);
    setTimeout(monitorPerformance, 2000);
  }, []);

  return <>{children}</>;
}