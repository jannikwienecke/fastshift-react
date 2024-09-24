import {
  convertFiltersForBackend,
  lldebug,
  makeQueryKey,
  Mutation,
  MutationProps,
  MutationReturnDto,
} from '@apps-next/core';
import {
  useMutation as useMutationTanstack,
  useQueryClient,
} from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import React from 'react';
import { debouncedQueryAtom, useFilterStore, useView } from '..';
import { useApi } from './use-api';

export const useMutation = () => {
  const { viewConfigManager } = useView();
  const query = useAtomValue(debouncedQueryAtom);
  const api = useApi();
  const queryClient = useQueryClient();

  const { registeredViews } = useView();
  const { filter } = useFilterStore();
  const parsedFilters = convertFiltersForBackend(filter.fitlers);

  const queryPropsMerged = React.useMemo(() => {
    return {
      query,
      registeredViews,
      modelConfig: viewConfigManager.modelConfig,
      viewConfig: viewConfigManager.viewConfig,

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      viewConfigManager: undefined,
    };
  }, [
    query,
    registeredViews,
    viewConfigManager.modelConfig,
    viewConfigManager.viewConfig,
  ]);

  const lastViewName = React.useRef('');

  const { mutate, isPending, mutateAsync, error } = useMutationTanstack({
    mutationFn: async (args: MutationProps) => {
      return await api.mutationFn?.({
        ...args,
        viewName: viewConfigManager.viewConfig.viewName,
        viewConfig: undefined,
        registeredViews: undefined,
        mutation: {
          ...args.mutation,
          handler: undefined,
        },
      });
    },
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

      // TODO: Fix This. getting and setting queryKey must happen in 1 location!
      const _queryKeyAll = api?.makeQueryOptions?.({
        ...queryPropsMerged,
        query: '',
        viewName: vars.viewConfig.viewName,
        filters: '',
      }).queryKey;

      const _queryKey = api?.makeQueryOptions?.({
        ...queryPropsMerged,
        query: vars.query,
        viewName: vars.viewConfig.viewName,
        filters: parsedFilters,
      }).queryKey;

      const queryKey =
        _queryKey ??
        makeQueryKey({
          viewName: vars.viewConfig.viewName,
          query: vars.query,
        });

      const queryKeyAll =
        _queryKeyAll ??
        makeQueryKey({
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

      if ('handler' in vars.mutation && previousState) {
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
      if (!mutateAsync) throw new Error('mutateAsync is not defined');

      try {
        const res = await mutateAsync({
          viewConfig: viewConfigManager.viewConfig,
          registeredViews,
          mutation: args.mutation,
          query,
        });
        if (!res) throw new Error('mutation failed');
        return res;
      } catch (error) {
        console.error('Error in runMutateAsync: ', error);
        return { error: (error as any)?.message };
      }
    },
    [mutateAsync, query, viewConfigManager.viewConfig, registeredViews]
  );

  const runMutate = React.useCallback(
    (args: { mutation: Mutation }) => {
      lldebug('DISPATCH MUTATION: ', args.mutation);
      return mutate({
        mutation: args.mutation,
        query,
        viewConfig: viewConfigManager.viewConfig,
        registeredViews,
      });
    },
    [mutate, query, viewConfigManager.viewConfig, registeredViews]
  );

  React.useEffect(() => {
    if (error) {
      console.log('Error in useMutation: ', error);
    }
  }, [error]);

  return {
    mutateAsync,
    mutate,
    isPending,
    runMutateAsync,
    runMutate,
  };
};
