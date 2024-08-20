import { MutationReturnType } from '@apps-next/core';
import { useMutation } from '@tanstack/react-query';
import { usePrismaApi } from './use-prisma-api';
import { queryClient } from './prisma-query-provider';

export const usePrismaMutation = (): MutationReturnType => {
  const prisma = usePrismaApi();

  const { mutate, isPending } = useMutation({
    mutationFn: prisma.viewMutation,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  return {
    mutate,
    isPending,
  };
};
