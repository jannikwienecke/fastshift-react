import { invarant, QueryDto } from '@apps-next/core';
import {
  DefaultFunctionArgs,
  GenericQueryCtx,
} from './_internal/convex.server.types';
import { ConvexRecordType } from './_internal/types.convex';
import { ConvexViewConfigManager } from './convex-view-config';

export const viewLoaderHandler = async (
  ctx: GenericQueryCtx,
  _args: DefaultFunctionArgs
): Promise<ConvexRecordType[] | null> => {
  const args = _args as QueryDto;

  const viewConfigManager = new ConvexViewConfigManager(
    args.viewConfig as any,
    args.modelConfig
  );

  invarant(Boolean(viewConfigManager), 'viewConfig is not defined');

  const searchField = viewConfigManager.getSearchableField();

  const searching = !args.query
    ? null
    : (q: { withSearchIndex: any }) =>
        q.withSearchIndex(searchField?.name, (q: any) =>
          q.search(searchField?.field, args.query)
        );

  let dbQuery = ctx.db.query(viewConfigManager.getTableName());

  dbQuery = searching ? searching(dbQuery) : dbQuery;

  return await dbQuery.collect();
};
