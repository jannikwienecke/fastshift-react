import { MutationReturnType, QUERY_KEY_PREFIX } from '@apps-next/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePrismaApi } from './use-prisma-api';
import React from 'react';

export const usePrismaMutation = (): MutationReturnType => {
  const prisma = usePrismaApi();
  const queryClient = useQueryClient();

  const lastViewName = React.useRef('');

  const { mutate, isPending, mutateAsync } = useMutation({
    mutationFn: prisma.viewMutation,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(
        [QUERY_KEY_PREFIX, lastViewName.current, ''],
        context
      );
    },
    onMutate: async (vars) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)

      lastViewName.current = vars.viewConfig.viewName;

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

        queryClient.setQueryData(
          [QUERY_KEY_PREFIX, vars.viewConfig.viewName, ''],
          {
            data: newState,
          }
        );

        return previousState;
      } else {
        return previousState;
      }
    },
  });

  return {
    mutateAsync,
    mutate,
    isPending,
  };
};
