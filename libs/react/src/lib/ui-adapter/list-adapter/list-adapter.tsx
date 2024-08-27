import {
  clientConfigAtom,
  DataRow,
  getViewConfigAtom,
  RecordType,
  useStore,
  useStoreDispatch,
  useStoreValue,
} from '@apps-next/core';
import { ListItem, ListProps } from '@apps-next/ui';
import { useAtomValue } from 'jotai';
import { useMutation } from '../../use-mutation';
import { useQueryData } from '../../use-query-data';
import { Icon } from '../../ui-components/render-icon';

type ListGetProps<T> = {
  fieldsLeft: (keyof T)[];
  fieldsRight: (keyof T)[];
};

export const useList = <T extends RecordType>() => {
  const dispatch = useStoreDispatch();

  const { dataModel } = useQueryData<T[]>();
  const { mutate } = useMutation();
  const { selected } = useStoreValue();

  // TODO: FIX NAMING -> OR MERGE THEM clientConfigAtom and getViewConfigAtom
  const config = useAtomValue(clientConfigAtom);
  const viewConfig = useAtomValue(getViewConfigAtom);

  return <Props extends ListGetProps<T>>(
    options?: Props
  ): ListProps<T & ListItem> => {
    const { list } = viewConfig.viewConfig.ui || {};
    const fieldsLeft = options?.fieldsLeft ?? list?.fieldsLeft ?? [];
    const fieldsRight = options?.fieldsRight ?? list?.fieldsRight ?? [];
    const _renderLabel = fieldsLeft.length === 0 && list?.useLabel !== false;

    const renderFields = (
      item: DataRow<T>,
      fields: (keyof T)[]
    ): ListProps['items'][0]['valuesLeft'] => {
      return (
        fields?.map((field) => ({
          id: item.getItemName(field),
          name: item.getItemLabel(field),
          render: () => {
            const fieldConfig = config?.fields[field];
            if (!fieldConfig) return item.getItemLabel(field);
            return <fieldConfig.component data={item} />;
          },
        })) ?? []
      );
    };

    const renderLabel = (item: DataRow<T>) => {
      return [
        {
          id: item.id,
          name: item.label,
          render: () => <span>{item.label}</span>,
        },
      ];
    };

    return {
      onSelect: (item) => dispatch({ type: 'SELECT_RECORD', record: item }),
      selected,
      items:
        dataModel.getRows()?.map((item) => ({
          ...item.getRow(),
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

// TODO Add internal and extenral useList implementations
// const _useList = <T extends GetTableName, TData extends GetTableDataType<T>>(
//   tableName: T,
//   { data, fieldLabel }: { data: TData[]; fieldLabel: keyof TData }
// ) => {
//   return <Props extends ListGetProps<TData>>(
//     options?: Props
//   ): ListProps<TData> => {
//     const { descriptionKey } = options || {};
//     return {
//       items:
//         data?.map((item) => ({
//           ...item,
//           name: item[fieldLabel] as string,
//           description:
//             descriptionKey && typeof item[descriptionKey] === 'string'
//               ? item[descriptionKey]
//               : undefined,
//         })) ?? [],
//     };
//   };
// };

// _useList('tasks', { data: [{ id: '1' }], fieldLabel: 'name' });
