import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY,
  FieldConfig,
  getViewByName,
  QueryServerProps,
  RegisteredViews,
} from '@apps-next/core';
import { asyncMap } from 'convex-helpers';
import { queryClient } from './convex-client';
import { GenericQueryCtx } from './convex.server.types';
import { ConvexRecord } from './types.convex';

const cachedWarnings = new Map<string, boolean>();
const logWarningNoIndex = (fieldName: string, tableName: string) => {
  const key = `${fieldName}-${tableName}`;
  if (cachedWarnings.has(key)) {
    return;
  }
  cachedWarnings.set(key, true);
  console.warn(
    `CAUTION: Querying without index. Consider setting an index for field "${fieldName}" in table "${tableName}"`
  );
};

export const mapWithInclude = async (
  rows: ConvexRecord[],
  ctx: GenericQueryCtx,
  args: QueryServerProps
) => {
  const { viewConfigManager, registeredViews } = args;
  const include = viewConfigManager.getIncludeFields();

  cachedWarnings.clear();

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
        registeredViews,
      };

      try {
        const { fn, key } = await handleIncludeField(props);
        return {
          ...accResolved,
          [key ?? '']: await fn(),
        };
      } catch (error) {
        console.log('error', error);
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
  const viewOfField = getViewByName(registeredViews, field.relation.tableName);
  const indexFieldsOfField = new BaseViewConfigManager(
    viewOfField
  ).getIndexFields();

  const client = queryClient(ctx, field.relation.tableName);
  const fieldNameOfTable = field.relation.manyToManyModelFields?.find(
    (f) => f.name === viewConfigManager.getTableName()
  )?.relation?.fieldName;

  if (!fieldNameOfTable) {
    throw new Error('Field name of table not found');
  }

  const indexField = indexFieldsOfField.find(
    (f) => f.fields?.[0] === fieldNameOfTable
  );

  let records: ConvexRecord[] = [];
  if (indexField) {
    records = await client
      .withIndex(indexField.name, (q) =>
        q.eq(indexField.fields?.[0], recordWithoutRelations['_id'])
      )
      .take(DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY);
  } else {
    logWarningNoIndex(fieldNameOfTable, field.relation.tableName);
    const allRecordsOfTable = await client.collect();
    records = allRecordsOfTable.filter(
      (r) => r[fieldNameOfTable] === recordWithoutRelations['_id']
    );
  }

  return records.map((record) => {
    return {
      id: record._id,
      ...record,
    };
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

  const viewOfField = getViewByName(
    registeredViews,
    field.relation.manyToManyTable
  );
  const indexFieldsOfField = new BaseViewConfigManager(
    viewOfField
  ).getIndexFields();

  const fieldNameManyToMany = field.relation.manyToManyModelFields?.find(
    (f) => f.name === viewConfigManager.getTableName()
  )?.relation?.fieldName;

  const fieldNameRelation = field.relation.manyToManyModelFields?.find(
    (f) => f.name === field.name
  )?.relation?.fieldName;

  if (!fieldNameManyToMany || !fieldNameRelation) {
    throw new Error('Many to many field name not found');
  }

  const indexField = indexFieldsOfField.find(
    (f) => f.fields?.[0] === fieldNameManyToMany
  );

  const client = queryClient(ctx, field.relation.manyToManyTable);

  let records: ConvexRecord[] = [];
  if (indexField) {
    records = await client
      .withIndex(indexField.name, (q) =>
        q.eq(indexField.fields?.[0], recordWithoutRelations._id)
      )
      .take(DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY);
  } else {
    logWarningNoIndex(fieldNameManyToMany, field.relation.manyToManyTable);

    const allRecordsOfTable = await client.collect();
    records = allRecordsOfTable.filter(
      (r) => r[fieldNameManyToMany] === recordWithoutRelations._id
    );
  }

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
  return records;
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
  };
};
