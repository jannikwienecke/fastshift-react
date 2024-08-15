import {
  BaseViewConfigManager,
  ConvexViewConfig,
  QueryReturnOrUndefined,
  SearchableField,
  ViewFieldConfig,
} from '@apps-next/core';
import { Infer } from 'convex/values';
import { ConvexSchemaType } from './_internal/types.convex';
import { generateSearchableFieldsFromConvexSchema } from './convex-searchable-fields';
import { ConvexViewConfigManager } from './convex-view-config';
import { generateViewFieldsFromConvexSchema } from './convex-view-fields';

export class ConvexViewManager<TDataModel extends ConvexSchemaType> {
  viewFields: Record<string, ViewFieldConfig> | null;
  searchableFields: Record<string, SearchableField> | null;

  constructor(
    private convexSchema: TDataModel,
    private renderView: (props: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Component: (props: any) => React.ReactNode;
      viewConfigManager: BaseViewConfigManager;
    }) => React.ReactNode
  ) {
    this.searchableFields =
      generateSearchableFieldsFromConvexSchema(convexSchema);
    this.viewFields = generateViewFieldsFromConvexSchema(convexSchema);
  }

  createView<TableName extends keyof TDataModel['tables']>(
    tableName: TableName,
    config: Partial<
      Omit<ConvexViewConfig<TDataModel, TableName>, 'viewFields' | 'tableName'>
    >
  ): {
    createScreen: (
      Component: (
        props: QueryReturnOrUndefined<
          Infer<TDataModel['tables'][TableName]['validator']> & {
            id: string;
          }
        >
      ) => React.ReactNode
    ) => React.ReactNode;
  } {
    type DataType = Infer<TDataModel['tables'][TableName]['validator']>;
    type DataTypeWithId = DataType & { id: string };

    const createScreen = (
      Component: (
        props: QueryReturnOrUndefined<DataTypeWithId>
      ) => React.ReactNode
    ) => {
      const viewFields = this.viewFields?.[tableName as string];
      const searchableFields = this.searchableFields?.[tableName as string];
      if (!viewFields) throw new Error('viewFields is not defined');
      if (!searchableFields) throw new Error('searchableField is not defined');

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

      return this.renderView({
        Component: Component,
        viewConfigManager: viewConfigManager,
      });
    };

    return {
      createScreen,
    };
  }
}
