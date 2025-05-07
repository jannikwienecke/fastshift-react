import {
  _log,
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
import { createRow } from './legend.form.helper';
import { selectState$, xSelect } from './legend.select-state';
import { LegendStore, StoreFn } from './legend.store.types';
import {
  copyRow,
  getViewConfigManager,
  isDetail,
  isTabs,
} from './legend.utils';
import { setGlobalDataModel } from './legend.utils.helper';

// Temporary states
const checkedRows$ = observable<Row[]>([]);
const idsToDelete$ = observable<string[]>([]);
const isRunning$ = observable(false);
export const ignoreNewData$ = observable(0);

export const selectRowsMutation: StoreFn<'selectRowsMutation'> =
  (store$) =>
  async ({
    field,
    existingRows = [],
    checkedRow,
    row,
    newRows,
    newIds,
    idsToDelete,
  }) => {
    const viewConfigManager = getViewConfigManager();

    _log.warn('___RUN Mutation', { newRows, idsToDelete, newIds });

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
    }

    isRunning$.set(true);

    const mutation: Mutation = {
      type: 'SELECT_RECORDS',
      payload: {
        id: row.id,
        table: getRelationTableName(field),
        idsToDelete: idsToDelete,
        newIds: newIds,
      },
    };

    const { error } = await store$.api.mutateAsync({
      mutation,
      viewName: viewConfigManager.viewConfig.viewName,
      query: store$.globalQuery.get(),
    });

    if (error) {
      _log.error('Error selecting rows:', error);
      rollback?.();
      renderErrorToast('error.updateRecord', () => {
        store$.errorDialog.error.set(error);
      });
    } else {
      console.warn('Rows selected successfully');
      checkedRows$.set([]);
      idsToDelete$.set([]);
      isRunning$.set(false);
    }

    // Reset temporary states
  };

export const updateRecordMutation: StoreFn<'updateRecordMutation'> =
  (store$) =>
  async ({ field, valueRow, row }, onSuccess, onError) => {
    const viewConfigManager = getViewConfigManager();

    const patchValue = field.relation
      ? ifNoneNullElseValue(valueRow.id)
      : ifNoneNullElseValue(valueRow.raw);

    const record = {
      [field.relation?.fieldName ?? field.name]: patchValue,
    };
    console.warn('Record to update:', record);

    const fieldName =
      viewConfigManager.getFieldBy(field.name).relation?.fieldName ?? '';

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
      viewName: viewConfigManager.viewConfig.viewName,
      query: store$.globalQuery.get(),
    });

    if (error) {
      console.error('Error updating record:', error);
      rollback();
      onError?.(error.message);
      renderErrorToast('error.updateRecord', () => {
        store$.errorDialog.error.set(error);
      });
    } else {
      console.warn('Record updated successfully');
      onSuccess?.();
    }
  };

