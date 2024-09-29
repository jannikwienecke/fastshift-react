import {
  ComboxboxItem,
  FilterItemType,
  MakeFilterPropsOptions,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import {
  filterUtil,
  getFilterValue,
  operator,
} from '../ui-adapter/filter-adapter';
import { store$ } from './legend.store';
import { FilterStore } from './legend.store.types';

export const makeFilterPropsOptions = observable(
  {} as MakeFilterPropsOptions | undefined
);
// derived stores from main store
export const filterValuesStore$ = observable<FilterStore>(() => {
  const viewConfigManager = store$.viewConfigManager.get();
  const viewFields = viewConfigManager.getViewFieldList();
  const operatorField = store$.filter.selectedOperatorField.get();

  let values: ComboxboxItem[] = viewFields.map((field) => {
    return {
      id: field.name,
      label: field.name,
    };
  });

  if (operatorField) {
    const allFilters = store$.filter.filters.get();
    const filter = allFilters.find((f) => f.field.name === operatorField.name);
    values = filter ? operator().makeOptionsFrom(filter.field, filter) : [];
  }

  return {
    ...store$.filter.get(),
    values,
  };
});

export const filterItems$ = observable(() =>
  store$.filter.filters.get().map((f) => {
    return {
      label: f.field.name,
      name: f.field.name,
      operator: f.operator.label,
      value: getFilterValue(f),
    } satisfies FilterItemType;
  })
);

export const filterComboboxValues$ = observable(() =>
  filterValuesStore$.values.get().filter((f) => {
    if (makeFilterPropsOptions.get()?.hideFields) {
      return !makeFilterPropsOptions.get()?.hideFields.includes(f.id);
    }
    return true;
  })
);

export const selectedDateFilter$ = observable(() => {
  const currentDateFilter = store$.filter.filters
    .get()
    ?.find((f) => f.field.name === store$.filter.selectedDateField.get()?.name);

  return currentDateFilter
    ? new Date(filterUtil().getValue(currentDateFilter))
    : undefined;
});
