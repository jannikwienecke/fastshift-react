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
      const previousState = queryClient.getQueryData([
        QUERY_KEY_PREFIX,
        vars.viewConfig.viewName,
        '',
      ]);

      if ('handler' in vars.mutation) {
        const newState = vars.mutation.handler?.(
          (previousState as any).data || []
        );

        console.debug('newState', newState);

        queryClient.setQueryData(
          [QUERY_KEY_PREFIX, vars.viewConfig.viewName, ''],
          {
            data: newState,
          }
        );

        return {
          data: newState,
        };
      } else {
        return { previousTodos: previousState };
      }
    },
  });

  return {
    mutateAsync,
    mutate,
    isPending,
  };
};
