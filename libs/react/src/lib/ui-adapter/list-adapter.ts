import { ListItem, ListProps } from '@apps-next/ui';
import { useQuery } from '../use-query';
import { useView } from '../use-view';
import { useMutation } from '../use-mutation';
import { RecordType } from '@apps-next/core';

type ListGetProps<T> = {
  descriptionKey?: keyof T;
};

// export const _useListInternal = <T extends RecordType>() => {
export const useList = <T extends RecordType>() => {
  const { viewConfigManager } = useView();

  const { data } = useQuery<T[]>();
  const { mutate } = useMutation();

  const fieldLabel = viewConfigManager.getDisplayFieldLabel();

  return <Props extends ListGetProps<T>>(
    options?: Props
  ): ListProps<T & ListItem> => {
    const { descriptionKey } = options || {};
    return {
      onDelete: (item) => {
        mutate({
          mutation: {
            type: 'DELETE_RECORD',
            id: item.id,
          },
        });
      },
      items:
        data?.map((item) => ({
          ...item,
          id: item.id,
          name: item[fieldLabel],
          description:
            descriptionKey &&
            typeof item[descriptionKey as keyof T] === 'string'
              ? item[descriptionKey]
              : undefined,
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
