import {
  FilterProps,
  FilterType,
  MakeFilterPropsOptions,
  RecordType,
} from '@apps-next/core';
import {
  filterItems$,
  makeFilterPropsOptions,
  store$,
} from '../../legend-store';

export const getFilterValue = (f: FilterType): string => {
  if (f.type === 'relation') {
    return f.values.length === 1
      ? f.values[0]?.label ?? ''
      : `${f.values.length} ${f.field.name}`;
  }

  return f.value?.label ?? '';
};

const getFilter = (name: string) => {
  const _f = store$.filter.filters.get().find((f) => f.field.name === name);
  if (!_f) throw new Error('Filter not found');
  return _f;
};

export const makeFilterProps = <T extends RecordType>(
  options?: MakeFilterPropsOptions<T>
): FilterProps => {
  makeFilterPropsOptions.set(options);

  return {
    onOpen: store$.filterOpen,
    filters: filterItems$.get(),

    onRemove: ({ name }) => store$.filterRemoveFilter(getFilter(name)),
    onSelect: (value, rect) => {
      const filter = getFilter(value.name);
      store$.filterOpenExisting(filter, rect);
    },
    onOperatorClicked: (filter, rect) => {
      store$.filterOpenOperator(getFilter(filter.name), rect);
    },
  };
};
