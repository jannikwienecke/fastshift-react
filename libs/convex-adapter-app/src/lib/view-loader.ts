import { invarant, MutationProps, QueryProps } from '@apps-next/core';
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
  const args = _args as QueryProps;

  const { query, viewConfig }: QueryProps = {
    query: args.query as string,
    viewConfig: new ConvexViewConfigManager(args.viewConfig as any),
  };

  invarant(Boolean(viewConfig), 'viewConfig is not defined');

  const searchField = viewConfig?.getSearchableField();
  console.log({ searchField });
  const searching =
    _args['query'] === ''
      ? null
      : (q: { withSearchIndex: any }) =>
          q.withSearchIndex(searchField?.name, (q: any) =>
            q.search(searchField?.field, query as string)
          );

  let dbQuery = ctx.db.query(viewConfig.getTableName());

  dbQuery = searching ? searching(dbQuery) : dbQuery;

  return await dbQuery.collect();
};

export const viewMutationHandler = async (
  ctx: GenericQueryCtx,
  _args: DefaultFunctionArgs
): Promise<null> => {
  const args = _args as MutationProps;

  console.log(_args);

  const { mutation, viewConfig }: MutationProps = {
    ...args,
    viewConfig: new ConvexViewConfigManager(args.viewConfig as any),
  };

  const handler = mutationHandlers[mutation.type];

  await handler(ctx, {
    mutation,
    viewConfig,
  });
  return null;
};
