import { ComboboxPopoverProps, FieldConfig, Row } from '@apps-next/core';
import { useDebounce } from '@uidotdev/usehooks';
import React from 'react';
import { comboboxStore$, store$ } from '../../legend-store';
import { ComboboxFieldValue } from '../../ui-components/render-combobox-field-value';
import { useQuery } from '../../use-query';

export type UseComboboAdaper = typeof useCombobox;

export type UseComboboxProps = {
  onClose: () => void;
  onSelect: (value: Row) => void;
  renderValue?: (props: { value: Row; field: FieldConfig }) => React.ReactNode;
};

// const state$ = observable(
//   syncedQuery({
//     queryClient,
//     query: {
//       queryKey: ['user'],
//       queryFn: async () => {
//         return fetch('https://reqres.in/api/users/1').then((v) => v.json());
//       },
//     },
//   })
// );

export const useCombobox = ({
  onClose,
  onSelect,
  ...props
}: UseComboboxProps) => {
  const store = comboboxStore$.get();
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
  }, [data, isFetched, isFetching, store.query]);

  const getComboboxProps = () => {
    return {
      ...store,
      values:
        store.values?.filter(
          (r) => !query || r.label.toLowerCase().includes(query.toLowerCase())
        ) || [],
      onOpenChange: (open) => {
        if (!open) {
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
      name: comboboxStore$.field.get()?.name ?? '',
    } satisfies ComboboxPopoverProps<Row>;
  };

  return getComboboxProps;
};
