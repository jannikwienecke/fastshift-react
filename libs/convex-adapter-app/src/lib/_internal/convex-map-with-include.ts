import {
  BaseViewConfigManagerInterface,
  DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY,
  FieldConfig,
  QueryDto,
} from '@apps-next/core';
import { asyncMap } from 'convex-helpers';
import { GenericQueryCtx } from './convex.server.types';
import { ConvexRecord } from './types.convex';
import { queryClient } from './convex-client';

export const mapWithInclude = async (
  rows: ConvexRecord[],
  viewConfigManager: BaseViewConfigManagerInterface,
  ctx: GenericQueryCtx,
  args: QueryDto
) => {
  const include = viewConfigManager.getIncludeFields();

  return await asyncMap(rows, async (recordWithoutRelations) => {
    const extendedRecord = await include.reduce(async (acc, key) => {
      const field = viewConfigManager.getFieldBy(key);

      if (!field.relation) {
        return acc;
      }

      const accResolved = await acc;

      const props = {
        field,
        viewConfigManager,
        ctx,
        recordWithoutRelations,
      };

      try {
        const includeField = await handleIncludeField(props)();
        return {
          ...accResolved,
          [field.relation.tableName]: includeField,
        };
      } catch (error) {
        console.log('error', error);
        const invalidIndex = String(error).toLowerCase().includes('index');
        if (invalidIndex) {
          throw new Error(
            `Please use the field name as the index name. ${error} ${JSON.stringify(
              field.relation
            )}`
          );
        } else {
          throw error;
        }
      }
    }, Promise.resolve(recordWithoutRelations));

    return extendedRecord;
  });
};

type HelperProps = {
  field: FieldConfig;
  viewConfigManager: BaseViewConfigManagerInterface;
  ctx: GenericQueryCtx;
  recordWithoutRelations: ConvexRecord;
};

export const handleIncludeField = (props: HelperProps) => {
  const { field } = props;

  if (field.relation?.manyToManyTable && field.relation.type === 'manyToMany') {
    return () => getManyToManyRecords(props);
  } else if (
    field.relation?.manyToManyTable &&
    field.relation.type === 'oneToMany'
  ) {
    return () => getOneToManyRecords(props);
  } else {
    return () => getOneToOneRecords(props);
  }
};

export const getOneToManyRecords = async (props: HelperProps) => {
  const { field, viewConfigManager, ctx, recordWithoutRelations } = props;

  if (!field.relation) return [];

  const fieldNameOfTable = field.relation.manyToManyModelFields?.find(
    (f) => f.name === viewConfigManager.getTableName()
  )?.relation?.fieldName;

  if (!fieldNameOfTable) {
    throw new Error('Field name of table not found');
  }

  const client = queryClient(ctx, field.relation.tableName);

  return await client
    .withIndex(fieldNameOfTable, (q) =>
      q.eq(fieldNameOfTable, recordWithoutRelations['_id'])
    )
    .take(DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY);
};

export const getManyToManyRecords = async (props: HelperProps) => {
  const { field, viewConfigManager, ctx, recordWithoutRelations } = props;
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

  const client = queryClient(ctx, field.relation.manyToManyTable);

  let records = await client
    .withIndex(fieldNameManyToMany, (q) =>
      q.eq(fieldNameManyToMany, recordWithoutRelations._id)
    )
    .take(DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY);

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
      };
    });
  }
};

export const getOneToOneRecords = async (props: HelperProps) => {
  const { field, ctx, recordWithoutRelations } = props;
  if (!field.relation) return [];

  const client = queryClient(ctx, field.relation.tableName);

  return await client
    .withIndex('by_id', (q) =>
      q.eq('_id', recordWithoutRelations[field.relation?.fieldName ?? ''])
    )
    .first();
};
