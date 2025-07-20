
import { useState, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SwipeAction {
  icon: ReactNode;
  label: string;
  color: 'primary' | 'destructive' | 'secondary';
  onAction: () => void;
}

interface SwipeActionsProps {
  children: ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export function SwipeActions({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className,
  disabled = false
}: SwipeActionsProps) {
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    setIsRevealed(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled) return;
    
    currentX.current = e.touches[0].clientX;
    const distance = currentX.current - startX.current;
    
    // Begrenzen auf verfügbare Actions
    const maxLeft = leftActions.length > 0 ? threshold * leftActions.length : 0;
    const maxRight = rightActions.length > 0 ? threshold * rightActions.length : 0;
    
    const constrainedDistance = Math.max(-maxRight, Math.min(maxLeft, distance));
    setSwipeDistance(constrainedDistance);
  };

  const handleTouchEnd = () => {
    if (disabled) return;

    const absDistance = Math.abs(swipeDistance);
    const actions = swipeDistance > 0 ? leftActions : rightActions;
    
    if (absDistance >= threshold && actions.length > 0) {
      const actionIndex = Math.min(
        Math.floor(absDistance / threshold) - 1,
        actions.length - 1
      );
      
      if (actionIndex >= 0) {
        actions[actionIndex].onAction();
      }
      
      setIsRevealed(true);
    }
    
    // Reset nach kurzer Zeit
    setTimeout(() => {
      setSwipeDistance(0);
      setIsRevealed(false);
    }, 200);
  };

  const getActionColor = (color: SwipeAction['color']) => {
    switch (color) {
      case 'primary': return 'bg-primary text-primary-foreground';
      case 'destructive': return 'bg-destructive text-destructive-foreground';
      case 'secondary': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const renderActions = (actions: SwipeAction[], side: 'left' | 'right') => {
    if (actions.length === 0) return null;

    const isVisible = side === 'left' ? swipeDistance > 0 : swipeDistance < 0;
    const progress = Math.abs(swipeDistance) / threshold;

    return (
      <div 
        className={cn(
          "absolute top-0 bottom-0 flex items-center",
          side === 'left' ? 'left-0' : 'right-0'
        )}
        style={{
          width: `${Math.abs(swipeDistance)}px`,
          transition: 'width 0.2s ease-out'
        }}
      >
        {actions.map((action, index) => {
          const actionProgress = Math.max(0, progress - index);
          const isActionVisible = actionProgress > 0;

          return (
            <div
              key={index}
              className={cn(
                "h-full flex items-center justify-center transition-all duration-200",
                getActionColor(action.color),
                side === 'right' && "ml-auto"
              )}
              style={{
                width: `${threshold}px`,
                opacity: isActionVisible ? Math.min(actionProgress, 1) : 0,
                transform: `scale(${Math.min(actionProgress, 1)})`
              }}
            >
              <div className="flex flex-col items-center gap-1">
                {action.icon}
                <span className="text-xs font-medium">{action.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Left Actions */}
      {renderActions(leftActions, 'left')}
      
      {/* Right Actions */}
      {renderActions(rightActions, 'right')}
      
      {/* Main Content */}
      <div
        className="relative z-10 transition-transform duration-200 ease-out"
        style={{
          transform: `translateX(${swipeDistance}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Beispiel Usage Hook
export function useSwipeActions() {
  const createDeleteAction = (onDelete: () => void): SwipeAction => ({
    icon: <span>🗑️</span>,
    label: "Löschen",
    color: "destructive",
    onAction: onDelete
  });

  const createFavoriteAction = (onFavorite: () => void): SwipeAction => ({
    icon: <span>❤️</span>,
    label: "Favorit",
    color: "primary",
    onAction: onFavorite
  });

  const createArchiveAction = (onArchive: () => void): SwipeAction => ({
    icon: <span>📁</span>,
    label: "Archiv",
    color: "secondary",
    onAction: onArchive
  });

  return {
    createDeleteAction,
    createFavoriteAction,
    createArchiveAction
  };
}
