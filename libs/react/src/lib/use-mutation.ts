import {
  llinfo,
  Mutation,
  MutationReturnDto,
  MutationReturnType,
} from '@apps-next/core';
import { atom, useAtomValue } from 'jotai';
import React from 'react';
import { debouncedQueryAtom } from './ui-components';
import { useView } from './use-view';

type UseMutationAdapter = () => MutationReturnType;

export const useMutationAtom = atom<UseMutationAdapter>(
  {} as UseMutationAdapter
);

export const useMutation = () => {
  const { viewConfigManager } = useView();
  const query = useAtomValue(debouncedQueryAtom);

  const useMutationAdapter = useAtomValue(
    useMutationAtom
  ) as UseMutationAdapter;
  const mutation = useMutationAdapter();

  const { mutate, mutateAsync } = mutation;

  const runMutateAsync = React.useCallback(
    async (args: { mutation: Mutation }): Promise<MutationReturnDto> => {
      llinfo('DISPATCH MUTATION2', args.mutation);
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
      llinfo('DISPATCH MUTATION: ', args.mutation);
      return mutate({
        viewConfig: viewConfigManager.viewConfig,
        mutation: args.mutation,
        query,
      });
    },
    [mutate, query, viewConfigManager.viewConfig]
  );

  return {
    ...{},
    mutateAsync: runMutateAsync,
    mutate: runMutate,
  };
};
