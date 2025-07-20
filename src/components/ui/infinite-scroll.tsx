
import { useEffect, useRef, useCallback, ReactNode } from "react";
import { SkeletonLoader } from "./skeleton-loader";

interface InfiniteScrollProps {
  children: ReactNode;
  hasNextPage: boolean;
  isFetching: boolean;
  fetchNextPage: () => void;
  threshold?: number;
  loadingComponent?: ReactNode;
  endMessage?: ReactNode;
  className?: string;
}

export function InfiniteScroll({
  children,
  hasNextPage,
  isFetching,
  fetchNextPage,
  threshold = 100,
  loadingComponent,
  endMessage,
  className
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  const handleIntersection = useCallback(
    ([entry]: IntersectionObserverEntry[]) => {
      if (entry.isIntersecting && hasNextPage && !isFetching) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetching, fetchNextPage]
  );

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: `${threshold}px`
    });

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [handleIntersection, threshold]);

  const defaultLoadingComponent = (
    <div className="py-4">
      <SkeletonLoader variant="list" count={3} />
    </div>
  );

  const defaultEndMessage = (
    <div className="text-center py-8 text-muted-foreground">
      <div className="text-4xl mb-2">🎉</div>
      <p>Das war's! Keine weiteren Inhalte verfügbar.</p>
    </div>
  );

  return (
    <div className={className}>
      {children}
      
      {hasNextPage && (
        <div ref={sentinelRef}>
          {isFetching && (loadingComponent || defaultLoadingComponent)}
        </div>
      )}
      
      {!hasNextPage && (endMessage || defaultEndMessage)}
    </div>
  );
}

// Hook für Infinite Scroll mit React Query
export function useInfiniteScroll<T>(
  queryFn: ({ pageParam }: { pageParam: number }) => Promise<{
    data: T[];
    nextPage?: number;
    hasNextPage: boolean;
  }>,
  queryKey: string[]
) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey,
    queryFn,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1
  });

  const items = data?.pages.flatMap(page => page.data) ?? [];

  return {
    items,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetching,
    isLoading,
    error
  };
}
