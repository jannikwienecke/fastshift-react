import { invarant, QueryProps } from '@apps-next/core';
import { DefaultFunctionArgs, GenericQueryCtx } from './convex.server.types';
import { ConvexRecordType } from './types.convex';
import { ConvexViewConfigManager } from './convex-view-config';

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
  const searching =
    _args.query === ''
      ? null
      : (q: { withSearchIndex: any }) =>
          q.withSearchIndex(searchField?.name, (q: any) =>
            q.search(searchField?.field, query as string)
          );

  let dbQuery = ctx.db.query(viewConfig.getTableName());

  dbQuery = searching ? searching(dbQuery) : dbQuery;

  return await dbQuery.collect();
};
