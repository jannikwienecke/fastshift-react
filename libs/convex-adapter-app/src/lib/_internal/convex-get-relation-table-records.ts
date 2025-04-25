import {
  RegisteredViews,
  ID,
  getViewByName,
  BaseViewConfigManager,
  NONE_OPTION,
  ViewFieldConfig,
} from '@apps-next/core';
import { queryClient } from './convex-client';
import { GenericQueryCtx } from './convex.server.types';
import { ConvexRecord } from './types.convex';
import { logWarningNoIndex } from './convex-no-index-warning';

/*
  Get records from a relation table.
  If the relation table has an index on the field, use it.
  Otherwise, use the field to filter the records.
  The latter is not efficient for large tables.
*/
export const getRelationTableRecords = async ({
  registeredViews,
  relation,
  fieldName,
  ctx,
  id,
}: {
  registeredViews: RegisteredViews;
  relation: string;
  fieldName: string;
  ctx: GenericQueryCtx;
  id: ID;
}) => {
  const relationTableClient = queryClient(ctx, relation);
  const viewOfField = getViewByName(registeredViews, relation, true);
  if (!viewOfField) return [];

  const indexFields = new BaseViewConfigManager(
    viewOfField,
    {}
  ).getIndexFields();
  const indexField = indexFields.find((f) => f.fields?.[0] === fieldName);

  let records: ConvexRecord[] = [];
  if (indexField) {
    records = await relationTableClient
      .withIndex(indexField.name, (q) =>
        q.eq(indexField.fields?.[0] ?? '', id === NONE_OPTION ? undefined : id)
      )
      .collect();
  } else {
    logWarningNoIndex(fieldName, relation);

    const allRecords = await relationTableClient.collect();
    records = allRecords.filter((r) => r[fieldName] === id);
  }

  return records;
};
