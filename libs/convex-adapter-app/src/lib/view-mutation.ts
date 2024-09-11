import {
  BaseViewConfigManager,
  MutationProps,
  MutationReturnDto,
} from '@apps-next/core';
import { mutationHandlers } from './_internal/convex-mutation-handler';
import {
  DefaultFunctionArgs,
  GenericQueryCtx,
} from './_internal/convex.server.types';

export const viewMutationHandler = async (
  ctx: GenericQueryCtx,
  _args: DefaultFunctionArgs
): Promise<MutationReturnDto> => {
  const args = _args as MutationProps;

  const viewConfigManager = new BaseViewConfigManager(args.viewConfig);
  const { mutation } = args;

  const handler = mutationHandlers[mutation.type];

  console.warn('viewMutationHandler', { mutation });

  await handler(ctx, {
    mutation,
    viewConfigManager,
  });

  return {
    success: {
      message: '200',
      status: 200 as const,
    },
  };
};
