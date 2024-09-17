import { FilterItemType, FilterProps, FilterType } from '@apps-next/core';
import { useFilterStore } from '../../store.ts';
import { useFiltering } from './filter.store.js';
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
  const { setFilter, filter, removeFilter } = useFilterStore();
  const { open, select, setPosition } = useFiltering();

  const { getFilterComboboxProps } = useFilter({
    onSelect: (props) => {
      setFilter({
        field: props.field,
        value: props.value,
      });
    },
  });

  const filters_ = filter.fitlers.map((f) => {
    return {
      label: f.field.name,
      name: f.field.name,
      operator: f.operator.label,
      value: getFilterValue(f),
    } satisfies FilterItemType;
  });

  const getFilter = (name: string) => {
    const _f = filter.fitlers.find((f) => f.field.name === name);
    if (!_f) throw new Error('Filter not found');
    return _f;
  };

  return (): FilterProps => {
    return {
      onOpen: () => open(true),
      filters: filters_,

      comboboxProps: getFilterComboboxProps(),
      onRemove: ({ name }) => removeFilter(getFilter(name)),
      onSelect: ({ name }, rect) => {
        setPosition(rect);

        select({
          id: name,
          label: name,
        });
      },
    };
  };
};
