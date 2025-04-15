import {
  DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY,
  getRelationTableName,
  getViewByName,
  NONE_OPTION,
  QueryRelationalData,
  QueryServerProps,
  relationalViewHelper,
} from '@apps-next/core';
import { filterByNotDeleted, queryClient } from './convex-client';
import { queryHelper } from './convex-query-helper';
import { GenericQueryCtx } from './convex.server.types';
import { ConvexRecord } from './types.convex';
import { mapWithInclude } from './convex-map-with-include';

export const getRelationalData = async (
  ctx: GenericQueryCtx,
  args: QueryServerProps
) => {
  const { viewConfigManager } = args;

  const displayField = viewConfigManager.getDisplayFieldLabel();

  const { getInclude } = queryHelper({ displayField, query: args.query });

  const include = getInclude(viewConfigManager.getIncludeFields());

  const fields = Object.keys({
    ...include,
  });

  const relationalDataPromises = fields.map((key) => {
    const manyToManyField = viewConfigManager.getManyToManyField(key);

    const field = manyToManyField ?? viewConfigManager.getFieldBy(key);

    const view = getViewByName(args.registeredViews, field.name);
    const viewHasSoftDelete = view.mutation?.softDelete;
    const deletedIndexField = viewHasSoftDelete
      ? viewConfigManager.getSoftDeleteIndexField()
      : undefined;

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
    return isGroupByField && deletedIndexField
      ? filterByNotDeleted(dbQuery, deletedIndexField).collect()
      : isGroupByField
      ? dbQuery.collect()
      : deletedIndexField
      ? filterByNotDeleted(dbQuery, deletedIndexField).take(
          DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY
        )
      : dbQuery.take(DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY);
  });

  const filtersWithRelationalValues =
    args.filters
      ?.filter((f) => f.type === 'relation')
      .filter((f) => f.values.length) ?? [];

  const indexFields = viewConfigManager.getIndexFields();

  const dict: { [key: string]: ConvexRecord[] } = {};

  for (const filter of filtersWithRelationalValues) {
    const fieldName = filter.field.relation?.fieldName;

    const indexField = indexFields.find((f) => f.fields?.[0] === fieldName);
    if (!indexField) {
      continue;
    }

    const values: ConvexRecord[] = [];
    for (const value of filter.values) {
      if (value.id === NONE_OPTION) continue;

      const res = await ctx.db.get(value.id);

      if (!res) continue;

      values.push(res);
    }

    dict[filter.field.name] = values;
  }

  const resultList = await Promise.all(relationalDataPromises);

  Object.entries(dict).forEach(([key, value]) => {
    const indexOfFields = fields.findIndex((f) => f === key);
    if (indexOfFields !== -1) {
      const prevValues = resultList[indexOfFields];
      const prevIds = prevValues?.map((r) => r._id);
      const notInPrev = value.filter((r) => !prevIds?.includes(r._id));

      resultList[indexOfFields] = [
        ...(prevValues ?? []),
        ...notInPrev,
      ] as ConvexRecord[];
    }
  });

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

  for (const [tableName, rows] of Object.entries(relationalData)) {
    const { relationalViewManager } = relationalViewHelper(
      tableName,
      args.registeredViews
    );

    args.viewConfigManager = relationalViewManager;

    const rowsWithInclude = await mapWithInclude(
      rows as ConvexRecord[],
      ctx,
      args
    );

    relationalData[tableName] = rowsWithInclude;
  }

  return relationalData;
};
