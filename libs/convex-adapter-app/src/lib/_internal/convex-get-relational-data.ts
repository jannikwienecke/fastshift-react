import {
  DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY,
  getRelationTableName,
  QueryRelationalData,
  QueryServerProps,
} from '@apps-next/core';
import { queryClient } from './convex-client';
import { queryHelper } from './convex-query-helper';
import { GenericQueryCtx } from './convex.server.types';

export const getRelationalData = async (
  ctx: GenericQueryCtx,
  args: QueryServerProps
) => {
  const { viewConfigManager } = args;

  const displayField = viewConfigManager.getDisplayFieldLabel();

  const { getInclude } = queryHelper({ displayField, query: args.query });

  const include = getInclude(viewConfigManager.getIncludeFields());

  const relationalDataPromises = Object.keys({
    ...include,
  }).map((key) => {
    const manyToManyField = viewConfigManager.getManyToManyField(key);

    const field = manyToManyField ?? viewConfigManager.getFieldBy(key);

    let dbQuery = queryClient(ctx, key);
    if (field.relation) {
      dbQuery = queryClient(
        ctx,
        field.relation.manyToManyRelation || field.relation.tableName
      );
    }

    const groupingField = args.displayOptions?.grouping?.field.name;

    const isGroupByField = groupingField === field.name;

    // if its the group by field, we need to query the complete table
    return isGroupByField
      ? dbQuery.collect()
      : dbQuery.take(DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY);
  });

  const resultList = await Promise.all(relationalDataPromises);

  const relationalData = Object.keys(include).reduce((acc, key, index) => {
    const manyToManyField = viewConfigManager.getManyToManyField(key);
    const field = manyToManyField ?? viewConfigManager.getFieldBy(key);

    const _key = getRelationTableName(field);

    const rows = resultList[index];
    acc[_key] =
      rows?.map((row) => ({
        ...row,
        id: row._id,
      })) ?? [];
    return acc;
  }, {} as QueryRelationalData);

  return relationalData;
};
