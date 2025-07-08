import { useEffect } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
}

export function MobilePerformanceOptimizer() {
  useEffect(() => {
    // Optimize touch interactions
    const optimizeTouchTargets = () => {
      const touchElements = document.querySelectorAll('button, a, [role="button"]');
      touchElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.height < 44 || rect.width < 44) {
          (element as HTMLElement).style.minHeight = '44px';
          (element as HTMLElement).style.minWidth = '44px';
        }
      });
    };

    // Optimize scroll performance
    const optimizeScrolling = () => {
      document.documentElement.style.setProperty('-webkit-overflow-scrolling', 'touch');
      document.documentElement.style.setProperty('scroll-behavior', 'smooth');
    };

    // Optimize image loading
    const optimizeImages = () => {
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        if (!img.loading) {
          img.loading = 'lazy';
        }
        if (!img.decoding) {
          img.decoding = 'async';
        }
      });
    };

    // Performance monitoring
    const measurePerformance = (): PerformanceMetrics => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        renderTime: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        interactionTime: navigation.domInteractive - navigation.fetchStart
      };
    };

    // Apply optimizations
    optimizeTouchTargets();
    optimizeScrolling();
    optimizeImages();

    // Monitor performance in development
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        const metrics = measurePerformance();
        console.log('Mobile Performance Metrics:', metrics);
      }, 2000);
    }

    // Re-optimize on content changes
    const observer = new MutationObserver(() => {
      optimizeTouchTargets();
      optimizeImages();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  return null;
}