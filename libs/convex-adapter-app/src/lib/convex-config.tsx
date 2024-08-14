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

// export class Config<TDataModel extends ConvexSchemaType>
//   implements BaseConfigInterface<TDataModel, keyof TDataModel['tables']>
// {
//   dataModel: TDataModel;
//   tableNames: (keyof TDataModel['tables'])[];
//   viewFields: Record<string, ViewFieldConfig>;
//   searchableFields: Record<string, SearchableField>;

//   constructor(dataModel: TDataModel) {
//     this.tableNames = Object.keys(dataModel) as (keyof TDataModel['tables'])[];
//     this.dataModel = dataModel;

//     this.viewFields = generateViewFieldsFromConvexSchema(dataModel);
//     this.searchableFields = generateSearchableFieldsFromConvexSchema(dataModel);
//   }

//   createBaseView<TableName extends keyof TDataModel['tables']>(
//     tableName: TableName,
//     config: Partial<
//       Omit<ConvexViewConfig<TDataModel, TableName>, 'viewFields' | 'tableName'>
//     >
//   ) {
//     const viewFields = this.viewFields[tableName as string];
//     const searchableField = this.searchableFields[tableName as string];

//     type DataType = Infer<TDataModel['tables'][TableName]['validator']>;
//     type DataTypeWithId = DataType & { id: string };

//     const _useQuery = (props: QueryProps) => {
//       return useQuery<DataTypeWithId[]>(props);
//     };

//     const _useMutation = () => {
//       return useMutation();
//     };

//     // TODO CLEAN UP
//     function createScreen(
//       Component: (props: ReturnType<typeof _useQuery>) => React.ReactNode
//     ) {
//       const viewConfig: ConvexViewConfig<TDataModel, TableName> = {
//         ...config,
//         displayField: {
//           ...config.displayField,
//           field: config.displayField?.field as string,
//         },
//         viewFields: viewFields,
//         tableName,
//         viewName: config.viewName ?? (tableName as string),
//         query: {
//           searchableField,
//         },
//       };

//       const viewConfigManager = new ConvexViewConfigManager(viewConfig);

//       const Content = (props: {
//         Component: (props: ReturnType<typeof _useQuery>) => React.ReactNode;
//       }) => {
//         const query = useAtomValue(debouncedQueryAtom);
//         const data = _useQuery({ query, viewConfig: viewConfigManager });
//         return <props.Component {...data} />;
//       };

//       const Provider = (
//         <ViewProvider viewConfig={viewConfigManager}>
//           <Content Component={Component} />
//         </ViewProvider>
//       );

//       return Provider;
//     }

//     return {
//       useQuery: _useQuery,
//       useMutation: _useMutation,
//       createScreen,
//     };
//   }
// }

// export const generateConfigFromConvexSchema = (
//   convexSchema: ConvexSchemaType
// ) => {
//   const searchableFields =
//     generateSearchableFieldsFromConvexSchema(convexSchema);

//   const viewFields = generateViewFieldsFromConvexSchema(convexSchema);
// };

export class ConvexViewManager<TDataModel extends ConvexSchemaType> {
  constructor(
    private convexSchema: TDataModel,
    private viewFields: Record<string, ViewFieldConfig> | null,
    private searchableFields: Record<string, SearchableField> | null,
    private renderView: (props: {
      Component: (props: any) => React.ReactNode;
      viewConfig: BaseViewConfigManager;
    }) => React.ReactNode // private useQuery: <T>(props: QueryProps) => T, // private useMutation: () => MutationReturnType, // private ViewProvider: ( //   props: React.PropsWithChildren<{ //     viewConfig: BaseViewConfigManager; //   }> // ) => React.ReactNode
  ) {}

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

    // const _useQuery = (props: QueryProps) => {
    //   return this.useQuery<DataTypeWithId[]>(props);
    // };

    // const _useMutation = () => {
    //   return this.useMutation();
    // };

    const createScreen = (
      Component: (
        props: QueryReturnOrUndefined<DataTypeWithId>
      ) => React.ReactNode
    ) => {
      const viewFields = this.viewFields?.[tableName as string];
      const searchableFields = this.searchableFields?.[tableName as string];

      console.log({ viewFields, searchableFields });

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

      // return this.renderView(Component);

      return this.renderView({
        Component: Component,
        viewConfig: viewConfigManager,
      });

      // const Content = () => {
      //   const query = useAtomValue(debouncedQueryAtom);
      //   const data = _useQuery({ query, viewConfig: viewConfigManager });
      //   return <Component {...data} />;
      // };

      // const ViewProvider = this.ViewProvider;

      // const Provider = (
      //   <ViewProvider viewConfig={viewConfigManager}>
      //     <Content />
      //   </ViewProvider>
      // );

      // return Provider;
    };

    return {
      // useQuery: _useQuery,
      // useMutation: _useMutation,
      createScreen,
    };
  }
}
