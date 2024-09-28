import {
  ComboboxPopoverProps,
  ComboxboxItem,
  DatePickerProps,
  FilterItemType,
  FilterProps,
  FilterType,
} from '@apps-next/core';
import { FilterValue } from '../../ui-components/render-filter-value.js';
import { filterUtil } from './filter.utils.js';
import { filterValuesStore$, store$ } from '../../legend-store';

export const getFilterValue = (f: FilterType) => {
  if (f.type === 'relation') {
    return f.values.length === 1
      ? f.values[0].label
      : `${f.values.length} ${f.field.name}`;
  }

  return f.value.label;
};

export const useFilterAdapter = (props?: {
  onSelect?: (value: ComboxboxItem) => void;
}): (() => FilterProps) => {
  const comboboxProps = {
    ...store$.filter.get(),
    values: filterValuesStore$.values.get(),
    name: 'filter',
    multiple: false,
    searchable: true,
    input: {
      onChange: store$.filterUpdateQuery,
      query: store$.filter.query.get(),
      placeholder: 'Filter...',
    },
    selected: null,
    onChange: (value) => {
      store$.filterSelectFilterType(value);
    },

    onOpenChange: (isOpen) => {
      if (!isOpen) {
        store$.filterClose();
      }
    },
    render: (value) => <FilterValue value={value} />,
  } satisfies ComboboxPopoverProps<ComboxboxItem>;

  const currentDateFilter = store$.filter.filters
    .get()
    ?.find((f) => f.field.name === store$.filter.selectedDateField.get()?.name);

  const datePickerProps = {
    selected: currentDateFilter
      ? new Date(filterUtil().getValue(currentDateFilter))
      : undefined,
    onSelect: store$.filterSelectFromDatePicker,
    open: store$.filter.showDatePicker.get(),
    rect: store$.filter.rect.get(),
    onOpenChange: (open) => {
      if (!open) {
        store$.filterCloseAll();
      }
    },
  } satisfies DatePickerProps;

  const filters_ = store$.filter.filters.get().map((f) => {
    return {
      label: f.field.name,
      name: f.field.name,
      operator: f.operator.label,
      value: getFilterValue(f),
    } satisfies FilterItemType;
  });

  const getFilter = (name: string) => {
    const _f = store$.filter.filters.get().find((f) => f.field.name === name);
    if (!_f) throw new Error('Filter not found');
    return _f;
  };

  return (): FilterProps => {
    return {
      onOpen: store$.filterOpen,
      filters: filters_,
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
};
