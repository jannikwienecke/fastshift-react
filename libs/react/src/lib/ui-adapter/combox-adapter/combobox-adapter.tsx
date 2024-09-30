import {
  ComboboxPopoverProps,
  FieldConfig,
  RecordType,
  Row,
} from '@apps-next/core';
import React from 'react';
import { comboboxStore$, store$ } from '../../legend-store';
import { ComboboxFieldValue } from '../../ui-components/render-combobox-field-value';

export type UseComboboxProps<T extends RecordType = RecordType> = {
  onClose?: () => void;
  onSelect?: (value: Row<T>) => void;
  renderValue?: (props: {
    value: Row<T>;
    field: FieldConfig<keyof T>;
  }) => React.ReactNode;
};

export const makeComboboxProps = <T extends RecordType = RecordType>(
  props?: UseComboboxProps<T>
): ComboboxPopoverProps<Row> => {
  const store = comboboxStore$.get();

  return {
    ...store,
    values: store.values ?? [],
    onOpenChange: (open) => {
      if (open) return;

      const fn = props?.onClose ? props.onClose : store$.comboboxClose;

      fn();
    },
    onChange: (value) =>
      props?.onSelect
        ? props.onSelect(value)
        : store$.comboboxSelectValue(value),

    render: (value) => {
      if (!store.field) return null;

      const renderComboboxFieldValue = (props: {
        value: Row;
        field: FieldConfig;
      }) => <ComboboxFieldValue {...props} />;

      const fn = props?.renderValue ?? renderComboboxFieldValue;

      return fn({
        field: store.field,
        value,
      });
    },

    input: {
      placeholder: '',
      query: store.query,
      onChange: store$.comboboxUpdateQuery,
    },
    multiple: store.multiple,
    name: comboboxStore$.field.get()?.name ?? '',
  } satisfies ComboboxPopoverProps<Row>;
};
