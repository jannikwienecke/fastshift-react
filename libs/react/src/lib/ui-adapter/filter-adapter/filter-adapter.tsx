import {
  ComboboxPopoverProps,
  ComboxboxItem,
  FilterItemType,
  FilterProps,
  FilterType,
} from '@apps-next/core';
import { useFilterStore } from '../../store.ts/index.js';
import { FilterValue } from '../../ui-components/render-filter-value.js';
import { useFiltering } from './filter.state.js';

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
  const { filter, removeFilter, setQuery } = useFilterStore();
  const {
    open,
    select,
    setPosition,
    openOperatorOptions,
    filterState,
    closeFieldOptions: close,
  } = useFiltering();

  const comboboxProps = {
    ...filterState,
    values: filterState.query.length
      ? filterState.filteredValues
      : filterState.values,
    name: 'filter',
    multiple: false,
    searchable: true,
    rect: filterState.rect,
    input: {
      onChange: (query) => {
        console.log('onChange', query);
        setQuery(query);
      },
      query: filterState.query,
      placeholder: 'Filter...',
    },
    selected: null,
    onChange: (value) => {
      select(value);
      close();
      props?.onSelect?.(value);
    },

    onOpenChange: (isOpen) => {
      if (!isOpen) {
        close();
      } else {
        open(true);
      }
    },
    render: (value) => <FilterValue value={value} />,
  } satisfies ComboboxPopoverProps<ComboxboxItem>;

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

      comboboxProps: comboboxProps,
      onRemove: ({ name }) => removeFilter(getFilter(name)),
      onSelect: (value, rect) => {
        setPosition(rect);
        const comboboxValue = {
          id: value.name,
          label: value.name,
        };

        select(comboboxValue);

        props?.onSelect?.(comboboxValue);
      },
      onOperatorClicked: (filter, rect) => {
        setPosition(rect);

        const _f = getFilter(filter.name);
        openOperatorOptions(_f.field);
      },
    };
  };
};
