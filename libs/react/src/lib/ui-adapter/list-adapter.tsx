import {
  clientConfigAtom,
  RecordType,
  useStoreDispatch,
} from '@apps-next/core';
import { ListItem, ListProps } from '@apps-next/ui';
import { useAtomValue } from 'jotai';
import { useMutation } from '../use-mutation';
import { useQueryData } from '../use-query-data';

type ListGetProps<T> = {
  fieldsLeft: (keyof T)[];
  fieldsRight: (keyof T)[];
};

export const useList = <T extends RecordType>() => {
  const dispatch = useStoreDispatch();

  const { dataModel } = useQueryData<T[]>();
  const { mutate } = useMutation();

  const config = useAtomValue(clientConfigAtom);

  return <Props extends ListGetProps<T>>(
    options?: Props
  ): ListProps<T & ListItem> => {
    return {
      onEdit: (item) => dispatch({ type: 'EDIT_RECORD', record: item }),

      // onDelete: (item) => {
      //   mutate({
      //     mutation: {
      //       type: 'DELETE_RECORD',
      //       payload: {
      //         id: item.id,
      //       },
      //       handler: (items) => items.filter((i) => i.id !== item.id),
      //     },
      //   });
      // },
      items:
        dataModel.getRows()?.map((item) => ({
          ...item.getRow(),
          id: item.id,
          valuesLeft: [
            ...(options?.fieldsLeft?.map((field) => ({
              id: item.getItemName(field),
              name: item.getItemLabel(field),
              render: () => {
                const fieldConfig = config.fields[field];
                if (!fieldConfig) return item.getItemLabel(field);
                return <fieldConfig.component data={item} />;
              },
            })) ?? []),
          ] satisfies ListProps['items'][0]['valuesLeft'],
          valuesRight: [
            ...(options?.fieldsRight?.map((field) => ({
              id: item.getItemName(field),
              name: item.getItemLabel(field),
              render: () => {
                const fieldConfig = config.fields[field];
                if (!fieldConfig) return item.getItemLabel(field);
                return <fieldConfig.component data={item} />;
              },
            })) ?? []),
          ] satisfies ListProps['items'][0]['valuesRight'],
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
