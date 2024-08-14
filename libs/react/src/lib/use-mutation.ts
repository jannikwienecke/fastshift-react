import { useConvexMutation } from '@apps-next/convex-adapter-app';
import { useViewConfig } from './use-view-config';
import { Mutation, MutationProps } from '@apps-next/core';

const useQueryDict = {
  convex: useConvexMutation,
};

export const useMutation = () => {
  const _useMutation = useQueryDict['convex'];
  const { viewConfig } = useViewConfig();
  const mutation = _useMutation();

  return {
    ...mutation,
    mutate: (args: { mutation: Mutation }) => {
      return mutation.mutate({
        // TODO CLEAN UP
        viewConfig: viewConfig.viewConfig,
        mutation: args.mutation,
      });
    },
  };
};
