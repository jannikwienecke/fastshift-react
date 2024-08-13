import { QueryProps } from '@apps-next/core';
import { FilterBuilder } from 'convex/server';
import { DefaultFunctionArgs, GenericQueryCtx } from './convex.server.types';
import { ConvexRecordType } from './types.convex';

export const viewLoaderHandler = async (
  ctx: GenericQueryCtx,
  args: DefaultFunctionArgs
): Promise<ConvexRecordType[] | null> => {
  const _args = args as QueryProps;

  const filterQuery =
    _args.query === ''
      ? (q: FilterBuilder<any>) => q.not(q.eq(q.field('name'), ''))
      : (q: FilterBuilder<any>) => q.eq(q.field('name'), _args?.query);

  return await ctx.db
    .query(_args.viewConfig?.tableName)
    .filter(filterQuery)
    .collect();
};
