import { api } from '@apps-next/convex';
import { convexQuery } from '@convex-dev/react-query';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import {
  FunctionReference,
  PaginationOptions,
  PaginationResult,
} from 'convex/server';
import { Doc } from 'packages/convex/convex/_generated/dataModel';
import React, { useRef } from 'react';

export const Route = createFileRoute('/todos')({
  component: () => <TodosComponent />,
});

const usePaginatedQuery = <T,>(
  props: (
    options: PaginationOptions
  ) => ReturnType<typeof convexQuery<FunctionReference<'query'>>>
) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  const [entries, setAllEntries] = React.useState<T[]>([]);

  const [paginationOptions, setPaginationOptions] =
    React.useState<PaginationOptions>({ cursor: null, numItems: 100 });

  const { data, isFetching, isFetched }: UseQueryResult<PaginationResult<T>> =
    useQuery(props(paginationOptions));

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (data) {
      setAllEntries((prev) => [...prev, ...data.page]);
    }
  }, [data]);

  return {
    ...data,
    isFetching,
    entries,
    observerTarget,
    isFetched,
  };
};

const TodosComponent = () => {
  const { entries, observerTarget, isFetched, isDone } = usePaginatedQuery<
    Doc<'todos'>
  >((options) =>
    convexQuery(api.todos.todos, {
      paginationOpts: {
        ...options,
        id: 5,
      },
    })
  );

  return (
    <div className="p-4">
      <div className="space-y-4">
        {entries?.map((todo) => (
          <div
            key={todo._id}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            {todo.name}
          </div>
        ))}
      </div>

      <div
        ref={observerTarget}
        className="h-10 flex items-center justify-center"
      >
        {isFetched && !isDone && <div>No more todos</div>}
      </div>
    </div>
  );
};
