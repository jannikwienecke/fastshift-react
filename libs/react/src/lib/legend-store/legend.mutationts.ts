import {
  getRelationTableName,
  ifNoneNullElseValue,
  INTERNAL_FIELDS,
  makeData,
  Mutation,
  NONE_OPTION,
  RecordType,
  Row,
} from '@apps-next/core';
import { observable, Observable } from '@legendapp/state';
import { renderErrorToast, renderSuccessToast } from '../toast';
import { createRow } from './legend.commandform.helper';
import { LegendStore, StoreFn } from './legend.store.types';
import { copyRow } from './legend.utils';

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

export const updateFullRecordMutation: StoreFn<'updateFullRecordMutation'> =
  (store$) =>
  async ({ record, row }, onSuccess, onError) => {
    console.warn('Starting FULL updateRecordMutation');

    const rollback = optimisticUpdateStore({
      store$,
      row,
      record,
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
      onError?.(error.message);
      renderErrorToast('error.updateError', () => {
        store$.errorDialog.error.set(error);
      });
    } else {
      onSuccess?.();
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
    const row = createRow({
      ...record,
      id: '_tempId' + Math.random().toString(36).substring(2, 9),
      [INTERNAL_FIELDS.creationTime.fieldName]: Date.now(),
    });

    if (!row) return;

    const currentRows = store$.dataModel.rows.get();
    const rows = store$.displayOptions.sorting.field.get()
      ? [row, ...currentRows]
      : [...currentRows, row];

    store$.createDataModel(rows.map((r) => r.raw));

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

        store$.createDataModel(currentRows.map((r) => r.raw));
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
  console.warn('Starting optimistic update', { updateGlobalDataModel, record });

  record = Object.entries(record).reduce((prev, [key, value]) => {
    const _value = value === NONE_OPTION ? undefined : value;
    const commandformRow =
      store$.commandform.open.get() && store$.commandform.row.get();

    try {
      const field = store$.viewConfigManager.getFieldBy(key);
      const manyToManyTablename = field.relation?.manyToManyTable;

      if (manyToManyTablename && commandformRow) {
        // for many to many fields, we need the full row and not just the id
        const rows = commandformRow.raw[key];
        if (rows.length) {
          return {
            ...prev,
            [key]: rows,
          };
        }
      } else if (field.relation && commandformRow) {
        return {
          ...prev,
        };
      }
    } catch (error) {
      const field = store$.viewConfigManager.getFieldByRelationFieldName(key);
      if (commandformRow) {
        return {
          [field.name]: commandformRow.raw[field.name],
        };
      }
    }

    return { ...prev, [key]: _value };
  }, record);

  const originalRows = [...store$.dataModel.rows.get()];

  // Merge updated row data
  const updatedRowData = {
    ...row.raw,
    ...record,
  };
  // Generate updated data rows
  const updatedRawRows = originalRows.map((r) =>
    r.id === row.id ? { ...r.raw, ...(sortedRecord ?? updatedRowData) } : r.raw
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
    if (store$.list.selectedRelationField.row.get()) {
      store$.list.selectedRelationField.row.raw.set(updatedRow.raw);
    }

    if (store$.list.rowInFocus.row.get()) {
      store$.list.rowInFocus.row.set(updatedRow);
    }
    if (store$.contextMenuState.row.get()) {
      store$.contextMenuState.row.set(copyRow(updatedRow));
    }

    if (updateGlobalDataModel) {
      store$.dataModel.set((prev) => {
        return {
          ...prev,
          rows: updatedRows,
        };
      });
    }
  }

  // Return rollback function
  return () => {
    console.warn('Rolling back optimistic update');
    store$.dataModel.rows.set(originalRows);
    store$.contextMenuState.row.set(copyRow(row));
  };
};
