import { Observable, observable } from '@legendapp/state';
import { LegendStore } from './legend.store.types';
import {
  comboboxDebouncedQuery$,
  initSelected$,
  newSelected$,
  removedSelected$,
} from './legend.combobox.helper';
import { comboboxStore$ } from './legend.store.derived.combobox';

export const addEffects = (store$: Observable<LegendStore>) => {
  observable(function handleResetCombobox() {
    const listRelationField = store$.list.selectedRelationField.get();
    const filterField = store$.filter.selectedField.get();
    const filterDateField = store$.filter.selectedDateField.get();
    const filterOperatorField = store$.filter.selectedOperatorField.get();
    const commandbarField = store$.commandbar.selectedViewField.get();

    if (
      !listRelationField &&
      !filterField &&
      !filterDateField &&
      !filterOperatorField &&
      !commandbarField
    ) {
      store$.combobox.selected.set([]);
      store$.combobox.values.set(null);
      store$.combobox.query.set('');
      store$.combobox.multiple.set(false);
      store$.combobox.datePicker.set(null);
      initSelected$.set(null);
      newSelected$.set([]);
      removedSelected$.set([]);
    }

    let timeout: NodeJS.Timeout;
    store$.combobox.query.onChange(() => {
      clearTimeout(timeout);

      if (store$.combobox.query.get() === '') {
        comboboxDebouncedQuery$.set('');
      } else {
        timeout = setTimeout(() => {
          comboboxDebouncedQuery$.set(store$.combobox.query.get());
        }, 200);
      }
    });
  }).onChange(() => null);

  observable(function handleQueryCommandbarChange() {
    const query = store$.commandbar.query.get();
    const fieldCommandbar = store$.commandbar.selectedViewField.get();
    const tableName = comboboxStore$.get().tableName;
    if (!tableName) return;
    if (fieldCommandbar?.name !== tableName) return;

    comboboxDebouncedQuery$.set(query ?? '');
  }).onChange(() => null);

  observable(function handleFilterChange() {
    const filters = store$.filter.filters.get();

    store$.fetchMore.assign({
      reset: true,
      isFetching: true,
      isFetched: false,
      isDone: false,
      currentCursor: { cursor: null, position: null },
      nextCursor: { cursor: null, position: null },
    });
  }).onChange(() => null);

  observable(function handleDisplayOptionsChange() {
    const field = store$.displayOptions.sorting.field.get();
    const order = store$.displayOptions.sorting.order.get();
    const grouping = store$.displayOptions.grouping.field.get();

    (field?.name || grouping?.name) &&
      console.log(
        'handleDisplayOptionsChange: ',
        field?.name,
        order,
        grouping?.name
      );

    store$.fetchMore.assign({
      reset: true,
      isFetching: true,
      isFetched: false,
      isDone: false,
      currentCursor: { cursor: null, position: null },
      nextCursor: { cursor: null, position: null },
    });
  }).onChange(() => null);
};
