import {
  ComboboxPopoverProps,
  FieldConfig,
  NONE_OPTION,
  RecordType,
  Row,
} from '@apps-next/core';
import React from 'react';
import { comboboxStore$, getView, store$ } from '../../legend-store';
import { ComboboxFieldValue } from '../../ui-components/render-combobox-field-value';
import { ComboboxNoneValue } from '../../ui-components/render-combobox-none-value';
import { xSelect } from '../../legend-store/legend.select-state';
import {
  getViewConfigManager,
  isDetailOverview,
} from '../../legend-store/legend.utils';
import { comboboxClose } from '../../legend-store/legend.store.fn.combobox';

export type MakeComboboxPropsOptions<T extends RecordType = RecordType> = {
  onClose?: () => void;
  onSelect?: (value: Row<T>) => void;
  renderValue?: (props: {
    value: Row<T>;
    field?: FieldConfig<keyof T> | null;
  }) => React.ReactNode;
  renderNoneValue?: (props: {
    field?: FieldConfig<keyof T> | null;
  }) => React.ReactNode;
};

export const makeComboboxProps = <T extends RecordType = RecordType>(
  props?: MakeComboboxPropsOptions<T>
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
      const renderComboboxFieldValue = (props: {
        value: Row;
        field?: FieldConfig | null;
      }) => {
        return <ComboboxFieldValue {...props} row={store.row} />;
      };

      if (value.id === NONE_OPTION) {
        return props?.renderNoneValue ? (
          props.renderNoneValue({ field: store.field })
        ) : (
          <ComboboxNoneValue field={store.field} />
        );
      }

      const fn = props?.renderValue ?? renderComboboxFieldValue;

      return fn({
        field: store.field,
        value,
      });
    },

    input: {
      placeholder: store.placeholder ?? '',
      query: store.query,
      onChange: store$.comboboxUpdateQuery,
    },
    multiple: store.multiple,
    name: store.name ?? '',
    datePickerProps: {
      open: store.datePickerProps?.open ?? false,
      rect: store.rect,
      onOpenChange: () => {
        store$.comboboxClose();
      },
      onSelect: store$.comboboxSelectDate,
      selected: comboboxStore$.datePickerProps.selected.get(),
    },
    onClickCreateNew: (query) => {
      const field = store.field;
      const view = getView(store.field?.name ?? '');
      const displayField = view?.displayField ?? '';
      store$.comboboxUpdateQuery('');
      xSelect.close();
      store$.comboboxClose();

      const row = isDetailOverview()
        ? store$.detail.row.get()
        : store$.list.rowInFocus.row.get();
      const currentTableName = getViewConfigManager().getTableName();
      const relatedIsList = view?.viewFields?.[currentTableName].isList;

      store$.commandformOpen(
        field?.name ?? '',
        undefined,
        displayField
          ? {
              [displayField.field.toString()]: query,
              [getViewConfigManager().getTableName()]: relatedIsList
                ? [row]
                : row,
            }
          : undefined
      );
    },
  } satisfies ComboboxPopoverProps<Row>;
};
