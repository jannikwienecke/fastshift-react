import {
  arrayIntersection,
  DEFAULT_FETCH_LIMIT_QUERY,
  FieldConfig,
  FilterType,
  QueryServerProps,
} from '@apps-next/core';
import { queryClient } from './convex-client';
import { mapWithInclude } from './convex-map-with-include';
import {
  filterResults,
  getFilterTypes,
  getIdsFromManyToManyFilters,
  getIdsFromOneToManyFilters,
  getRecordsByIds,
  withPrimitiveFilters,
  withSearch,
} from './convex-searching';
import { GenericQueryCtx } from './convex.server.types';

export const getData = async (ctx: GenericQueryCtx, args: QueryServerProps) => {
  const { viewConfigManager, filters: _filters } = args;

  const filters: FilterType[] = _filters?.length
    ? [..._filters, ...defaultFilters]
    : defaultFilters;

  const dbQuery = queryClient(ctx, viewConfigManager.getTableName());

  const searchField = viewConfigManager.getSearchableField();
  const displayField = viewConfigManager.getDisplayFieldLabel();

  const {
    primitiveFilters,
    oneToManyFilters,
    manyToManyFilters,
    filterWithSearchField,
  } = getFilterTypes(filters, searchField);

  const idsManyToManyFilters = await getIdsFromManyToManyFilters(
    manyToManyFilters,
    ctx,
    viewConfigManager
  );

  const idsOneToManyFilters = await getIdsFromOneToManyFilters(
    oneToManyFilters,
    ctx,
    viewConfigManager
  );

  const queryWithSearchAndFilter = withPrimitiveFilters(
    primitiveFilters,
    withSearch(dbQuery, {
      searchField,
      query: args.query,
      filterWithSearch: filterWithSearchField,
    })
  );

  const idsSearchAndFilter =
    primitiveFilters.length || args.query || filterWithSearchField
      ? (await queryWithSearchAndFilter.collect())
          .map((row, index) => row._id)
          .filter((a) => a !== undefined)
      : [];

  const allIds = arrayIntersection(
    manyToManyFilters.length ? idsManyToManyFilters : null,
    oneToManyFilters.length ? idsOneToManyFilters : null,
    idsSearchAndFilter
  );

  const hasAnyFilterSet =
    primitiveFilters.length ||
    args.query ||
    filterWithSearchField ||
    manyToManyFilters.length ||
    oneToManyFilters.length;

  console.log(hasAnyFilterSet);

  const rows = filterResults(
    hasAnyFilterSet
      ? await getRecordsByIds(allIds, dbQuery)
      : await dbQuery.take(DEFAULT_FETCH_LIMIT_QUERY),
    displayField,
    args.query,
    searchField,
    filters.filter((f) => f.type === 'primitive' && f.field.type === 'String')
  );

  const rawData = await mapWithInclude(rows, ctx, args);

  return rawData.map((item) => {
    return {
      ...item,
      id: item._id,
    };
  });
};

// const field: FieldConfig = {
//   name: 'completed',
//   type: 'Boolean',
//   isList: false,
// };

// const fieldName: FieldConfig = {
//   name: 'name',
//   type: 'String',
//   isList: false,
// };

const fieldDescription: FieldConfig = {
  name: 'description',
  type: 'String',
  isList: false,
};
// const name = 'Track monthly';
const description = 'savings';

const defaultFilters: FilterType[] = [
  // {
  //   field,
  //   type: 'primitive',
  //   operator: { label: 'is' } satisfies FilterOperatorTypePrimitive,
  //   value: makeRow('fasle', 'false', true, field),
  // },
  // {
  //   field: fieldName,
  //   type: 'primitive',
  //   operator: { label: 'is' } satisfies FilterOperatorTypePrimitive,
  //   value: makeRow(name, name, name, fieldName),
  // },
  // {
  //   field: fieldDescription,
  //   type: 'primitive',
  //   operator: { label: 'is' } satisfies FilterOperatorTypePrimitive,
  //   value: makeRow(description, description, description, fieldDescription),
  // },
];

// const listOfIds = await asyncMap(relationalFilters ?? [], async (filter) => {
//   const values = filter.type === 'relation' ? filter.values : [];

//   const fieldName = filter.field.relation?.fieldName;
//   if (!fieldName) return [];

//   const mapped = await asyncMap(values, async (row) => {
//     const id = row.id;
//     if (!id) return null;

//     const tasks = await queryClient(ctx, tableName)
//       .withIndex(fieldName, (q) => q.eq(fieldName, id))
//       .collect();

//     return tasks.map((task) => task._id);
//   });

//   return mapped
//     .filter((a) => a !== null)
//     .filter((a) => a !== undefined)
//     .flat();
// });

// const filterByPrimitive = (dbQuery: ConvexClient[string]) => {
//   let _query = dbQuery;
//   primitiveFilters.forEach((filter) => {
//     const value = filter.type === 'primitive' ? filter.value : null;
//     _query = dbQuery.filter((q) =>
//       q.eq(q.field(filter.field.name), value?.raw)
//     );
//   });

//   return _query;
// };

// const idLists = await asyncMap(manyToManyFilters, async (filter) => {
//   const fieldNameFilter =
//     filter?.field.relation?.manyToManyModelFields?.find(
//       (f) => f.name === filter.field.name
//     )?.relation?.fieldName ?? '';

//   const manyToManyTable = filter?.field.relation?.manyToManyTable ?? '';
//   const values = filter?.type === 'relation' ? filter.values : [];

//   const taskIdsLists = await asyncMap(values, async (value) => {
//     if (!manyToManyTable || !fieldNameFilter) return null;

//     return (
//       await queryClient(ctx, manyToManyTable)
//         .withIndex(fieldNameFilter, (q) => q.eq(fieldNameFilter, value.id))
//         .collect()
//     )?.map((taskTag) => taskTag.taskId);
//   });

//   return [...new Set(taskIdsLists.flat())];
// });

//

// const filterByIds = async (dbQuery: ConvexClient[string]) => {
//   // if (allIds.length === 0 && !anyHasData)
//   //   return dbQuery.take(DEFAULT_FETCH_LIMIT_QUERY);

//   const tasks = await asyncMap(
//     allIds.slice(0, DEFAULT_FETCH_LIMIT_QUERY),
//     async (id) => {
//       return await dbQuery.withIndex('by_id', (q) => q.eq('_id', id)).first();
//     }
//   );
//   return tasks;
// };

// NEXT STEPS
// - [ ] write tests for (oneToManyFilters, manyToManyFilters)
// - [ ] refacotr above code and code in convex-seaching
// - [ ] update the ui so we can set primitive filters
// - [ ] write tests for (primitiveFilters)
