import { invarant, MutationReturnType } from '@apps-next/core';
import { useConvexMutation as useConvexMutationConvex } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';

import { useConvexApi } from './_internal/useConvexApi';

export const useConvexMutation = (): MutationReturnType => {
  const api = useConvexApi();

  invarant(Boolean(api), 'convex api is not defined');

  const { mutate, isPending } = useMutation({
    mutationFn: useConvexMutationConvex(api.viewMutation),
  });

  return {
    mutate,
    isPending,
  };
};
