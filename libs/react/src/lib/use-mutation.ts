import { useConvexMutation } from '@apps-next/convex-adapter-app';
import {
  DataProvider,
  llinfo,
  Mutation,
  MutationReturnDto,
} from '@apps-next/core';
import { usePrismaMutation } from '@apps-next/query-adapter';
import { useGlobalConfig } from './use-global-config';
import { useView } from './use-view';
import React from 'react';

const useQueryDict: {
  [key in DataProvider]: typeof useConvexMutation;
} = {
  convex: useConvexMutation,
  prisma: usePrismaMutation,
};

export const useMutation = () => {
  const { viewConfigManager } = useView();
  const globalConfig = useGlobalConfig();
  const _useMutation = useQueryDict[globalConfig?.provider];
  const mutation = _useMutation();

  const { mutate, mutateAsync } = mutation;

  const runMutateAsync = React.useCallback(
    async (args: { mutation: Mutation }): Promise<MutationReturnDto> => {
      llinfo('DISPATCH MUTATION', args.mutation);
      try {
        return await mutateAsync({
          viewConfig: viewConfigManager.viewConfig,
          mutation: args.mutation,
        });
      } catch (error) {
        console.error('Error in runMutateAsync: ', error);
        return { error: (error as any)?.message, succes: false };
      }
    },
    [mutateAsync, viewConfigManager.viewConfig]
  );

  const runMutate = React.useCallback(
    (args: { mutation: Mutation }) => {
      llinfo('DISPATCH MUTATION', args.mutation);
      return mutate({
        viewConfig: viewConfigManager.viewConfig,
        mutation: args.mutation,
      });
    },
    [mutate, viewConfigManager.viewConfig]
  );

  return {
    ...mutation,
    mutateAsync: runMutateAsync,
    mutate: runMutate,
  };
};
