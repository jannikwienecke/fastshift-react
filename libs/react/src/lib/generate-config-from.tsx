import {
  ConvexSchemaType,
  ConvexViewConfigManager,
  ConvexViewManager,
} from '@apps-next/convex-adapter-app';
import {
  ConvexViewConfig,
  DataProvider,
  QueryReturnOrUndefined,
} from '@apps-next/core';
import { ViewDataProvider } from './view-provider';
import { useList } from './ui-adapter.ts';
import { Infer } from 'convex/values';

export const generateConfigFrom = <
  TDataProvider extends DataProvider,
  TDataModel extends ConvexSchemaType
>(
  provider: TDataProvider,
  schema: TDataProvider extends 'convex' ? TDataModel : never
) => {
  if (provider === 'convex') {
    const convex = new ConvexViewManager<TDataModel>(schema);

    const createView = <TableName extends keyof TDataModel['tables']>(
      tableName: TableName,
      config: Partial<
        Omit<
          ConvexViewConfig<TDataModel, TableName>,
          'viewFields' | 'tableName'
        >
      >
    ) => {
      type DataType = Infer<TDataModel['tables'][TableName]['validator']>;
      type DataTypeWithId = DataType & { id: string };

      const createScreen = (
        Component: (
          props: QueryReturnOrUndefined<DataTypeWithId>
        ) => React.ReactNode
      ) => {
        const viewFields = convex.viewFields?.[tableName as string];
        const searchableFields = convex.searchableFields?.[tableName as string];

        if (!viewFields) throw new Error('viewFields is not defined');
        if (!searchableFields)
          throw new Error('searchableField is not defined');

        const viewConfig: ConvexViewConfig<TDataModel, TableName> = {
          ...config,
          displayField: {
            ...config.displayField,
            field: config.displayField?.field as string,
          },
          viewFields: viewFields,
          tableName,
          viewName: config.viewName ?? (tableName as string),
          query: {
            searchableFields: searchableFields,
          },
        };

        const viewConfigManager = new ConvexViewConfigManager(viewConfig);

        return ViewDataProvider({
          Component: Component,
          viewConfigManager: viewConfigManager,
        });
      };

      return {
        getViewManager: () => {
          if (!convex.viewManager)
            throw new Error('viewManager is not defined');
          return convex.viewManager;
        },
        createScreen,
        useList: useList as typeof useList<
          Infer<TDataModel['tables'][TableName]['validator']>
        >,
      };
    };

    return {
      ...convex,
      createView,
    };
  } else {
    throw new Error('Provider not supported yet');
  }
};
