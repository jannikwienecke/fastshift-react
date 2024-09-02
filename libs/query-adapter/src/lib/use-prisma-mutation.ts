import { makeQueryKey, MutationReturnType } from '@apps-next/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { usePrismaApi } from './use-prisma-api';

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
      const { previousState, previousStateAll } = (context as any) || {};

      const queryKey = makeQueryKey({
        viewName: lastViewName.current,
        query: variables.query,
      });

      const queryKeyAll = makeQueryKey({
        viewName: lastViewName.current,
        query: variables.query,
      });

      queryClient.setQueryData(queryKey, previousState);
      queryClient.setQueryData(queryKeyAll, previousStateAll);
    },
    onMutate: async (vars) => {
      lastViewName.current = vars.viewConfig.viewName;

      const queryKey = makeQueryKey({
        viewName: vars.viewConfig.viewName,
        query: vars.query,
      });

      const queryKeyAll = makeQueryKey({
        viewName: vars.viewConfig.viewName,
      });

      await queryClient.cancelQueries({
        queryKey: queryKey,
      });

      await queryClient.cancelQueries({
        queryKey: queryKeyAll,
      });

      const previousState = queryClient.getQueryData(queryKey);
      const previousStateAll = queryClient.getQueryData(queryKeyAll);

      if ('handler' in vars.mutation) {
        const newState = vars.mutation.handler?.(
          (previousState as any).data || []
        );

        queryClient.setQueryData(queryKey, {
          data: newState,
        });

        queryClient.setQueryData(queryKeyAll, {
          data: newState,
        });

        return {
          previousState,
          previousStateAll,
        };
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
