import { useConvexMutation } from '@apps-next/convex-adapter-app';
import { llinfo, Mutation } from '@apps-next/core';
import { useViewConfig } from './use-view-config';

const useQueryDict = {
  convex: useConvexMutation,
};

export const useMutation = () => {
  const _useMutation = useQueryDict['convex'];
  const { viewConfigManager } = useViewConfig();
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
