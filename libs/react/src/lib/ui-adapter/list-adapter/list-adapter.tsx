import {
  DataRow,
  getViewConfigAtom,
  RecordType,
  useStoreDispatch,
  useStoreValue,
} from '@apps-next/core';
import { ComboboxGetPropsOptions, ListItem, ListProps } from '@apps-next/ui';
import { useAtomValue } from 'jotai';
import { Icon } from '../../ui-components/render-icon';
import { ListFieldValue } from '../../ui-components/render-list-field-value';
import { useQueryData } from '../../use-query-data';
import {
  UseComboboAdaper,
  useCombobox as useComboboxAdapter,
} from '../combox-adapter';

type ListGetProps<T> = {
  fieldsLeft: (keyof T)[];
  fieldsRight: (keyof T)[];
};

export const useList = <T extends RecordType>(props?: {
  useCombobox?: UseComboboAdaper;
  comboboxOptions?: ComboboxGetPropsOptions;
}) => {
  const { useCombobox: useComboboxProps } = props ?? {};
  const useCombobox = useComboboxProps ?? useComboboxAdapter;

  const dispatch = useStoreDispatch();

  const { dataModel } = useQueryData<T[]>();
  const { selected } = useStoreValue();

  const viewConfig = useAtomValue(getViewConfigAtom);

  return <Props extends ListGetProps<T>>(
    options?: Props
  ): ListProps<T & ListItem> => {
    const { list } = viewConfig.viewConfig.ui || {};
    const fieldsLeft = options?.fieldsLeft ?? list?.fieldsLeft ?? [];
    const fieldsRight = options?.fieldsRight ?? list?.fieldsRight ?? [];
    const _renderLabel = fieldsLeft.length === 0 && list?.useLabel !== false;

    const renderFields = (
      row: DataRow<T>,
      fields: (keyof T)[]
    ): ListProps['items'][0]['valuesLeft'] => {
      return (
        fields?.map((fieldName) => {
          const { label, id, field } = row.getItem(fieldName);

          return {
            id,
            label,
            relation: field.relation && {
              ...field.relation,
              useCombobox,
            },
            render: () => <ListFieldValue field={field} row={row} />,
          };
        }) ?? []
      );
    };

    const renderLabel = (item: DataRow<T>) => {
      return [
        {
          id: item.id,
          label: item.label,
          render: () => <>{item.label}</>,
        },
      ];
    };

    return {
      onSelect: (item) => dispatch({ type: 'SELECT_RECORD', record: item }),
      selected,
      comboboxOptions: props?.comboboxOptions,
      items:
        dataModel.getRows()?.map((item) => ({
          ...item.getRawData(),
          id: item.id,
          icon: Icon,
          valuesLeft: _renderLabel
            ? renderLabel(item)
            : renderFields(item, fieldsLeft),
          valuesRight: renderFields(item, fieldsRight),
        })) ?? [],
    };
  };
};
