import {
  ComboboxPopoverProps,
  ComboxboxItem,
  FieldConfig,
  Row,
} from '@apps-next/core';
import { FilterValue } from '../../ui-components/render-filter-value.js';
import {
  useCombobox,
  UseComboboxProps,
} from '../combox-adapter/combobox-adapter.js';
import { useFiltering } from './filter.store.js';

export function useFilter({
  onSelect,
}: {
  onSelect: (props: { field: FieldConfig; value: Row }) => void;
}) {
  const { filterState, select, close } = useFiltering();

  const props = {
    state: {
      field: filterState.selectedField,
      // row: filterState.selectedField ? ('test' as Row) : null,
      rect: {} as DOMRect,
      selected: [],
      multiple: filterState.selectedField?.relation ? true : false,
    },
    onClose: close,
    onSelect: (value) => {
      if (!filterState.selectedField) return;
      onSelect({
        field: filterState.selectedField,
        value: value as Row,
      });
    },
  } satisfies UseComboboxProps;

  const getComboboxProps = useCombobox(props);

  const getFilterComboboxProps = (): ComboboxPopoverProps<ComboxboxItem> => {
    const comboboxProps = getComboboxProps();
    if (comboboxProps.open && filterState.selectedField) {
      return {
        ...comboboxProps,
        onChange: (v) => comboboxProps.onChange(v as Row),
        render: (v) => {
          return comboboxProps.render(v as Row);
        },
      };
    }

    return {
      ...filterState,
      name: 'filter',
      multiple: false,
      searchable: true,
      rect: null,
      input: {
        onChange: (query) => {
          console.log('onChange', query);
        },
        query: filterState.query,
        placeholder: 'Filter...',
      },
      selected: null,
      onChange: (value) => {
        select(value);
      },

      onOpenChange: (open) => {
        console.log('onOpenChange', open);
        if (!open) {
          close();
        }
      },
      render: (value) => <FilterValue value={value} />,
    };
  };

  return {
    getFilterComboboxProps,
  };
}
