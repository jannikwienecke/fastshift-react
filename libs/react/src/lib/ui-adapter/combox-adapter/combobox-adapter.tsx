import { ComboboxPopoverProps, FieldConfig, Row } from '@apps-next/core';
import { useDebounce } from '@uidotdev/usehooks';
import React from 'react';
import { store$ } from '../../legend-store/legend.store';
import { ComboboxFieldValue } from '../../ui-components/render-combobox-field-value';
import { useQuery } from '../../use-query';
import { ComboboxInitPayload } from '../../legend-store/legend.store.types';

export type UseComboboAdaper = typeof useCombobox;

export type UseComboboxProps = {
  state: Omit<ComboboxInitPayload, 'defaultData' | 'registeredViews'> | null;
  onClose: () => void;
  onSelect: (value: Row) => void;
  renderValue?: (props: { value: Row; field: FieldConfig }) => React.ReactNode;
};

export const useCombobox = ({
  state: initialState,
  onClose,
  onSelect,
  ...props
}: UseComboboxProps) => {
  const store = store$.combobox.get();

  const renderValue = (props: { value: Row; field: FieldConfig }) => (
    <ComboboxFieldValue {...props} />
  );

  const query = useDebounce(store.query, 300);

  const { data, isFetching, isFetched } = useQuery({
    query,
    relationQuery: {
      tableName: store.tableName ?? '',
    },
    disabled: !store.field || !query || !!store.field.enum,
  });

  React.useEffect(() => {
    if (isFetched && !isFetching && data) {
      store$.comboboxHandleQueryData(data);
    }
  }, [data, isFetched, isFetching]);

  const getComboboxProps = () => {
    return {
      ...store,
      onOpenChange: (open) => {
        if (!open && initialState?.field) {
          onClose?.();
        }
      },
      onChange: (value) => {
        store$.comboboxSelectValue(value);
        onSelect?.(value);
      },

      render: (value) => {
        if (!store.field) return null;
        const fn = props.renderValue ?? renderValue;
        return fn({
          field: store.field,
          value,
        });
      },

      input: {
        placeholder: '',
        query: store.query,
        onChange(query) {
          store$.comboboxUpdateQuery(query);
        },
      },

      multiple: store.multiple,
      name: initialState?.field?.name ?? '',
    } satisfies ComboboxPopoverProps<Row>;
  };

  return getComboboxProps;
};
