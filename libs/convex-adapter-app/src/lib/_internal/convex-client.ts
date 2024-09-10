import { GenericQueryCtx } from './convex.server.types';
import { ConvexClient } from './types.convex';

export const queryClient = (
  ctx: GenericQueryCtx,
  tableName: string
): ConvexClient[string] => {
  return ctx.db.query(tableName);
};
