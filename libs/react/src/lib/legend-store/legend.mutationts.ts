import {
  getRelationTableName,
  makeData,
  Mutation,
  RecordType,
  Row,
  waitFor,
} from '@apps-next/core';
import { LegendStore, StoreFn } from './legend.store.types';
import { observable, Observable } from '@legendapp/state';

const checkedRows$ = observable<Row[]>([]);
const idsToDelete$ = observable<string[]>([]);
const isRunning$ = observable(false);

export const ignoreNewData$ = observable(false);

export const selectRowsMutation: StoreFn<'selectRowsMutation'> =
  (store$) =>
  async ({ field, existingRows, checkedRow, row }) => {
    const selectedIds: string[] = existingRows?.map((v) => v.id) ?? [];
    const toDelete = selectedIds.find((id) => id === checkedRow.id) ?? null;

    !toDelete && checkedRows$.set((prev) => [...prev, checkedRow]);

    const checkedRowsIds = checkedRows$.get().map((r) => r.id);
    const isInCheckedRows = checkedRowsIds.find((id) => toDelete === id);

    if (toDelete && isInCheckedRows) {
      checkedRows$.set((prev) => prev.filter((r) => r.id !== toDelete));
    } else if (toDelete) {
      idsToDelete$.set((prev) => [...prev, toDelete]);
    }

    const newRows: Row[] =
      existingRows?.length && toDelete
        ? existingRows.filter((v) => v.id !== checkedRow.id)
        : [...(existingRows ?? []), checkedRow];

    let rollback: (() => void) | null = null;
    rollback = optimisticUpdateStore({
      store$,
      row,
      sortedRecord: {
        [field.name]: newRows
          .map((r) => r.raw)
          .sort((a, b) => b['_creationTime'] - a['_creationTime']),
      },
      record: {
        [field.name]: newRows.map((r) => r.raw),
      },
    });

    if (isRunning$.get()) {
      ignoreNewData$.set(true);
    }

    isRunning$.set(true);

    const runMutation = store$.api?.mutateAsync;

    const checkedIds = checkedRows$.get().map((r) => r.id);
    const idsToDelete = idsToDelete$.get().map((r) => r);

    checkedRows$.set([]);
    idsToDelete$.set([]);

    const mutation: Mutation = {
      type: 'SELECT_RECORDS',
      payload: {
        id: row.id,
        table: getRelationTableName(field),
        idsToDelete: idsToDelete,
        newIds: checkedIds,
      },
    };
    console.warn('📦 Mutation payload:', mutation);

    await waitFor(300);

    const { error } = await runMutation({
      mutation: mutation,
      viewName: store$.viewConfigManager.viewConfig.viewName.get(),
      query: store$.globalQuery.get(),
    });

    if (error) {
      console.warn('⚠️ Error selecting rows:', error);
      rollback?.();
    } else {
      console.warn('✅ Rows selected successfully');
    }

    isRunning$.set(false);
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
      sortedRecord: { [field.name]: valueRow.raw },
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
  sortedRecord,
  store$,
  updateGlobalDataModel = true,
}: {
  row: Row;
  record: RecordType;
  sortedRecord: RecordType;
  store$: Observable<LegendStore>;
  updateGlobalDataModel?: boolean;
}): (() => void) => {
  console.log('🔄 Starting optimistic update', record);
  const originalRows = [...store$.dataModel.rows.get()];
  const originalRawRow = { ...row.raw };

  const updatedRowData = {
    ...originalRawRow,
    ...record,
  };

  console.warn('📋 Updated row data:', updatedRowData);

  const updatedRawRows = originalRows.map((r) => {
    if (r.id === row.id) {
      return { ...r.raw, ...sortedRecord };
    }

    return r.raw;
  });

  const updatedRows = makeData(
    store$.views.get(),
    store$.viewConfigManager.get().getViewName()
  )(updatedRawRows).rows;

  const updatedRow = makeData(
    store$.views.get(),
    store$.viewConfigManager.get().getViewName()
  )([updatedRowData]).rows?.[0];

  if (updatedRow) {
    store$.contextMenuState.row.set(updatedRow);

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
