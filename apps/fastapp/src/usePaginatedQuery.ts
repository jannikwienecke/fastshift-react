import { PaginationOptions } from 'convex/server';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Doc } from 'packages/convex/convex/_generated/dataModel';

interface IUsePaginatedQueryProps<T> {
  queryFn?: any;
  queryKey: string[];
  initialNumItems?: number;
}

interface IUsePaginatedQueryResult<T> {
  data: T[];
  isFetching: boolean;
  observerTarget: React.RefObject<HTMLDivElement>;
  hasMore: boolean;
}

export function usePaginatedQuery<T>({
  queryFn,
  queryKey,
}: IUsePaginatedQueryProps<T>): IUsePaginatedQueryResult<T> {
  const observerTarget = useRef<HTMLDivElement>(null);
  const [paginationOptions, setPaginationOptions] = useState<PaginationOptions>(
    {
      cursor: null,
      numItems: initialNumItems,
    }
  );
  const [allItems, setAllItems] = useState<T[]>([]);

  const { data, isFetching } = useQuery({
    queryKey: [...queryKey, paginationOptions],
    queryFn: () => queryFn({ paginationOpts: paginationOptions }),
  });

  useEffect(() => {
    if (data) {
      setAllItems((prev) => [...prev, ...data.page]);
    }
  }, [data]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries?.[0]?.isIntersecting) {
          if (data && !data?.isDone) {
            setPaginationOptions((prev) => ({
              ...prev,
              cursor: data?.continueCursor ?? null,
            }));
          }
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [data]);

  return {
    data: allItems,
    isFetching,
    observerTarget,
    hasMore: data ? !data.isDone : true,
  };
}
