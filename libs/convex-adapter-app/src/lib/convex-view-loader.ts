import {
  DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY,
  invarant,
  QueryDto,
  QueryRelationalData,
  QueryReturnDto,
} from '@apps-next/core';
import { asyncMap } from 'convex-helpers';
import { queryHelper } from './_internal/convex-query-helper';
import {
  DefaultFunctionArgs,
  GenericQueryCtx,
} from './_internal/convex.server.types';
import { ConvexClient } from './_internal/types.convex';
import { ConvexViewConfigManager } from './convex-view-config';

const client = (
  ctx: GenericQueryCtx,
  tableName: string
): ConvexClient[string] => {
  return ctx.db.query(tableName);
};

export const getRelationalData = async (
  ctx: GenericQueryCtx,
  viewConfigManager: ConvexViewConfigManager,
  args: QueryDto
) => {
  const displayField = viewConfigManager.getDisplayFieldLabel();

  const { getInclude } = queryHelper({ displayField, query: args.query });

  const include = getInclude(viewConfigManager.getIncludeFields());

  const relationalDataPromises = Object.keys({
    ...include,
  }).map((key) => {
    const manyToManyField = viewConfigManager.getManyToManyField(key);

    const field = manyToManyField ?? viewConfigManager.getFieldBy(key);

    // let dbQuery = client(prismaClient).tableClient(key);
    let dbQuery = client(ctx, key);
    if (field.relation) {
      dbQuery = client(ctx, field.relation.tableName);
    }

    return dbQuery.take(DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY);
  });

  const resultList = await Promise.all(relationalDataPromises);

  const relationalData = Object.keys(include).reduce((acc, key, index) => {
    const manyToManyField = viewConfigManager.getManyToManyField(key);
    const field = manyToManyField ?? viewConfigManager.getFieldBy(key);

    const _key = field?.relation?.tableName ?? key;

    const rows = resultList[index];
    acc[_key] = rows.map((row) => ({
      ...row,
      id: row._id,
    }));
    return acc;
  }, {} as QueryRelationalData);

  return relationalData;
};

export const viewLoaderHandler = async (
  ctx: GenericQueryCtx,
  _args: DefaultFunctionArgs
): Promise<QueryReturnDto> => {
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
  // ctx.db.query(viewConfigManager.getTableName());
  const dbQuery = client(ctx, viewConfigManager.getTableName());

  // dbQuery = searching ? searching((dbQuery as any)) : dbQuery;

  const rawData = await asyncMap(dbQuery.take(10), async (post) => {
    const categories = await ctx.db
      .query('categories')
      .withIndex('by_id', (q: any) => q.eq('_id', post.categoryId))
      .first();

    const owner = await ctx.db
      .query('owner')
      .withIndex('by_id', (q: any) => q.eq('_id', post.ownerId))
      .first();

    return { ...post, categories, owner };
  });

  return {
    data: rawData.map((item) => ({
      ...item,
      id: item._id,
    })),
    relationalData: await getRelationalData(ctx, viewConfigManager, args),
  };
};
