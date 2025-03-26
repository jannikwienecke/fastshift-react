import {
  getRelationTableName,
  ifNoneNullElseValue,
  makeData,
  Mutation,
  RecordType,
  Row,
  TranslationKeys,
} from '@apps-next/core';
import { observable, Observable } from '@legendapp/state';
import { renderErrorToast, renderSuccessToast } from '../toast';
import { LegendStore, StoreFn } from './legend.store.types';

// Temporary states
const checkedRows$ = observable<Row[]>([]);
const idsToDelete$ = observable<string[]>([]);
const isRunning$ = observable(false);
export const ignoreNewData$ = observable(0);

export const selectRowsMutation: StoreFn<'selectRowsMutation'> =
  (store$) =>
  async ({ field, existingRows = [], checkedRow, row }) => {
    // Check if the entry already exists
    const isSelected = existingRows.some((r) => r.id === checkedRow.id);

    if (isSelected) {
      // Deselect row: remove from checkedRows and add to delete list
      checkedRows$.set((prev) => prev.filter((r) => r.id !== checkedRow.id));
      idsToDelete$.set((prev) => [...prev, checkedRow.id]);
    } else {
      // Select row: add to checkedRows
      checkedRows$.set((prev) => [...prev, checkedRow]);
    }

    // New row list based on toggle
    const newRows = isSelected
      ? existingRows.filter((r) => r.id !== checkedRow.id)
      : [...existingRows, checkedRow];

    // Perform optimistic update
    const rollback = optimisticUpdateStore({
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
      ignoreNewData$.set((prev) => prev + 1);
      return;
    }

    isRunning$.set(true);

    const mutation: Mutation = {
      type: 'SELECT_RECORDS',
      payload: {
        id: row.id,
        table: getRelationTableName(field),
        idsToDelete: idsToDelete$.get(),
        newIds: checkedRows$.get().map((r) => r.id),
      },
    };

    const { error } = await store$.api.mutateAsync({
      mutation,
      viewName: store$.viewConfigManager.viewConfig.viewName.get(),
      query: store$.globalQuery.get(),
    });

    if (error) {
      console.error('Error selecting rows:', error);
      rollback?.();
    } else {
      console.warn('Rows selected successfully');
    }

    // Reset temporary states
    checkedRows$.set([]);
    idsToDelete$.set([]);
    isRunning$.set(false);
  };

export const updateRecordMutation: StoreFn<'updateRecordMutation'> =
  (store$) =>
  async ({ field, valueRow, row }) => {
    console.warn('Starting updateRecordMutation');
    const patchValue = field.relation
      ? ifNoneNullElseValue(valueRow.id)
      : ifNoneNullElseValue(valueRow.raw);

    const record = {
      [field.relation?.fieldName ?? field.name]: patchValue,
    };
    console.warn('Record to update:', record);

    const fieldName =
      store$.viewConfigManager.getFieldBy(field.name).relation?.fieldName ?? '';

    const rollback = optimisticUpdateStore({
      store$,
      row,
      record: { [field.name]: valueRow.raw, [fieldName]: patchValue },
    });

    const mutation: Mutation = {
      type: 'UPDATE_RECORD',
      payload: {
        id: row.id,
        record,
      },
    };
    console.warn('Mutation payload:', mutation);

    const { error } = await store$.api.mutateAsync({
      mutation,
      viewName: store$.viewConfigManager.viewConfig.viewName.get(),
      query: store$.globalQuery.get(),
    });

    if (error) {
      console.error('Error updating record:', error);
      rollback();
    } else {
      console.warn('Record updated successfully');
    }
  };

export const deleteRecordMutation: StoreFn<'deleteRecordMutation'> =
  (store$) =>
  async ({ row }, onSuccess, onError) => {
    const runMutation = async () => {
      const mutation: Mutation = {
        type: 'DELETE_RECORD',
        payload: {
          id: row.id,
        },
      };
      const { error } = await store$.api.mutateAsync({
        mutation,
        viewName: store$.viewConfigManager.viewConfig.viewName.get(),
        query: store$.globalQuery.get(),
      });

      if (error) {
        onError?.(error.message);

        renderErrorToast('error.deleteRecord', () => {
          store$.errorDialog.error.set(error);
        });
      } else {
        console.warn('Record deleted successfully');
        onSuccess?.();
      }
    };

    if (store$.viewConfigManager.getUiViewConfig().onDelete?.showConfirmation) {
      store$.confirmationAlert.open.set(true);
      store$.confirmationAlert.title.set('confirmationAlert.delete.title');
      store$.confirmationAlert.description.set(
        'confirmationAlert.delete.description'
      );
      store$.confirmationAlert.onConfirm.set({
        cb: runMutation,
      });
    } else {
      runMutation();
    }
  };

export const createRecordMutation: StoreFn<'createRecordMutation'> =
  (store$) =>
  async ({ record, view, toast }, onSuccess, onError) => {
    const runMutation = async () => {
      const mutation: Mutation = {
        type: 'CREATE_RECORD',
        payload: {
          id: '',
          record,
        },
      };

      const { error } = await store$.api.mutateAsync({
        mutation,
        viewName: view.viewName,
        query: '',
      });

      if (error) {
        onError?.(error.message);

        renderErrorToast('error.createRecord', () => {
          store$.errorDialog.error.set(error);
        });
      } else {
        if (toast) {
          renderSuccessToast('');
        }

        console.warn('Record created successfully');
        onSuccess?.();
      }
    };

    runMutation();
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
  sortedRecord?: RecordType;
  store$: Observable<LegendStore>;
  updateGlobalDataModel?: boolean;
}): (() => void) => {
  console.warn('Starting optimistic update', record);
  const originalRows = [...store$.dataModel.rows.get()];

  // Merge updated row data
  const updatedRowData = { ...row.raw, ...record };
  console.warn('Updated row data:', updatedRowData);

  // Generate updated data rows
  const updatedRawRows = originalRows.map((r) =>
    r.id === row.id ? { ...r.raw, ...(sortedRecord ?? record) } : r.raw
  );
  const viewName = store$.viewConfigManager.get().getViewName();
  const updatedRows = makeData(
    store$.views.get(),
    viewName
  )(updatedRawRows).rows;

  // Update context menu
  const updatedRow = makeData(store$.views.get(), viewName)([updatedRowData])
    .rows?.[0];

  if (updatedRow) {
    store$.list.selectedRelationField.row.raw.set(updatedRow.raw);
    // const selectedOption = store$.list.rowInFocus.row.get();
    store$.list.rowInFocus.row.set(updatedRow);

    store$.contextMenuState.row.set(updatedRow);
    if (updateGlobalDataModel) {
      store$.dataModel.rows.set(updatedRows);
    }
  }

  // Return rollback function
  return () => {
    console.warn('Rolling back optimistic update');
    store$.dataModel.rows.set(originalRows);
    store$.contextMenuState.row.set(row);
  };
};
