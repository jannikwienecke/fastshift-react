import { FieldConfig, Row } from '@apps-next/core';
import { observable } from '@legendapp/state';
import { store$ } from './legend.store';
import { a } from 'framer-motion/dist/types.d-B50aGbjN';

export const selectState$ = observable({
  parentRow: null as Row | null,
  field: {} as FieldConfig,
  initalRows: [] as Row[],

  newRows: [] as Row[],
  removedRows: [] as Row[],

  toInsertRow: null as null | Row,
  toRemoveRow: null as null | Row,

  initialSelectedFilterRows: [] as Row[],
  selectedFilterRows: [] as Row[],
});

const getParentRow = () => {
  const row = store$.dataModel.rows
    .get()
    .find((r) => r.id === selectState$.parentRow.get()?.id);

  return row;
};
const getCurrentRows = () => {
  const field = selectState$.field.get();
  if (!field) return [];

  const parentRow = getParentRow();

  const rows = parentRow?.getValue?.(field.name);
  if ((rows as Row)?.id) return [rows];
  if (!Array.isArray(rows)) return [];
  return rows;
};

const getState = () => {
  const field = selectState$.field.get() as FieldConfig | undefined;
  const parentRow = getParentRow();
  const existingRows = getCurrentRows();
  const toInsert = selectState$.toInsertRow.get() as Row | null;
  const toRemove = selectState$.toRemoveRow.get() as Row | null;
  const removedRows = selectState$.removedRows.get() as Row[];
  const newRows = selectState$.newRows.get() as Row[];

  if (!field || !parentRow || !removedRows) throw new Error('Invalid state');

  return {
    field,
    parentRow,
    existingRows,
    toInsert,
    toRemove,
    newRows,
    removedRows,
  };
};

export const open = (row: Row, field: FieldConfig) => {
  selectState$.parentRow.set(row);
  selectState$.field.set(field);

  const initalRows = getCurrentRows();

  selectState$.initalRows.set(initalRows);
  selectState$.newRows.set([]);
  selectState$.toInsertRow.set(null);
  selectState$.toRemoveRow.set(null);
};

export const close = () => {
  selectState$.initalRows.set([]);
  selectState$.newRows.set([]);
  selectState$.toInsertRow.set(null);
  selectState$.toRemoveRow.set(null);
  selectState$.removedRows.set([]);
  selectState$.parentRow.set(null);
  selectState$.field.set({} as FieldConfig);
  selectState$.initialSelectedFilterRows.set([]);
  selectState$.selectedFilterRows.set([]);
};

export const select = (row: Row) => {
  const isInInitialRows = selectState$.initalRows
    .get()
    .some((r) => r.id === row.id);

  const isInNewRows = selectState$.newRows.get().some((r) => r.id === row.id);
  const isInRemovedRows = selectState$.removedRows
    .get()
    .some((r) => r.id === row.id);

  if (isInRemovedRows) {
    console.warn('___ADD BACK');
    selectState$.removedRows.set((prev) => prev.filter((r) => r.id !== row.id));
    selectState$.newRows.set((prev) => [...prev, row]);
    selectState$.toInsertRow.set(row);
  } else if (isInInitialRows) {
    console.warn('___REMOVE');
    selectState$.toRemoveRow.set(row);
    selectState$.removedRows.set((prev) => [...prev, row]);
  } else if (isInNewRows) {
    console.warn('___REMOVE FROM NEW ROWS');
    selectState$.newRows.set((prev) => prev.filter((r) => r.id !== row.id));
    selectState$.toRemoveRow.set(row);
  } else {
    console.warn('___ADD');
    selectState$.newRows.set((prev) => [...prev, row]);
    selectState$.toInsertRow.set(row);
  }
};

const onError = () => {
  const { toInsert, toRemove, existingRows, removedRows, newRows } = getState();

  console.warn('___ROLLBACK', {
    toInsert,
    toRemove,
    existingRows,
    removedRows,
    newRows,
  });

  if (toRemove) {
    selectState$.removedRows.set((prev) =>
      prev.filter((r) => r.id !== toRemove.id)
    );

    selectState$.toRemoveRow.set(null);
  }

  if (toInsert) {
    selectState$.newRows.set((prev) =>
      prev.filter((r) => r.id !== toInsert.id)
    );

    selectState$.toInsertRow.set(null);
  }
};

export const xSelect = {
  select,
  open,
  close,
  onError,
};

selectState$.toRemoveRow.onChange((state) => {
  console.warn('___TO REMOVE: ', state.value);
  if (!state.value) return;

  const { field, parentRow, existingRows } = getState();
  const row = state.value as Row | null;

  if (!row) return;

  store$.selectRowsMutation({
    checkedRow: row,
    field,
    existingRows,
    row: parentRow,
    idsToDelete: [row.id],
    newIds: [],
    newRows: existingRows.filter((r) => r.id !== row.id),
  });
  selectState$.toInsertRow.set(null);
});

selectState$.toInsertRow.onChange((state) => {
  console.warn('___TO INSERT: ', state.value);
  if (!state.value) return;

  const { field, parentRow, existingRows } = getState();
  const row = state.value as Row | null;

  if (!row) return;

  store$.selectRowsMutation({
    checkedRow: row,
    field,
    existingRows,
    row: parentRow,
    idsToDelete: [],
    newIds: [row.id],
    newRows: [...existingRows, row],
  });
  selectState$.toRemoveRow.set(null);
});
