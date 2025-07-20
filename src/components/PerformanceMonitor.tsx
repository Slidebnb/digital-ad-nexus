
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { 
  Activity,
  Zap,
  Gauge,
  Wifi,
  HardDrive,
  Clock
} from "lucide-react";

interface WebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

interface PerformanceMetrics {
  webVitals: WebVitals;
  networkInfo: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  bundleSize: number;
  renderTime: number;
  memoryUsage?: {
    used: number;
    total: number;
  };
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    webVitals: {},
    networkInfo: {},
    bundleSize: 0,
    renderTime: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const { user, userRole } = useAuth();

  // Nur für Admins oder Development sichtbar
  const canViewMetrics = userRole === 'admin' || process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!canViewMetrics) return;

    // Web Vitals sammeln
    const collectWebVitals = () => {
      // Core Web Vitals über Web Vitals Library
      if ('web-vitals' in window) {
        // Implementation would use web-vitals library
        console.log('Web Vitals collection would be implemented here');
      }

      // Performance API nutzen
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        const fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
        const ttfb = navigation.responseStart - navigation.requestStart;

        setMetrics(prev => ({
          ...prev,
          webVitals: {
            ...prev.webVitals,
            fcp,
            ttfb
          },
          renderTime: navigation.loadEventEnd - navigation.loadEventStart
        }));
      }
    };

    // Netzwerk-Infos sammeln
    const collectNetworkInfo = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      if (connection) {
        setMetrics(prev => ({
          ...prev,
          networkInfo: {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
          }
        }));
      }
    };

    // Memory Usage (falls verfügbar)
    const collectMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: {
            used: memory.usedJSHeapSize / 1024 / 1024, // MB
            total: memory.totalJSHeapSize / 1024 / 1024 // MB
          }
        }));
      }
    };

    // Bundle Size schätzen
    const estimateBundleSize = () => {
      const scripts = document.querySelectorAll('script[src]');
      let totalSize = 0;
      
      scripts.forEach(script => {
        // Grobe Schätzung basierend auf typischen Bundle-Größen
        totalSize += 200; // KB pro Script (Schätzung)
      });

      setMetrics(prev => ({
        ...prev,
        bundleSize: totalSize
      }));
    };

    // Daten sammeln
    collectWebVitals();
    collectNetworkInfo();
    collectMemoryInfo();
    estimateBundleSize();

    // Regelmäßige Updates
    const interval = setInterval(() => {
      collectNetworkInfo();
      collectMemoryInfo();
    }, 5000);

    return () => clearInterval(interval);
  }, [canViewMetrics]);

  if (!canViewMetrics) return null;

  const getPerformanceScore = () => {
    const { webVitals } = metrics;
    let score = 100;
    
    // LCP Score (Ziel: < 2.5s)
    if (webVitals.lcp) {
      if (webVitals.lcp > 4000) score -= 30;
      else if (webVitals.lcp > 2500) score -= 15;
    }
    
    // FID Score (Ziel: < 100ms)
    if (webVitals.fid) {
      if (webVitals.fid > 300) score -= 25;
      else if (webVitals.fid > 100) score -= 10;
    }
    
    // CLS Score (Ziel: < 0.1)
    if (webVitals.cls) {
      if (webVitals.cls > 0.25) score -= 20;
      else if (webVitals.cls > 0.1) score -= 10;
    }

    return Math.max(0, score);
  };

  const performanceScore = getPerformanceScore();
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 p-2 bg-background border rounded-full shadow-lg hover:bg-muted transition-colors"
      >
        <Activity className="h-4 w-4" />
      </button>

      {/* Performance Panel */}
      {isVisible && (
        <Card className="w-80 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Gauge className="h-4 w-4" />
              Performance Monitor
              <Badge 
                variant="outline" 
                className={getScoreColor(performanceScore)}
              >
                {performanceScore}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {/* Core Web Vitals */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Core Web Vitals
              </h4>
              <div className="space-y-2">
                {metrics.webVitals.fcp && (
                  <div className="flex justify-between">
                    <span>FCP:</span>
                    <span className={metrics.webVitals.fcp > 1800 ? "text-red-500" : "text-green-500"}>
                      {Math.round(metrics.webVitals.fcp)}ms
                    </span>
                  </div>
                )}
                {metrics.webVitals.lcp && (
                  <div className="flex justify-between">
                    <span>LCP:</span>
                    <span className={metrics.webVitals.lcp > 2500 ? "text-red-500" : "text-green-500"}>
                      {Math.round(metrics.webVitals.lcp)}ms
                    </span>
                  </div>
                )}
                {metrics.webVitals.cls !== undefined && (
                  <div className="flex justify-between">
                    <span>CLS:</span>
                    <span className={metrics.webVitals.cls > 0.1 ? "text-red-500" : "text-green-500"}>
                      {metrics.webVitals.cls.toFixed(3)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Network Info */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                Netzwerk
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Typ:</span>
                  <span>{metrics.networkInfo.effectiveType || 'Unbekannt'}</span>
                </div>
                {metrics.networkInfo.downlink && (
                  <div className="flex justify-between">
                    <span>Speed:</span>
                    <span>{metrics.networkInfo.downlink} Mbps</span>
                  </div>
                )}
                {metrics.networkInfo.rtt && (
                  <div className="flex justify-between">
                    <span>RTT:</span>
                    <span>{metrics.networkInfo.rtt}ms</span>
                  </div>
                )}
              </div>
            </div>

            {/* Memory Usage */}
            {metrics.memoryUsage && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  Speicher
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Verwendet:</span>
                    <span>{metrics.memoryUsage.used.toFixed(1)} MB</span>
                  </div>
                  <Progress 
                    value={(metrics.memoryUsage.used / metrics.memoryUsage.total) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            )}

            {/* Bundle Info */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Lade-Metriken
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Bundle:</span>
                  <span>{metrics.bundleSize} KB</span>
                </div>
                <div className="flex justify-between">
                  <span>Render:</span>
                  <span>{Math.round(metrics.renderTime)}ms</span>
                </div>
                {metrics.webVitals.ttfb && (
                  <div className="flex justify-between">
                    <span>TTFB:</span>
                    <span>{Math.round(metrics.webVitals.ttfb)}ms</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Hook für Performance Tracking
export function usePerformanceTracking() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    webVitals: {},
    networkInfo: {},
    bundleSize: 0,
    renderTime: 0
  });

  useEffect(() => {
    // Performance Observer für kontinuierliche Messung
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('Performance entry:', entry.name, entry.duration);
        }
      });

      observer.observe({ entryTypes: ['measure', 'navigation'] });

      return () => observer.disconnect();
    }
  }, []);

  const trackCustomMetric = (name: string, duration: number) => {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(`${name}-start`);
      setTimeout(() => {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
      }, duration);
    }
  };

  return {
    metrics,
    trackCustomMetric
  };
}
