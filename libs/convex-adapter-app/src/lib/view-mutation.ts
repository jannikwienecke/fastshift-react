import { MutationProps, MutationReturnDto } from '@apps-next/core';
import { mutationHandlers } from './_internal/convex-mutation-handler';
import {
  DefaultFunctionArgs,
  GenericQueryCtx,
} from './_internal/convex.server.types';
import { ConvexViewConfigManager } from './convex-view-config';

export const viewMutationHandler = async (
  ctx: GenericQueryCtx,
  _args: DefaultFunctionArgs
): Promise<MutationReturnDto> => {
  console.log('viewMutationHandler');

  const args = _args as MutationProps;

  const viewConfigManager = new ConvexViewConfigManager(args.viewConfig);
  const { mutation } = args;

  const handler = mutationHandlers[mutation.type];

  await handler(ctx, {
    mutation,
    viewConfigManager,
  });

  return { succes: true };
};
