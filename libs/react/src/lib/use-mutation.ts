import {
  convertFiltersForBackend,
  lldebug,
  makeQueryKey,
  Mutation,
  MutationDto,
  MutationReturnDto,
} from '@apps-next/core';
import {
  useMutation as useMutationTanstack,
  useQueryClient,
} from '@tanstack/react-query';
import React from 'react';
import { store$, useView } from '..';
import { useApi } from './use-api';

export const useMutation = () => {
  const { viewConfigManager } = useView();

  const query = store$.globalQueryDebounced.get();
  const api = useApi();
  const queryClient = useQueryClient();

  const { registeredViews } = useView();
  const filters = store$.filter.filters.get();
  const parsedFilters = convertFiltersForBackend(filters);

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
    mutationFn: async (args: MutationDto) => {
      return await api.mutationFn?.({
        viewName: args.viewName,
        mutation: {
          ...args.mutation,
          handler: undefined,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },

    onError: () => {
      queryClient.invalidateQueries();
      queryClient.resetQueries();
    },

    onMutate: async (vars) => {
      lastViewName.current = vars.viewName;

      // TODO: Fix This. getting and setting queryKey must happen in 1 location!
      const _queryKeyAll = api?.makeQueryOptions?.({
        ...queryPropsMerged,
        query: '',
        viewName: vars.viewName,
        filters: '',
      }).queryKey;

      const _queryKey = api?.makeQueryOptions?.({
        ...queryPropsMerged,
        query: vars.query,
        viewName: vars.viewName,
        filters: parsedFilters,
      }).queryKey;

      const queryKey =
        _queryKey ??
        makeQueryKey({
          viewName: vars.viewName,
          query: vars.query,
        });

      const queryKeyAll =
        _queryKeyAll ??
        makeQueryKey({
          viewName: vars.viewName,
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
    async (args: MutationDto): Promise<MutationReturnDto> => {
      if (!mutateAsync) throw new Error('mutateAsync is not defined');

      try {
        const res = await mutateAsync(args);
        if (!res) throw new Error('mutation failed');
        return res;
      } catch (error) {
        return { error: (error as any)?.message };
      }
    },
    [mutateAsync]
  );

  const runMutate = React.useCallback(
    (args: MutationDto) => {
      lldebug('DISPATCH MUTATION: ', args.mutation);
      return mutate(args);
    },
    [mutate]
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
