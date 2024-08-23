import { GetTableName, ViewConfigType } from '@apps-next/core';

export type GetFindManyWhere<
  TableName extends GetTableName,
  TPrismaClient extends {
    // eslint-disable-next-line
    // @ts-ignore
    [key in TableName]: {
      findFirstOrThrow: (args: unknown) => unknown;
    };
  }
> = Parameters<TPrismaClient[TableName]['findFirstOrThrow']>['0'];

export const configurePrismaLoader =
  <ViewConfig extends ViewConfigType>(viewConfig: ViewConfig) =>
  <T extends Record<string, any>>(
    props: GetFindManyWhere<ViewConfig['tableName'], T>
  ) => {
    return {
      ...viewConfig,
      loader: {
        _prismaLoaderExtension: props,
      },
    };
  };
