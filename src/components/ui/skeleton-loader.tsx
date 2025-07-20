
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'card' | 'text' | 'avatar' | 'button' | 'list';
  count?: number;
  animated?: boolean;
}

export function SkeletonLoader({ 
  className, 
  variant = 'card', 
  count = 1,
  animated = true 
}: SkeletonLoaderProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return "h-32 w-full rounded-lg";
      case 'text':
        return "h-4 w-3/4 rounded";
      case 'avatar':
        return "h-12 w-12 rounded-full";
      case 'button':
        return "h-10 w-24 rounded-md";
      case 'list':
        return "h-16 w-full rounded-lg";
      default:
        return "h-4 w-full rounded";
    }
  };

  const baseClasses = cn(
    "bg-muted",
    animated && "animate-pulse",
    getVariantClasses(),
    className
  );

  if (count === 1) {
    return <div className={baseClasses} />;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={baseClasses} />
      ))}
    </div>
  );
}

// Spezielle Skeleton-Komponenten für häufige Use-Cases
export function AdCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="gradient-card p-6 rounded-lg">
          <div className="flex items-start gap-4">
            <SkeletonLoader variant="avatar" />
            <div className="flex-1 space-y-2">
              <SkeletonLoader className="h-6 w-3/4" />
              <SkeletonLoader className="h-4 w-full" />
              <SkeletonLoader className="h-4 w-1/2" />
            </div>
            <SkeletonLoader className="h-8 w-20" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <SkeletonLoader className="h-24 rounded" />
            <SkeletonLoader className="h-24 rounded" />
            <SkeletonLoader className="h-24 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function UserListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
          <SkeletonLoader variant="avatar" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader className="h-4 w-32" />
            <SkeletonLoader className="h-3 w-48" />
          </div>
          <SkeletonLoader className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

export function MessageSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn(
          "flex gap-3",
          i % 2 === 0 ? "justify-start" : "justify-end flex-row-reverse"
        )}>
          <SkeletonLoader variant="avatar" className="h-8 w-8" />
          <div className="max-w-xs space-y-2">
            <SkeletonLoader className="h-12 w-48 rounded-xl" />
            <SkeletonLoader className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
