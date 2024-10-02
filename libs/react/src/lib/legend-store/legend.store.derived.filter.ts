import { FilterItemType, MakeFilterPropsOptions } from '@apps-next/core';
import { observable } from '@legendapp/state';
import { store$ } from './legend.store';
import { getFilterValue } from '../ui-adapter/filter-adapter';

export const makeFilterPropsOptions = observable(
  {} as MakeFilterPropsOptions | undefined
);

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
