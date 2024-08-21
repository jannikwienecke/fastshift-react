import { invarant, MutationProps, MutationReturnType } from '@apps-next/core';
import { useConvexMutation as useConvexMutationConvex } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';

import { useConvexApi } from './_internal/useConvexApi';
import React from 'react';

export const useConvexMutation = (): MutationReturnType => {
  const api = useConvexApi();

  invarant(Boolean(api), 'convex api is not defined');

  const { mutate, isPending, mutateAsync } = useMutation({
    mutationFn: useConvexMutationConvex(api.viewMutation),
  });

  const mutateHandler = React.useCallback(
    async (props: MutationProps) => {
      return mutateAsync({
        ...props,
        mutation: {
          ...props.mutation,
          handler: undefined,
        },
      });
    },
    [mutateAsync]
  );

  return {
    mutate,
    mutateAsync: mutateHandler,
    isPending,
  };
};
