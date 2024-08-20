import { useConvexMutation } from '@apps-next/convex-adapter-app';
import { DataProvider, llinfo, Mutation } from '@apps-next/core';
import { usePrismaMutation } from '@apps-next/query-adapter';
import { useGlobalConfig } from './use-global-config';
import { useView } from './use-view';

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

  return {
    ...mutation,
    mutate: (args: { mutation: Mutation }) => {
      llinfo('DISPATCH MUTATION', args.mutation);
      return mutation.mutate({
        viewConfig: viewConfigManager.viewConfig,
        mutation: args.mutation,
      });
    },
  };
};