export const updateFullRecordMutation: StoreFn<'updateFullRecordMutation'> =
  (store$) =>
  async ({ record, row }, onSuccess, onError) => {
    const viewConfigManager = getViewConfigManager();
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
      viewName: viewConfigManager.viewConfig.viewName,
      query: store$.globalQuery.get(),
    });

    if (error) {
      console.error('Error updating record:', error);
      rollback();
      onError?.(error.message);
      renderErrorToast('error.updateRecord', () => {
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
    const viewConfigManager = getViewConfigManager();

    const runMutation = async () => {
      const allRows = store$.dataModel.rows.get();
      const rollbackRows = allRows.map((r) => copyRow(r));
      const rows = allRows.filter((r) => r.id !== row.id);
      store$.dataModel.rows.set(rows);

      const mutation: Mutation = {
        type: 'DELETE_RECORD',
        payload: {
          id: row.id,
        },
      };
      const { error } = await store$.api.mutateAsync({
        mutation,
        viewName: viewConfigManager.viewConfig.viewName,
        query: store$.globalQuery.get(),
      });

      if (error) {
        onError?.(error.message);

        renderErrorToast('error.deleteRecord', () => {
          store$.errorDialog.error.set(error);
        });

        store$.dataModel.rows.set(rollbackRows);
      } else {
        console.warn('Record deleted successfully');
        onSuccess?.();
      }
    };

    if (viewConfigManager.getUiViewConfig().onDelete?.showConfirmation) {
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
  async (
    { record, view, toast, updateGlobalDataModel },
    onSuccess,
    onError
  ) => {
    const viewConfigManager = getViewConfigManager();

    const row = createRow({
      ...record,
      id: '_tempId' + Math.random().toString(36).substring(2, 9),
      [INTERNAL_FIELDS.creationTime.fieldName]: Date.now(),
    });

    const optimisicRecord = row ? patchRecord(row.raw, store$) : {};

    if (!row) return;

    const currentRows = store$.dataModel.rows.get().map((r) => r.raw);
    const rows = store$.displayOptions.sorting.field.get()
      ? [optimisicRecord, ...currentRows]
      : [...currentRows, optimisicRecord];

    updateGlobalDataModel && store$.createDataModel(rows);

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

        updateGlobalDataModel &&
          store$.createDataModel(currentRows.map((r) => r['raw']));
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
  const viewConfigManager = getViewConfigManager();

  _log.debug('Starting optimistic update', { updateGlobalDataModel, record });

  const originalRow = copyRow(row);

  record = patchRecord(record, store$);

  const originalRows = [...store$.dataModelBackup.rows.get()].map((r) =>
    copyRow(r)
  );

  // Merge updated row data
  const updatedRowData = {
    ...row.raw,
    ...record,
  };
  // Generate updated data rows
  const updatedRawRows = originalRows.map((r) =>
    r.id === row.id ? { ...r.raw, ...(sortedRecord ?? updatedRowData) } : r.raw
  );

  const viewName = viewConfigManager.getViewName();
  const updatedRows = makeData(
    store$.views.get(),
    viewName
  )(updatedRawRows).rows;

  // Update context menu
  const updatedRow = makeData(store$.views.get(), viewName)([updatedRowData])
    .rows?.[0];

  updatedRow.updated = Date.now();

  if (updatedRow) {
    if (store$.list.selectedRelationField.row.get()) {
      store$.list.selectedRelationField.row.raw.set(updatedRow.raw);
    }

    if (store$.commandbar.activeRow.get()) {
      store$.commandbar.activeRow.set(updatedRow);
    }

    if (store$.list.rowInFocus.row.get()) {
      store$.list.rowInFocus.row.set(updatedRow);
    }
    if (store$.contextMenuState.row.get()) {
      store$.contextMenuState.row.set(copyRow(updatedRow));
    }

    if (selectState$.parentRow.get()) {
      selectState$.parentRow.raw.set(updatedRow.raw);
    }

    // TODO DETAIL BRANCHING
    if (store$.detail.row.get() && isDetail() && !isTabs()) {
      store$.detail.row.set(updatedRow);
    }

    if (store$.detail.row.get() && isTabs()) {
      const activeTabField = store$.detail.activeTabField.get();

      const updatedRowData = {
        ...store$.detail.row.raw.get(),
        [activeTabField?.field?.name ?? '']: updatedRow.raw,
      };

      const row = makeData(
        store$.views.get(),
        store$.detail.viewConfigManager.getViewName()
      )([updatedRowData]).rows?.[0];

      store$.detail.row.set(row);
    }

    if (updateGlobalDataModel && !isDetail()) {
      console.warn('____UPDATE GLOBAL DATA MODEL');

      updatedRows.map((r) => {
        const hasRow = r.id === updatedRow.id;
        if (hasRow) {
          r.updated = Date.now();
          return r;
        }
        return r;
      });

      setGlobalDataModel(updatedRows);
    }
  }

  // Return rollback function
  return () => {
    setTimeout(() => {
      _log.warn('Rolling back optimistic update', originalRows);
      isRunning$.set(false);

      setGlobalDataModel(originalRows);

      if (store$.contextMenuState.row.get())
        store$.contextMenuState.row.set(copyRow(originalRow));

      if (store$.detail.row.get()) store$.detail.row.set(copyRow(originalRow));

      if (store$.commandbar.activeRow.get())
        store$.commandbar.activeRow.set(copyRow(originalRow));

      if (store$.list.rowInFocus.row.get())
        store$.list.rowInFocus.row.set(copyRow(originalRow));

      if (store$.list.selectedRelationField.row.get()) {
        store$.list.selectedRelationField.row.set(copyRow(originalRow));
      }

      if (selectState$.parentRow.get()) {
        selectState$.parentRow.set(copyRow(originalRow));
      }

      if (selectState$.parentRow.get()) {
        xSelect.onError();
      }
    }, 0);
  };
};

export const patchRecord = (
  record: RecordType,
  store$: Observable<LegendStore>
) => {
  const viewConfigManager = getViewConfigManager();
  const commandformRow =
    store$.commandform.open.get() && store$.commandform.row.get();

  record = Object.entries(record).reduce((prev, [key, value]) => {
    const _value = value === NONE_OPTION ? undefined : value;

    try {
      const field = viewConfigManager.getFieldBy(key);
      const manyToManyTablename = field.relation?.manyToManyTable;

      if (manyToManyTablename && commandformRow) {
        const rows = commandformRow?.raw?.[key];

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
      const field = viewConfigManager.getFieldByRelationFieldName(key);

      if (commandformRow && field) {
        return {
          ...prev,
          [field.name]:
            selectState$.parentRow.raw[field.name].get() ??
            commandformRow.raw[field.name],
        };
      }
    }

    return { ...prev, [key]: _value };
  }, record);

  return record;
};
