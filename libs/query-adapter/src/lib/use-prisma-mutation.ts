import { MutationReturnType, QUERY_KEY_PREFIX } from '@apps-next/core';
import { useMutation } from '@tanstack/react-query';
import { usePrismaApi } from './use-prisma-api';
import { queryClient } from './prisma-query-provider';

export const usePrismaMutation = (): MutationReturnType => {
  const prisma = usePrismaApi();

  const { mutate, isPending, mutateAsync } = useMutation({
    mutationFn: prisma.viewMutation,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onMutate: async (vars) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: [QUERY_KEY_PREFIX, vars.viewConfig.viewName, ''],
      });

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData([
        QUERY_KEY_PREFIX,
        vars.viewConfig.viewName,
        '',
      ]);

      if ('handler' in vars.mutation) {
        const newTodos = vars.mutation.handler?.(
          (previousTodos as any).data || []
        );

        queryClient.setQueryData(
          [QUERY_KEY_PREFIX, vars.viewConfig.viewName, ''],
          {
            data: newTodos,
          }
        );

        return {
          data: newTodos,
        };
      }

      // Optimistically update to the new value

      // Return a context object with the snapshotted value
      return { previousTodos };
    },
  });

  return {
    mutateAsync,
    mutate,
    isPending,
  };
};
