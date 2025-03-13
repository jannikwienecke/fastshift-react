import {
  BaseViewConfigManagerInterface,
  FilterType,
  ID,
  NONE_OPTION,
  RegisteredViews,
} from '@apps-next/core';
import {
  dateUtils,
  filterUtil,
  isRelationNegateOperator,
} from '@apps-next/react';
import { asyncMap } from 'convex-helpers';
import { queryClient } from './convex-client';
import { SearchField } from './convex-get-filters';
import { getRelationTableRecords } from './convex-get-relation-table-records';
import { GenericQueryCtx } from './convex.server.types';
import { ConvexClient, ConvexRecord } from './types.convex';
/*
  Get records by ids
  @param ids
  @param dbQuery
  @returns
*/
export const getRecordsByIds = async (
  ids: ID[],
  dbQuery: ConvexClient[string]
) => {
  return await asyncMap(ids, async (id) => {
    return await dbQuery.withIndex('by_id', (q) => q.eq('_id', id)).first();
  });
};

/**
 * Get ids from many to many filters
 * E.g.: On the view Task, we filter by one or more tags.
 * -> We want all tasks that have at least one of the tags.
 * @param manyToManyFilters
 * @param ctx - Convex context
 * @returns
 */
export const getIdsFromManyToManyFilters = async (
  manyToManyFilters: FilterType[],
  ctx: GenericQueryCtx,
  viewConfigManager: BaseViewConfigManagerInterface,
  registeredViews: RegisteredViews
) => {
  const idsToRemove = [] as ID[];

  const idsLists = await asyncMap(manyToManyFilters, async (filter) => {
    // e.g.: at TaskView -> tagId
    const fieldNameFilter =
      filter?.field.relation?.manyToManyModelFields?.find(
        (f) => f.name === filter.field.name
      )?.relation?.fieldName ?? '';

    // e.g.: at TaskView -> taskId
    const fieldNameView =
      filter?.field.relation?.manyToManyModelFields?.find(
        (f) => f.name === viewConfigManager.getTableName()
      )?.relation?.fieldName ?? '';

    // e.g: TaskTag
    const manyToManyTable = filter?.field.relation?.manyToManyTable ?? '';
    // e.g.: ['tagId']
    const values = filter?.type === 'relation' ? filter.values : [];

    const idLists = await asyncMap(values, async (value) => {
      if (!manyToManyTable || !fieldNameFilter) return null;

      if (value.id === NONE_OPTION) {
        // if we want all the "tasks" that have no tags
        // (many to many table is "tasks_tags")
        // we first get all the records from the "tasks" table
        // then we filter the tasks tags to get all the tasks with a tag
        // then we find the tasks that have no tags
        // expensive operation

        const viewRecords = await queryClient(
          ctx,
          viewConfigManager.getTableName()
        ).collect();

        const manyToManyRecordIds = await asyncMap(
          viewRecords,
          async (record) => {
            const rows = await getRelationTableRecords({
              registeredViews,
              ctx,
              id: (record as any)._id,
              fieldName: fieldNameView,
              relation: manyToManyTable,
            });
            return rows[0]?.[fieldNameView];
          }
        );

        const recordsWithoutManyToMany = viewRecords.filter(
          (record) => !manyToManyRecordIds.some((id) => id === record?._id)
        );

        return recordsWithoutManyToMany.map((r) => r._id);
      } else {
        const rows = await getRelationTableRecords({
          registeredViews,
          ctx,
          id: value.id,
          fieldName: fieldNameFilter,
          relation: manyToManyTable,
        });
        if (isRelationNegateOperator(filter.operator)) {
          idsToRemove.push(
            ...rows.map((manyToManyRow) => manyToManyRow[fieldNameView])
          );
          return [];
        } else {
          return rows?.map((manyToManyRow) => manyToManyRow[fieldNameView]);
        }
      }
    });

    // sort by how many times the id appears
    const ids = idLists
      .filter((id) => id !== null)
      .flat()
      .sort((a, b) => {
        return (
          idLists.filter((id) => id === a).length -
          idLists.filter((id) => id === b).length
        );
      })
      .reverse();

    return [...new Set(ids)];
  });

  return {
    ids: [...new Set(idsLists.flat())],
    idsToRemove: [...new Set(idsToRemove)],
  };
};

/**
 * Get ids from one to many filters
 * E.g.: On the view Task, we filter by one or more projects.
 * -> We want all tasks that have at least one of the projects.
 * @param manyToManyFilters
 * @param ctx - Convex context
 * @returns
 */
export const getIdsFromOneToManyFilters = async (
  relationalFilters: FilterType[],
  ctx: GenericQueryCtx,
  viewConfigManager: BaseViewConfigManagerInterface,
  registeredViews: RegisteredViews
) => {
  const idsToRemove = [] as ID[];

  const tableName = viewConfigManager.getTableName();

  const listOfIds = await asyncMap(relationalFilters ?? [], async (filter) => {
    const values = filter.type === 'relation' ? filter.values : [];

    // e.g.: at TaskView -> projectId
    const fieldName = filter.field.relation?.fieldName;
    if (!fieldName) return [];

    const mapped = await asyncMap(values, async (row) => {
      const id = row.id;
      if (!id) return null;

      const rows = await getRelationTableRecords({
        registeredViews,
        ctx,
        id,
        fieldName,
        relation: tableName,
      });

      if (isRelationNegateOperator(filter.operator)) {
        idsToRemove.push(...rows.map((task) => task._id));
        return [];
      } else {
        return rows.map((row) => row._id);
      }
    });

    const ids = mapped
      .filter((a) => a !== null)
      .filter((a) => a !== undefined)
      .flat();

    return ids as ID[];
  });

  return {
    ids: [...new Set(listOfIds.flat())],
    idsToRemove: [...new Set(idsToRemove)],
  };
};

