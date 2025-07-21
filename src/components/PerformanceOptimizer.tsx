import React, { useEffect, useState } from 'react';
import { logger } from '@/utils/logger';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

interface PerformanceMetrics {
  renderTime: number;
  loadTime: number;
  interactionTime: number;
  memoryUsage?: number;
}

export function PerformanceOptimizer({ children }: PerformanceOptimizerProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    loadTime: 0,
    interactionTime: 0
  });

  useEffect(() => {
    const startTime = performance.now();

    // Measure initial render time
    const measureRender = () => {
      const renderTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, renderTime }));
      
      logger.debug('Component render time measured', 'Performance', {
        renderTime: Math.round(renderTime),
        threshold: renderTime > 100 ? 'slow' : renderTime > 50 ? 'moderate' : 'fast'
      });
    };

    // Measure load time
    const measureLoad = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        setMetrics(prev => ({ ...prev, loadTime }));
        
        logger.info('Page load time measured', 'Performance', {
          loadTime: Math.round(loadTime),
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
          threshold: loadTime > 3000 ? 'slow' : loadTime > 1500 ? 'moderate' : 'fast'
        });
      }
    };

    // Measure memory usage (if available)
    const measureMemory = () => {
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        const memoryUsage = memoryInfo.usedJSHeapSize / 1024 / 1024; // MB
        setMetrics(prev => ({ ...prev, memoryUsage }));
        
        logger.debug('Memory usage measured', 'Performance', {
          memoryUsageMB: Math.round(memoryUsage),
          totalMemoryMB: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024),
          memoryLimitMB: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024),
          threshold: memoryUsage > 100 ? 'high' : memoryUsage > 50 ? 'moderate' : 'low'
        });
      }
    };

    // Measure interaction time (First Input Delay approximation)
    const measureInteraction = () => {
      const handleFirstInteraction = () => {
        const interactionTime = performance.now() - startTime;
        setMetrics(prev => ({ ...prev, interactionTime }));
        
        logger.debug('First interaction time measured', 'Performance', {
          interactionTime: Math.round(interactionTime),
          threshold: interactionTime > 100 ? 'slow' : 'fast'
        });
        
        // Remove listeners after first interaction
        ['click', 'touchstart', 'keydown'].forEach(event => {
          document.removeEventListener(event, handleFirstInteraction);
        });
      };

      ['click', 'touchstart', 'keydown'].forEach(event => {
        document.addEventListener(event, handleFirstInteraction);
      });
    };

    // Setup measurements
    setTimeout(measureRender, 0);
    setTimeout(measureLoad, 100);
    setTimeout(measureMemory, 1000);
    measureInteraction();

    // Performance monitoring interval
    const performanceInterval = setInterval(() => {
      // Monitor Core Web Vitals
      try {
        // Largest Contentful Paint
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
          const lcp = lcpEntries[lcpEntries.length - 1];
          logger.debug('LCP measured', 'Performance', {
            lcp: Math.round(lcp.startTime),
            threshold: lcp.startTime > 2500 ? 'poor' : lcp.startTime > 1200 ? 'needs_improvement' : 'good'
          });
        }

        // Cumulative Layout Shift
        const clsEntries = performance.getEntriesByType('layout-shift');
        if (clsEntries.length > 0) {
          const cls = clsEntries.reduce((sum, entry: any) => sum + entry.value, 0);
          logger.debug('CLS measured', 'Performance', {
            cls: Math.round(cls * 1000) / 1000,
            threshold: cls > 0.25 ? 'poor' : cls > 0.1 ? 'needs_improvement' : 'good'
          });
        }

        // Memory usage monitoring
        measureMemory();
        
      } catch (error) {
        logger.warn('Performance monitoring error', 'Performance', { error: error.message });
      }
    }, 30000); // Every 30 seconds

    // Cleanup
    return () => {
      clearInterval(performanceInterval);
    };
  }, []);

  // Performance degradation detection
  useEffect(() => {
    const { renderTime, loadTime, memoryUsage } = metrics;
    
    // Alert on performance issues
    if (renderTime > 200) {
      logger.warn('Slow render time detected', 'Performance', { renderTime });
    }
    
    if (loadTime > 5000) {
      logger.warn('Slow page load detected', 'Performance', { loadTime });
    }
    
    if (memoryUsage && memoryUsage > 150) {
      logger.warn('High memory usage detected', 'Performance', { memoryUsage });
    }
  }, [metrics]);

  // Performance-based optimizations
  useEffect(() => {
    // Reduce animations on slow devices
    const isSlowDevice = metrics.renderTime > 100 || metrics.loadTime > 3000;
    
    if (isSlowDevice) {
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
      logger.info('Reduced animations for slow device', 'Performance');
    }

    // Preload critical resources on fast connections
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const isFastConnection = connection.effectiveType === '4g' || connection.downlink > 2;
      
      if (isFastConnection) {
        // Preload critical fonts
        const fontLink = document.createElement('link');
        fontLink.rel = 'preload';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
        fontLink.as = 'style';
        document.head.appendChild(fontLink);
        
        logger.debug('Preloaded fonts for fast connection', 'Performance');
      }
    }
  }, [metrics]);

  return <>{children}</>;
}