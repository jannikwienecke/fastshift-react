import {
  ComboboxPopoverProps,
  ComboxboxItem,
  DatePickerProps,
  FilterProps,
  FilterType,
  MakeFilterPropsOptions,
  RecordType,
} from '@apps-next/core';
import { store$ } from '../../legend-store';
import {
  filterComboboxValues$,
  filterItems$,
  makeFilterPropsOptions,
  selectedDateFilter$,
} from '../../legend-store/legend.store.derived.filter.js';
import { FilterValue } from '../../ui-components/render-filter-value.js';

export const getFilterValue = (f: FilterType) => {
  if (f.type === 'relation') {
    return f.values.length === 1
      ? f.values[0].label
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

  const comboboxProps = {
    ...store$.filter.get(),
    values: filterComboboxValues$.get(),
    name: 'filter',
    multiple: false,
    searchable: true,
    input: {
      onChange: store$.filterUpdateQuery,
      query: store$.filter.query.get(),
      placeholder: options?.placeholder ?? 'Filter...',
    },
    selected: null,
    onChange: store$.filterSelectFilterType,

    onOpenChange: (isOpen) => {
      if (isOpen) return;
      store$.filterCloseAll();
    },
    render: (value) => <FilterValue value={value} />,
  } satisfies ComboboxPopoverProps<ComboxboxItem>;

  const datePickerProps = {
    selected: selectedDateFilter$.get(),
    onSelect: store$.filterSelectFromDatePicker,
    open: store$.filter.showDatePicker.get(),
    rect: store$.filter.rect.get(),
    onOpenChange: (open) => {
      if (!open) {
        store$.filterCloseAll();
      }
    },
  } satisfies DatePickerProps;

  return {
    onOpen: store$.filterOpen,
    filters: filterItems$.get(),
    datePickerProps: store$.filter.showDatePicker.get()
      ? datePickerProps
      : null,
    comboboxProps: comboboxProps,
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
