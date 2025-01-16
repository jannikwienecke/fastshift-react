import { Observable, observable } from '@legendapp/state';
import { LegendStore } from './legend.store.types';
import { comboboxDebouncedQuery$ } from './legend.combobox.helper';

export const addEffects = (store$: Observable<LegendStore>) => {
  observable(function handleResetCombobox() {
    const listRelationField = store$.list.selectedRelationField.get();
    const filterField = store$.filter.selectedField.get();
    const filterDateField = store$.filter.selectedDateField.get();
    const filterOperatorField = store$.filter.selectedOperatorField.get();

    if (
      !listRelationField &&
      !filterField &&
      !filterDateField &&
      !filterOperatorField
    ) {
      store$.combobox.selected.set([]);
      store$.combobox.values.set(null);
      store$.combobox.query.set('');
      store$.combobox.multiple.set(false);
      store$.combobox.datePicker.set(null);
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

  observable(function handleQueryChange() {
    const query = store$.combobox.query.get();

    if (query === '') {
      store$.combobox.values.set(null);
    }
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

    field?.name &&
      console.log('handleDisplayOptionsChange: ', field?.name, order);

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
