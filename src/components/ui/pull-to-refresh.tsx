
import { useState, useRef, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  className,
  disabled = false
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
    setIsPulling(false);
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    currentY.current = e.touches[0].clientY;
    const distance = Math.max(0, currentY.current - startY.current);

    if (distance > 10) {
      setIsPulling(true);
      setPullDistance(Math.min(distance, threshold * 1.5));
      
      // Verhindern, dass die Seite gescrollt wird
      e.preventDefault();
    }
  }, [disabled, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing || !isPulling) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
  }, [disabled, isRefreshing, isPulling, pullDistance, threshold, onRefresh]);

  const refreshProgress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: isPulling ? `translateY(${Math.min(pullDistance / 2, threshold / 2)}px)` : undefined,
        transition: isPulling ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull Indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-background/90 backdrop-blur-sm z-10"
          style={{
            transform: `translateY(-100%) translateY(${isPulling ? pullDistance / 2 : 0}px)`,
            opacity: Math.max(0.3, refreshProgress)
          }}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw 
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                isRefreshing && "animate-spin",
                shouldTrigger && !isRefreshing && "text-primary"
              )}
              style={{
                transform: `rotate(${refreshProgress * 180}deg)`
              }}
            />
            <span className="text-sm font-medium">
              {isRefreshing 
                ? "Wird aktualisiert..." 
                : shouldTrigger 
                  ? "Loslassen zum Aktualisieren" 
                  : "Ziehen zum Aktualisieren"
              }
            </span>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}

// Hook für Pull-to-Refresh Funktionalität
export function usePullToRefresh(refreshFn: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshFn();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshFn]);

  return {
    isRefreshing,
    handleRefresh
  };
}
