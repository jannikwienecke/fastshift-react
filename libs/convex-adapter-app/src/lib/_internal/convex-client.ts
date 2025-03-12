import { SearchableField } from '@apps-next/core';
import { GenericMutationCtx, GenericQueryCtx } from './convex.server.types';
import { ConvexClient } from './types.convex';

export const queryClient = (
  ctx: GenericQueryCtx,
  tableName: string
): ConvexClient[string] => {
  return ctx.db.query(tableName);
};

export const mutationClient = (
  ctx: GenericMutationCtx
): ConvexClient[string] => {
  return ctx.db;
};

export const filterByNotDeleted = (
  client: ConvexClient[string],
  indexField: SearchableField
) => {
  return client.withIndex(indexField.name, (q) =>
    q.eq(indexField.field, false)
  );
};
