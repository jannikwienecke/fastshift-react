import {
  getRelationTableName,
  makeData,
  Mutation,
  RecordType,
  Row,
} from '@apps-next/core';
import { LegendStore, StoreFn } from './legend.store.types';
import { Observable } from '@legendapp/state';

export const selectRowsMutation: StoreFn<'selectRowsMutation'> =
  (store$) =>
  async ({ field, existingRows, checkedRow, row }) => {
    console.warn('🔍 Starting selectRowsMutation');
    const runMutation = store$.api?.mutateAsync;

    const selectedIds: string[] = existingRows?.map((v) => v.id) ?? [];

    const idsToDelete = selectedIds.filter((id) => id === checkedRow.id) ?? [];

    const newRows: Row[] =
      existingRows?.length && idsToDelete.length
        ? existingRows.filter((v) => v.id !== checkedRow.id)
        : [...(existingRows ?? []), checkedRow];

    const rollback = optimisticUpdateStore({
      store$,
      row,
      record: { [field.name]: newRows.map((r) => r.raw) },
      updateGlobalDataModel: false,
    });

    const mutation: Mutation = {
      type: 'SELECT_RECORDS',
      payload: {
        id: row.id,
        table: getRelationTableName(field),
        idsToDelete,
        newIds: idsToDelete.length ? [] : [checkedRow.id],
      },
    };
    console.warn('📦 Mutation payload:', mutation);

    const { error } = await runMutation({
      mutation: mutation,
      viewName: store$.viewConfigManager.viewConfig.viewName.get(),
      query: store$.globalQuery.get(),
    });

    if (error) {
      console.warn('⚠️ Error selecting rows:', error);
      rollback();
    } else {
      console.warn('✅ Rows selected successfully');
    }
  };

export const updateRecordMutation: StoreFn<'updateRecordMutation'> =
  (store$) =>
  async ({ field, valueRow, row }) => {
    console.warn('🔍 Starting updateRecordMutation');
    const record = {
      [field.relation?.fieldName ?? field.name]: field.relation
        ? valueRow.id
        : valueRow.raw,
    };
    console.warn('📋 Record to update:', record);

    const rollback = optimisticUpdateStore({
      row,
      store$,
      record: { [field.name]: valueRow.raw },
    });

    const runMutation = store$.api?.mutateAsync;

    const mutation: Mutation = {
      type: 'UPDATE_RECORD',
      payload: {
        id: row.id,
        record,
      },
    };
    console.warn('📦 Mutation payload:', mutation);

    const { error } = await runMutation({
      mutation: mutation,
      viewName: store$.viewConfigManager.viewConfig.viewName.get(),
      query: store$.globalQuery.get(),
    });

    if (error) {
      console.warn('⚠️ Error updating record:', error);
      rollback();
    } else {
      console.warn('✅ Record updated successfully');
    }
  };

export const optimisticUpdateStore = ({
  row,
  record,
  store$,
  updateGlobalDataModel = true,
}: {
  row: Row;
  record: RecordType;
  store$: Observable<LegendStore>;
  updateGlobalDataModel?: boolean;
}): (() => void) => {
  console.warn('🔄 Starting optimistic update');
  const originalRows = [...store$.dataModel.rows.get()];
  const originalRawRow = { ...row.raw };

  const updatedRowData = {
    ...originalRawRow,
    ...record,
  };
  console.warn('📋 Updated row data:', updatedRowData);

  const updatedRawRows = originalRows.map((r) => {
    if (r.id === row.id) {
      return { ...r.raw, ...updatedRowData };
    }

    return r.raw;
  });

  const updatedRows = makeData(
    store$.views.get(),
    store$.viewConfigManager.get().getViewName()
  )(updatedRawRows).rows;

  const updatedActiveRow = updatedRows.find((r) => r.id === row.id);

  if (updatedActiveRow) {
    store$.contextMenuState.row.set(updatedActiveRow);

    if (updateGlobalDataModel) {
      store$.dataModel.rows.set(updatedRows);
    }
  }

  return () => {
    console.warn('🔄 Rolling back optimistic update');
    store$.dataModel.rows.set(originalRows);
    store$.contextMenuState.row.set(row);
  };
};
