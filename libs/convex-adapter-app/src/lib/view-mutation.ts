import {
  ERROR_STATUS,
  ErrorStatusType,
  MutationHandlerReturnType,
  MutationPropsServer,
  MutationReturnDto,
  SuccessStatusType,
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
  const args = _args as MutationPropsServer;

  console.warn(`Mutation Handler TYPE::${args.mutation.type}`);
  const { mutation, registeredViews, viewConfigManager } = args;

  const handler = mutationHandlers[mutation.type];

  const context = {
    ...mutation,
    payload: args.mutation.payload,
    type: mutation.type,
    displayField: viewConfigManager.getDisplayFieldLabel(),
    table: viewConfigManager.getTableName(),
    view: viewConfigManager.getViewName(),
  } as const;

  let mutationRes: MutationHandlerReturnType | undefined = undefined;
  try {
    mutationRes = await handler(ctx, {
      mutation,
      viewConfigManager,
      registeredViews,
    });
  } catch (error) {
    return {
      error: {
        context,
        error: 'Unexpected error',
        message: 'Unexpected error occured in mutation handler',
        status: ERROR_STATUS.INTERNAL_SERVER_ERROR,
      },
    };
  }

  if (mutationRes.error) {
    console.error('Error in mutation: ', mutationRes.error);
    return {
      error: {
        ...mutationRes,
        context,
        error: JSON.stringify(mutationRes.error),
        status: mutationRes.status as ErrorStatusType,
      },
    };
  }

  return {
    success: {
      message: mutationRes.message,
      status: mutationRes.status as SuccessStatusType,
    },
  };
};
