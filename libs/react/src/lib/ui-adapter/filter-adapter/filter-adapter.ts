import { FilterItemType, FilterProps, FilterType } from '@apps-next/core';
import { useFilterState } from '../../store.ts';
import { useFilterStore } from './filter.store.js';
import { useFilter } from './use-filter.js';

export const getFilterValue = (f: FilterType) => {
  if (f.type === 'relation') {
    return f.values.length === 1
      ? f.values[0].label
      : `${f.values.length} ${f.field.name}`;
  }

  return f.value.label;
};

export const useFilterAdapter = (): (() => FilterProps) => {
  const { setFilter } = useFilterState();

  const { getFilterComboboxProps } = useFilter({
    onSelect: (props) => {
      setFilter({
        field: props.field,
        value: props.value,
      });
    },
  });

  const { open } = useFilterStore();
  const { filter } = useFilterState();

  const filters_ = filter.fitlers.map((f) => {
    return {
      label: f.field.name,
      name: f.field.name,
      operator: f.operator.label,
      value: getFilterValue(f),
    } satisfies FilterItemType;
  });

  return (): FilterProps => {
    return {
      onOpen: () => open(true),
      filters: filters_,
      comboboxProps: getFilterComboboxProps(),
    };
  };
};
