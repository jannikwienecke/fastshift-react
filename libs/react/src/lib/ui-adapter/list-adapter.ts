import { ListProps } from '@apps-next/ui';
import { useQuery } from '../use-query';
import { useView } from '../use-view';

type ListGetProps<T> = {
  descriptionKey?: keyof T;
};

// export const _useListInternal = <T extends RecordType>() => {
export const useList = <T>() => {
  const { viewConfigManager } = useView();

  const { data } = useQuery();

  const fieldLabel = viewConfigManager.getDisplayFieldLabel();

  return <Props extends ListGetProps<T>>(options?: Props): ListProps<T> => {
    const { descriptionKey } = options || {};
    return {
      items:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data?.map((item: any) => ({
          ...item,
          name: item[fieldLabel] as string,
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
