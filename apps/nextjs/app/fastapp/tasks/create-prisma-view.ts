import {
  QueryReturnOrUndefined,
  RegisteredPrisma,
  RegisteredRouter,
} from '@apps-next/core';
import { useList } from '@apps-next/react';

export type GetTableName = RegisteredRouter['config']['tableNames'][number];

export type GetTableDataType<T extends GetTableName> = Awaited<
  // @ts-expect-error -> We know that the type is correct
  ReturnType<RegisteredPrisma['prisma'][T]['findFirstOrThrow']>
>;

type PrismaUseListType<T extends GetTableName> = typeof useList<
  GetTableDataType<T>
>;

// type TransformToRecord<
//   T extends RegisteredRouter['config']['dataModel']['models']
// > = {
//   [K in T[number]['name']]: {
//     Type: string;
//   };
// };

export function _createView<
  T extends GetTableName,
  TOptions extends {
    Component?: (props: {
      useList: PrismaUseListType<T>;
      data: QueryReturnOrUndefined<GetTableDataType<T>>;
    }) => React.ReactNode;
  } | null
>(tableName: T, config: TOptions) {
  type Data = GetTableDataType<T>;
  return {
    data: {} as GetTableDataType<T>,
    useList: (() => {
      return () => {
        return {
          items: [{ name: '' }],
        };
      };
    }) as typeof useList<Data>,
  };
}
