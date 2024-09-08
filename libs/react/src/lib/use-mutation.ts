import {
  lldebug,
  makeQueryKey,
  Mutation,
  MutationReturnDto,
} from '@apps-next/core';
import {
  useMutation as useMutationTanstack,
  useQueryClient,
} from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import React from 'react';
import { debouncedQueryAtom, useView } from '..';
import { useApi } from './use-api';

export const useMutation = () => {
  const { viewConfigManager } = useView();
  const query = useAtomValue(debouncedQueryAtom);
  const api = useApi();
  const queryClient = useQueryClient();

  const lastViewName = React.useRef('');

  const { mutate, isPending, mutateAsync } = useMutationTanstack({
    mutationFn: api.viewMutation,
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

  const runMutateAsync = React.useCallback(
    async (args: { mutation: Mutation }): Promise<MutationReturnDto> => {
      lldebug('DISPATCH MUTATION2', args.mutation);
      try {
        return await mutateAsync({
          viewConfig: viewConfigManager.viewConfig,
          mutation: args.mutation,
          query,
        });
        return Promise.resolve({} as any);
      } catch (error) {
        console.error('Error in runMutateAsync: ', error);
        return { error: (error as any)?.message };
      }
    },
    [mutateAsync, query, viewConfigManager.viewConfig]
  );

  const runMutate = React.useCallback(
    (args: { mutation: Mutation }) => {
      lldebug('DISPATCH MUTATION: ', args.mutation);
      return mutate({
        viewConfig: viewConfigManager.viewConfig,
        mutation: args.mutation,
        query,
      });
    },
    [mutate, query, viewConfigManager.viewConfig]
  );

  return {
    mutateAsync,
    mutate,
    isPending,
    runMutateAsync,
    runMutate,
  };
};
