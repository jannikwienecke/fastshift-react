import { Mutation, MutationProps } from '@apps-next/core';

export type MUTATION_HANDLER_CONVEX = {
  [key in Mutation['type']]: (ctx: any, args: MutationProps) => Promise<any>;
};
