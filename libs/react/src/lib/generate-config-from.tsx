// import { Prisma, PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();
// name: 'id',
// kind: 'scalar',
// isList: false,
// isRequired: true,
// isUnique: false,
// isId: true,
// isReadOnly: false,
// hasDefaultValue: true,
// type: 'Int',
// default: [Object],
// isGenerated: false,
// isUpdatedAt: false,

export type PrismaField = {
  name: string;
  kind: string;
  isList: boolean;
  isRequired: boolean;
  isUnique: boolean;
  isId: boolean;
  isReadOnly: boolean;
  hasDefaultValue: boolean;
  type: string;
  default?: unknown;
  isGenerated?: boolean | undefined;
  isUpdatedAt?: boolean;
};

export type Prisma = {
  dmmf: {
    datamodel: {
      // PrismaField
      models: Array<{
        fields: Array<PrismaField>;
      }>;
    };
  };
};

// export const generateConfigFrom = <TDataModel extends ConvexSchemaType>(
//   schema: TDataModel
// ) => {
//   const convex = new ConvexViewManager<TDataModel>(schema);
//   const createView = <TableName extends keyof TDataModel['tables']>(
//     tableName: TableName,
//     config: Partial<
//       Omit<ConvexViewConfig<TDataModel, TableName>, 'viewFields' | 'tableName'>
//     >
//   ) => {
//     type DataType = Infer<TDataModel['tables'][TableName]['validator']>;
//     type DataTypeWithId = DataType & { id: string };
//     let viewConfigManager: ConvexViewConfigManager | undefined;
//     const createScreen = (
//       Component: (
//         props: QueryReturnOrUndefined<DataTypeWithId>
//       ) => React.ReactNode
//     ) => {
//       const viewFields = convex.viewFields?.[tableName as string];
//       const searchableFields = convex.searchableFields?.[tableName as string];

//       if (!viewFields) throw new Error('viewFields is not defined');
//       if (!searchableFields) throw new Error('searchableField is not defined');

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
//           searchableFields: searchableFields,
//         },
//       };

//       viewConfigManager = new ConvexViewConfigManager(viewConfig);

//       return ViewDataProvider({
//         Component: Component,
//         viewConfigManager: viewConfigManager,
//       });
//     };

//     return {
//       getViewManager: () => {
//         return viewConfigManager;
//       },
//       createScreen,
//       useList: useList as typeof useList<
//         Infer<TDataModel['tables'][TableName]['validator']>
//       >,
//     };
//   };

//   return {
//     ...convex,
//     createView,
//   };
// };