export const getIdsFromIndexFilters = async (
  filtersWithIndexField: FilterType[] | undefined,
  indexFields: SearchField[] | undefined,
  ctx: GenericQueryCtx,
  viewConfigManager: BaseViewConfigManagerInterface
): Promise<{ ids: ID[]; idsToRemove: ID[] }> => {
  if (!indexFields) return { ids: [], idsToRemove: [] };

  const idsIndexFieldToRemove: ID[] = [];

  const idsIndexField = await asyncMap(
    filtersWithIndexField ?? [],
    async (currentIndexFilter): Promise<ID[]> => {
      const indexField = indexFields.find(
        (f) => f.field === currentIndexFilter.field.name
      );

      if (!indexField) return [];

      const value = filterUtil().getValue(currentIndexFilter);
      const _values = filterUtil()
        .getValues(currentIndexFilter)
        .map((v) => v.raw);
      const values = _values.length ? _values : [value];

      const idsList = await asyncMap(values, async (value) => {
        const dbQuery = queryClient(ctx, viewConfigManager.getTableName());

        let rows: ConvexRecord[] = [];
        if (
          currentIndexFilter.field.type === 'Date' &&
          currentIndexFilter.type === 'primitive'
        ) {
          const { start, end } = dateUtils.getStartAndEndDate(
            currentIndexFilter.date
          );

          const indexName = indexField.name;

          const fieldName = indexField.field.toString();

          if (!start && !end) {
            rows = await dbQuery
              .withIndex(indexName, (q) => q.eq(fieldName, undefined))
              .collect();
          } else if (start || end) {
            rows = await dbQuery
              .withIndex(indexName, (q) => {
                if (start && end) {
                  return q
                    .gt(fieldName, start.getTime())
                    .lt(fieldName, end.getTime());
                }
                if (start) {
                  return q.gt(fieldName, start.getTime());
                }
                if (end) {
                  return q.lt(fieldName, end.getTime()).gt(fieldName, 0);
                }

                return q;
              })
              .collect();
          }
        } else {
          rows = await dbQuery
            .withIndex(indexField.name, (q) =>
              q.eq(indexField.field.toString(), value)
            )
            .collect();
        }

        if (currentIndexFilter.operator.label !== 'is not') {
          const ids = rows.map((r) => r._id);

          return ids;
        } else {
          const ids = rows.map((r) => r._id);

          idsIndexFieldToRemove.push(...ids);
          return [];
        }
      });

      const ids = idsList.flat();

      if (currentIndexFilter.operator.label === 'does not contain') {
        idsIndexFieldToRemove.push(...ids);
        return [];
      }

      return ids;
    }
  );

  return {
    ids: [...new Set(idsIndexField.flat())],
    idsToRemove: [...new Set(idsIndexFieldToRemove)],
  };
};

export const getIdsFromSearchFilters = async (
  filters: FilterType[] | undefined,
  searchFields: SearchField[] | undefined,
  ctx: GenericQueryCtx,
  viewConfigManager: BaseViewConfigManagerInterface
) => {
  if (!searchFields) return { ids: [], idsToRemove: [] };

  const idsIndexFieldToRemove: ID[] = [];

  const idsIndexField = await asyncMap(filters ?? [], async (currentFilter) => {
    const searchField = searchFields.find(
      (f) => f.field === currentFilter.field.name
    );

    if (!searchField) return [];

    const value = filterUtil().getValue(currentFilter);
    const dbQuery = queryClient(ctx, viewConfigManager.getTableName());

    const rows = await dbQuery
      .withSearchIndex(searchField.name, (q) =>
        q.search(searchField.field.toString(), value)
      )
      .collect();

    const ids = rows.map((r) => r._id);

    if (currentFilter.operator.label === 'does not contain') {
      idsIndexFieldToRemove.push(...ids);
      return [];
    }

    return ids;
  });

  return {
    ids: [...new Set(idsIndexField.flat())],
    idsToRemove: [...new Set(idsIndexFieldToRemove)],
  };
};

export const getIdsFromQuerySearch = async (
  query: string | undefined,
  searchFields: SearchField[] | undefined,
  ctx: GenericQueryCtx,
  viewConfigManager: BaseViewConfigManagerInterface
) => {
  if (!searchFields || !query) return [];

  const idsIndexField = await asyncMap(
    searchFields ?? [],
    async (searchField) => {
      const dbQuery = queryClient(ctx, viewConfigManager.getTableName());

      const rows = await dbQuery
        .withSearchIndex(searchField.name, (q) =>
          q.search(searchField.field.toString(), query)
        )
        .collect();

      const ids = rows.map((r) => r._id);

      return ids;
    }
  );

  return [...new Set(idsIndexField.flat())];
};
