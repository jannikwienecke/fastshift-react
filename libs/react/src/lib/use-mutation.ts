import { _log, lldebug, MutationDto, MutationReturnDto } from '@apps-next/core';
import { useMutation as useMutationTanstack } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';
import { store$ } from '..';
import { useApi } from './use-api';
import { isDetail } from './legend-store/legend.utils';

// const isDev = import.meta.env.MODE === 'development';

export const useMutation = () => {
  const api = useApi();

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
      _log.debug('Mutation success');
    },

    onError: (error) => {
      _log.error(`Error in mutation: `, error);
    },

    onMutate: async (vars) => {
      console.debug('onMutate: ', vars.mutation);
      store$.state.set('invalidated');

      store$.mutating.mutation.set(vars.mutation);

      const viewMutation = vars.mutation.type === 'NEW_USER_VIEW_MUTATION';

      const queryClient = store$.api.queryClient.get();

      if (!viewMutation) {
        setTimeout(() => {
          queryClient?.cancelQueries?.();
          try {
            (queryClient as any)?.clear?.();
          } catch (error) {
            console.debug('Error in clear: ', error);
          }

          try {
            (queryClient as any)?.removeQueries?.({});
          } catch (error) {
            console.debug('Error in removeQueries: ', error);
          }

          const cache = queryClient?.getQueryCache?.();

          try {
            cache?.clear();
          } catch (error) {
            console.debug('Error in clear: ', error);
          }
        }, 50);
      }

      if (
        vars.mutation.type !== 'UPDATE_RECORD' &&
        vars.mutation.type !== 'SELECT_RECORDS'
      )
        return;
      const detail = store$.detail.get();
      const key =
        isDetail() && detail?.row?.id
          ? `detail-${detail.row.id}`
          : vars.viewName;

      store$.ignoreNextQueryDict.set((prev) => {
        const prevKey = prev[key];
        if (prevKey) {
          return { ...prev, [key]: prevKey + 1 };
        }

        return { ...prev, [key]: 1 };
      });
    },
  });

  const runMutateAsync = React.useCallback(
    async (args: MutationDto): Promise<MutationReturnDto> => {
      if (!mutateAsync) throw new Error('mutateAsync is not defined');

      try {
        // if (isDev) {
        //   await new Promise((resolve) => setTimeout(resolve, 750));
        // }

        const res = await mutateAsync(args);

        if (!res) throw new Error('mutation failed');

        if (res.error) {
          console.error('Error in mutation: ', res.error);
        }

        return res;
      } catch (error) {
        toast.error(
          (error as Error | undefined)?.message || 'Unexpected error'
        );

        throw error;
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
      _log.error('Error in useMutation: ', error);
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
