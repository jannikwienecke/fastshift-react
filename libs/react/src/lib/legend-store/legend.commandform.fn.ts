import { makeData, RecordType, Row } from '@apps-next/core';
import {
  getDefaultRow,
  getFormState,
  getRecordTypeFromRow,
} from './legend.commandform.helper';
import { comboboxStore$ } from './legend.store.derived.combobox';
import { StoreFn } from './legend.store.types';

export const commandformOpen: StoreFn<'commandformOpen'> =
  (store$) => (viewName) => {
    const view = store$.views[viewName]?.get();
    console.log('OPEN', view);

    if (!view) return;

    store$.commandform.open.set(true);
    store$.commandform.view.set(view);

    const defaultRow = getDefaultRow();
    defaultRow && store$.commandform.row.set(defaultRow);
  };

export const commandformClose: StoreFn<'commandformClose'> = (store$) => () => {
  store$.commandform.open.set(false);
  store$.commandform.view.set(undefined);
  store$.commandform.field.set(undefined);
  store$.commandform.rect.set(undefined);
};

export const commanformSelectRelationalValue: StoreFn<
  'commanformSelectRelationalValue'
> = (store$) => (selectedRow) => {
  const { field, view, row } = store$.commandform.get() ?? {};
  if (!field || !view) return;

  const existingRow: RecordType | RecordType[] | null =
    row?.raw?.[field.name] ?? null;
  const prevValues: RecordType[] = Array.isArray(existingRow)
    ? existingRow
    : [];

  const value = field.relation?.manyToManyTable
    ? [...prevValues, selectedRow.raw]
    : selectedRow.raw;

  const data = makeData(
    store$.views.get(),
    view.viewName
  )([{ ...(row?.raw ?? {}), [field.name]: value }]);

  if (!comboboxStore$.showCheckboxInList.get()) {
    // dont close if i can sleect many fields
    store$.commandform.rect.set(undefined);
    store$.commandform.field.set(undefined);
  }

  store$.commandform.row.set(data.rows?.[0]);
};

export const commandformChangeInput: StoreFn<'commandformChangeInput'> =
  (store$) => (field, value) => {
    const { view } = store$.commandform.get() ?? {};
    const row = store$.commandform.row.get() as Row | undefined;
    if (!view || !field.field) return;

    if (!row) {
      const data = makeData(
        store$.views.get(),
        view.viewName
      )([{ [field.field?.name]: value }]);
      store$.commandform.row.set(data.rows?.[0]);
    } else {
      const data = makeData(
        store$.views.get(),
        view.viewName
      )([{ ...row.raw, [field.field?.name]: value }]);
      store$.commandform.row.set(data.rows?.[0]);
    }
  };

export const commandformSubmit: StoreFn<'commandformSubmit'> =
  (store$) => async () => {
    const { row, view } = store$.commandform.get() ?? {};
    if (!row || !view) return;

    console.log(row);
    const formState = getFormState();
    if (!formState.isReady) return;

    store$.createRecordMutation(
      {
        view,
        record: getRecordTypeFromRow(),
        toast: true,
      },
      () => {
        store$.commandformClose();
      }
    );
  };
