import {
  ComboboxPopoverProps,
  ComboxboxItem,
  FieldConfig,
  Row,
} from '@apps-next/core';
import { useFilterStore } from './filter.store.js';
import { FilterValue } from '../../ui-components/render-filter-value.js';
import {
  useCombobox,
  UseComboboxProps,
} from '../combox-adapter/combobox-adapter.js';
import { useFiltering } from './filter.state.js';

export function useFilter({
  onSelect,
}: {
  onSelect: (props: { field: FieldConfig; value: Row }) => void;
}) {
  const { filter } = useFilterStore();
  const { filterState, select, close, open } = useFiltering();

  const getSelected = () => {
    const activeFilter = filter.fitlers.find(
      (f) => f.field.name === filterState.selectedField?.name
    );

    if (!activeFilter) return [];

    const values =
      activeFilter?.type === 'relation'
        ? activeFilter.values
        : [activeFilter?.value];

    return values;
  };

  const props = {
    state: {
      field: filterState.selectedField,
      // row: filterState.selectedField ? ('test' as Row) : null,
      rect: filterState.rect ?? ({} as DOMRect),
      selected: getSelected(),
      multiple: true,
      // filterState.selectedField?.relation || filterState.selectedField?.enum
      //   ? true
      //   : false,
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
        console.log('onChange', value);

        select(value);
      },

      onOpenChange: (isOpen) => {
        if (!isOpen) {
          close();
        } else {
          open(true);
        }
      },
      render: (value) => <FilterValue value={value} />,
    };
  };

  return {
    getFilterComboboxProps,
  };
}
