import { useRef, useCallback } from "react";

interface InfiniteScrollProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loadMore: () => void;
  message: string;
  hasMore: boolean;
  isLoading: boolean;
}

export default function InfiniteScroll<T>({
  data,
  renderItem,
  loadMore,
  message,
  hasMore,
  isLoading,
}: InfiniteScrollProps<T>) {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, loadMore],
  );

  return (
    <div>
      {data.map((item, index) => {
        const isLast = index === data.length - 1;

        if (isLast) {
          return (
            <div ref={lastItemRef} key={index}>
              {renderItem(item, index)}
            </div>
          );
        }

        return <div key={index}>{renderItem(item, index)}</div>;
      })}

      {isLoading && (
        <div className="flex justify-center py-4">Loading...</div>
      )}

      {!hasMore && (
        <div className="text-center text-gray-400 py-4">
          {message}
        </div>
      )}
    </div>
  );
}