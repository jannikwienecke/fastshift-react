import {
  _log,
  getViewByName,
  makeData,
  RecordType,
  Row,
} from '@apps-next/core';
import { getTimeValueFromDateString } from '../ui-adapter/filter-adapter';
import {
  getDefaultRow,
  getFormState,
  getRecordTypeFromRow,
} from './legend.form.helper';
import { parentView$ } from './legend.shared.derived';
import { comboboxStore$ } from './legend.store.derived.combobox';
import { StoreFn } from './legend.store.types';
import { copyRow, getIsManyRelationView } from './legend.utils';

export const commandformOpen: StoreFn<'commandformOpen'> =
  (store$) => (viewName, row, defaultRecord) => {
    store$.openSpecificModal('commandform', () => {
      const view = getViewByName(store$.views.get(), viewName);

      if (!view) return;

      store$.commandform.open.set(true);
      store$.commandform.view.set(view);

      let defaultRow: Row | null = null;

      const isMany = getIsManyRelationView(view.tableName);

      if (isMany) {
        const parentView = parentView$.get();
        // create tag in tasks. New Tag. That has a many to many relation to tasks
        // in comparison, create task in project. New Task. That has a one to many relation to project
        const parentIsListRelation =
          view.viewFields[parentView?.tableName].isList;

        const tableName = parentView?.tableName ?? '';
        defaultRow = getDefaultRow({
          [tableName]: parentIsListRelation
            ? [store$.detail.row.get()]
            : store$.detail.row.get(),
        });
      } else {
        defaultRow = getDefaultRow(defaultRecord ?? {});
      }

      defaultRow && store$.commandform.row.set(row || defaultRow);

      store$.commandform.type.set(row?.id ? 'edit' : 'create');
    });
  };

export const commandformClose: StoreFn<'commandformClose'> = (store$) => () => {
  store$.commandform.open.set(false);
  store$.commandform.view.set(undefined);
  store$.commandform.field.set(undefined);
  store$.commandform.rect.set(undefined);
  store$.commandform.row.set(undefined);
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

  let value;

  if (field.relation?.manyToManyTable) {
    // Check if item already exists
    const exists = prevValues.some((v) => v['id'] === selectedRow.raw['id']);
    value = exists
      ? prevValues.filter((v) => v['id'] !== selectedRow.raw['id'])
      : [...prevValues, selectedRow.raw];
  } else {
    const isNumber = !isNaN(+selectedRow.id);

    value =
      field.type === 'Date' && isNumber
        ? new Date(selectedRow.raw).getTime()
        : field.type === 'Date'
        ? getTimeValueFromDateString(selectedRow.id, true)
        : selectedRow.raw;
  }

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
    const { row, view, type } = store$.commandform.get() ?? {};

    if (!row || !view) return;

    const formState = getFormState();
    if (!formState.isReady) return;

    const field = store$.commandform.field.get();
    const rect = store$.commandform.rect.get();
    const copiedRow = copyRow(row);

    const viewIsCurrentView =
      view.viewName === store$.viewConfigManager.getViewName();
    if (type === 'edit') {
      store$.updateFullRecordMutation(
        {
          record: getRecordTypeFromRow(),
          row: row as Row,
          view,
          updateGlobalDataModel: true,
        },
        () => {
          _log.info('Record updated successfully');
        },
        () => {
          store$.commandform.open.set(true);
          store$.commandform.view.set(view);
          store$.commandform.field.set(field);
          store$.commandform.rect.set(rect);
          store$.commandform.row.set(copiedRow);
        }
      );
    } else {
      store$.createRecordMutation(
        {
          view,
          record: getRecordTypeFromRow(),
          toast: true,
          updateGlobalDataModel: !!viewIsCurrentView,
        },
        () => _log.info('Record created successfully'),
        (error) => {
          _log.info('Error creating record. Resetting form state', error);
          store$.commandform.open.set(true);
          store$.commandform.view.set(view);
          store$.commandform.field.set(field);
          store$.commandform.rect.set(rect);
          store$.commandform.row.set(copiedRow);
        }
      );
    }

    store$.commandformClose();
  };
