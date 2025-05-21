import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  FieldConfig,
  getViewByName,
  QueryServerProps,
  RegisteredViews,
} from '@apps-next/core';
import { asyncMap } from 'convex-helpers';
import { queryClient } from './convex-client';
import { getRelationTableRecords } from './convex-get-relation-table-records';
import { GenericQueryCtx } from './convex.server.types';
import { ConvexRecord } from './types.convex';

export const mapWithInclude = async (
  rows: ConvexRecord[],
  ctx: GenericQueryCtx,
  args: QueryServerProps
) => {
  const { viewConfigManager, registeredViews } = args;
  const include = viewConfigManager.getIncludeFields();

  if (!rows) return [];
  const result = await asyncMap(rows, async (recordWithoutRelations) => {
    const extendedRecord = await include.reduce(async (acc, key) => {
      const field = viewConfigManager.getFieldBy(key);

      const view = getViewByName(registeredViews, field.name);

      if (!field.relation || !view) {
        return acc;
      }

      const accResolved = await acc;

      const props = {
        field,
        viewConfigManager,
        ctx,
        recordWithoutRelations,
        registeredViews,
      };

      try {
        const { fn, key } = await handleIncludeField(props);
        let includeData: ConvexRecord | ConvexRecord[] | null = await fn();

        if (view.mutation?.softDelete) {
          includeData = Array.isArray(includeData)
            ? includeData.filter(
                (i) => !i[view.mutation?.softDeleteField as keyof ConvexRecord]
              )
            : includeData?.[view.mutation?.softDeleteField as any] === true
            ? null
            : includeData;
        }

        return {
          ...accResolved,
          [key ?? '']: includeData,
        };
      } catch (error) {
        console.error('error', error);
        const invalidIndex = String(error).toLowerCase().includes('index');
        if (invalidIndex) {
          throw new Error(
            `Please define an index for the field ${
              field.name
            }. ${error} ${JSON.stringify(field.relation)}`
          );
        } else {
          throw error;
        }
      }
    }, Promise.resolve(recordWithoutRelations));

    return extendedRecord;
  });

  if (args.viewId && rows.length === 1) {
    const task = result[0];

    const fields = viewConfigManager
      .getIncludeFields()
      .map((f) => viewConfigManager.getFieldBy(f))
      .filter((f) => {
        if (!f) return false;

        return (
          f.isList === false && f.relation && f.relation.type !== 'manyToMany'
        );
      });

    await asyncMap(fields, async (field) => {
      const record = task[field.name];
      if (!record) {
        return;
      }

      const viewConfig = getViewByName(registeredViews, field.name);

      if (!viewConfig) {
        return;
      }

      args.viewId = null;
      args.viewConfigManager = new BaseViewConfigManager(viewConfig);

      const withInclude = await mapWithInclude([record], ctx, args);

      task[field.name] = withInclude.length ? withInclude[0] : record;

      return;
    });

    result[0] = task;
  }

  return result;
};

type HelperProps = {
  field: FieldConfig;
  viewConfigManager: BaseViewConfigManagerInterface;
  ctx: GenericQueryCtx;
  recordWithoutRelations: ConvexRecord;
  registeredViews: RegisteredViews;
};

export const handleIncludeField = (props: HelperProps) => {
  const { field } = props;

  if (
    field.relation?.manyToManyTable &&
    field.relation.manyToManyTable
      .toLowerCase()
      .includes(props.viewConfigManager.getTableName().toLowerCase())
  ) {
    return {
      fn: () => getManyToManyRecords(props),
      key: field.name,
    };
  } else if (
    field.relation?.manyToManyTable &&
    field.relation.type === 'oneToMany'
  ) {
    return {
      fn: () => getOneToManyRecords(props),
      key: field.relation?.tableName,
    };
  } else {
    return {
      fn: () => getOneToOneRecords(props),
      key: field.relation?.tableName,
    };
  }
};

export const getOneToManyRecords = async (props: HelperProps) => {
  const {
    field,
    viewConfigManager,
    ctx,
    recordWithoutRelations,
    registeredViews,
  } = props;

  if (!field.relation) return [];

  // REFACTOR This is duplicated code
  const fieldNameOfTable = field.relation.manyToManyModelFields?.find(
    (f) => f.name === viewConfigManager.getTableName()
  )?.relation?.fieldName;

  if (!fieldNameOfTable) {
    throw new Error('Field name of table not found');
  }

  const records = await getRelationTableRecords({
    registeredViews,
    ctx,
    fieldName: fieldNameOfTable,
    relation: field.relation.tableName,
    id: recordWithoutRelations['_id'],
  });

  return records.map((record) => {
    return {
      id: record._id,
      ...record,
    } as ConvexRecord;
  });
};

export const getManyToManyRecords = async (props: HelperProps) => {
  const {
    field,
    viewConfigManager,
    ctx,
    recordWithoutRelations,
    registeredViews,
  } = props;

  // handle many to many
  // like: Tasks has Many tags <-> Tags has Many Tasks
  // we have a tasks_tags table
  // query the table with the task id

  if (!field.relation?.manyToManyTable) return [];

  const fieldNameManyToMany = field.relation.manyToManyModelFields?.find(
    (f) => f.name === viewConfigManager.getTableName()
  )?.relation?.fieldName;

  const fieldNameRelation = field.relation.manyToManyModelFields?.find(
    (f) => f.name === field.name
  )?.relation?.fieldName;

  if (!fieldNameManyToMany || !fieldNameRelation) {
    throw new Error('Many to many field name not found');
  }

  const recursive = field.name === fieldNameManyToMany;

  if (recursive && recordWithoutRelations[field.name]) {
    const ids = recordWithoutRelations[field.name] ?? [];

    const relationalRecords = await asyncMap(ids, async (id) => {
      const value = await queryClient(ctx, field.name)
        .withIndex('by_id', (q) => q.eq('_id', id))
        .first();

      return {
        id: value?._id,
        ...value,
      } as ConvexRecord;
    });

    return relationalRecords;
  } else if (recursive) {
    return null;
  }

  let records = await getRelationTableRecords({
    registeredViews,
    ctx,
    fieldName: fieldNameManyToMany,
    relation: field.relation.manyToManyTable,
    id: recordWithoutRelations['_id'],
  });

  if (records.length) {
    records = await asyncMap(records, async (manyToManyValue) => {
      const value = await queryClient(ctx, field.name)
        .withIndex('by_id', (q) =>
          q.eq('_id', manyToManyValue[fieldNameRelation])
        )
        .first();

      return {
        id: value?._id,
        ...manyToManyValue,
        ...value,
      } as ConvexRecord;
    });
  }

  return [...records].sort((a, b) => b['_creationTime'] - a['_creationTime']);
};

export const getOneToOneRecords = async (props: HelperProps) => {
  const { field, ctx, recordWithoutRelations } = props;

  if (!field.relation) return [];

  const client = queryClient(ctx, field.relation.tableName);

  const record = await client
    .withIndex('by_id', (q) =>
      q.eq('_id', recordWithoutRelations[field.relation?.fieldName ?? ''])
    )
    .first();

  return {
    id: record?._id,
    ...record,
  } as ConvexRecord;
};
