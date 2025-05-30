import {
  DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY,
  getViewByName,
  NONE_OPTION,
  QueryRelationalData,
  QueryServerProps,
} from '@apps-next/core';
import { filterByNotDeleted, queryClient } from './convex-client';
import { GenericQueryCtx } from './convex.server.types';
import { ConvexRecord } from './types.convex';

export const getRelationalData = async (
  ctx: GenericQueryCtx,
  args: QueryServerProps
) => {
  const { viewConfigManager } = args;

  const tables = Object.values(args.registeredViews)
    .map((v) => v?.tableName)
    .filter((t) => !getViewByName(args.registeredViews, t)?.isManyToMany);

  const relationalDataPromises = tables.map((key) => {
    const view = getViewByName(args.registeredViews, key);

    if (view?.isManyToMany) return null;

    const viewHasSoftDelete = view?.mutation?.softDelete;
    const deletedIndexField = viewHasSoftDelete
      ? viewConfigManager.getSoftDeleteIndexField()
      : undefined;

    const dbQuery = queryClient(ctx, key);

    const groupingField = args.displayOptions?.grouping?.field.name;

    const isGroupByField = groupingField === key;

    const x =
      isGroupByField && deletedIndexField
        ? filterByNotDeleted(dbQuery, deletedIndexField).collect()
        : deletedIndexField
        ? filterByNotDeleted(dbQuery, deletedIndexField).take(
            DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY
          )
        : dbQuery.take(DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY);

    return x;
    //       DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY
    //     )

    // if (view.relation) {
    //   dbQuery = queryClient(
    //     ctx,
    //     field.relation.manyToManyRelation || field.relation.tableName
    //   );
    // }

    // const groupingField = args.displayOptions?.grouping?.field.name;

    // // if its the group by field, we need to query the complete table
    // return isGroupByField && deletedIndexField
    //   ? filterByNotDeleted(dbQuery, deletedIndexField).collect()
    //   : isGroupByField
    //   ? dbQuery.collect()
    //   : deletedIndexField
    //   ? filterByNotDeleted(dbQuery, deletedIndexField).take(
    //       DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY
    //     )
    //   : dbQuery.take(DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY);
  });

  const filtersWithRelationalValues =
    args.filters
      ?.filter((f) => f.type === 'relation')
      .filter((f) => f.values.length) ?? [];

  const indexFields = viewConfigManager.getIndexFields();

  const dict: { [key: string]: ConvexRecord[] } = {};

  const resultList = await Promise.all(relationalDataPromises);

  if (filtersWithRelationalValues.length) {
    // if we have filters, we need to add these values to the result list
    // e.g. we have 10 values for projects
    // but we also have a filter for projects, and this values is not under the
    // 10 items of the result list. So we need to fetch it by id and add it
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

    Object.entries(dict).forEach(([key, value]) => {
      const indexOfFields = tables.findIndex((f) => f === key);

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
  }

  const relationalData = tables.reduce((acc, key, index) => {
    const rows = resultList[index];

    acc[key] =
      rows?.map((row) => ({
        ...row,
        id: row._id,
      })) ?? [];
    return acc;
  }, {} as QueryRelationalData);

  // for (const [tableName, rows] of Object.entries(relationalData)) {
  //   const { relationalViewManager } = relationalViewHelper(
  //     tableName,
  //     args.registeredViews
  //   );

  //   args.viewConfigManager = relationalViewManager;

  //   const rowsWithInclude = await mapWithInclude(
  //     rows as ConvexRecord[],
  //     ctx,
  //     args
  //   );

  //   relationalData[tableName] = rowsWithInclude;
  // }

  return relationalData;
};
