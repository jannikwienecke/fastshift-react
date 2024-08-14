import { invarant, MutationProps, QueryDto, QueryProps } from '@apps-next/core';
import {
  DefaultFunctionArgs,
  GenericQueryCtx,
} from './_internal/convex.server.types';
import { ConvexRecordType } from './_internal/types.convex';
import { ConvexViewConfigManager } from './convex-view-config';
import { mutationHandlers } from './_internal/convex-mutation-handler';

export const viewLoaderHandler = async (
  ctx: GenericQueryCtx,
  _args: DefaultFunctionArgs
): Promise<ConvexRecordType[] | null> => {
  const args = _args as QueryDto;

  const viewConfigManager = new ConvexViewConfigManager(args.viewConfig as any);

  invarant(Boolean(viewConfigManager), 'viewConfig is not defined');

  const searchField = viewConfigManager?.getSearchableField();
  const searching =
    args.query === ''
      ? null
      : (q: { withSearchIndex: any }) =>
          q.withSearchIndex(searchField?.name, (q: any) =>
            q.search(searchField?.field, args.query)
          );

  let dbQuery = ctx.db.query(viewConfigManager.getTableName());

  dbQuery = searching ? searching(dbQuery) : dbQuery;

  return await dbQuery.collect();
};

export const viewMutationHandler = async (
  ctx: GenericQueryCtx,
  _args: DefaultFunctionArgs
): Promise<null> => {
  const args = _args as MutationProps;

  const viewConfigManager = new ConvexViewConfigManager(args.viewConfig);
  const { mutation } = args;

  const handler = mutationHandlers[mutation.type];

  await handler(ctx, {
    mutation,
    viewConfigManager,
  });
  return null;
};
