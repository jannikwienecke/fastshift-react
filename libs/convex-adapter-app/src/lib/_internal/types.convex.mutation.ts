import {
  Mutation,
  MutationHandlerReturnType,
  MutationPropsServer,
} from '@apps-next/core';

export type MUTATION_HANDLER_CONVEX = {
  [key in Mutation['type']]: (
    ctx: any,
    args: MutationPropsServer
  ) => Promise<MutationHandlerReturnType>;
};
