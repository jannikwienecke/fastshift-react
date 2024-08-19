import {
  BaseViewConfigManager,
  GetTableName,
  RegisteredRouter,
  ViewConfigType,
  ViewFieldConfig,
} from '@apps-next/core';

type RemoveNull<T> = T extends null ? never : T;

// type GetResultOfTable<
//   TDataModel extends Record<string, any>,
//   TableName extends keyof TDataModel
// > = RemoveNull<Awaited<ReturnType<TDataModel[TableName]['findFirst']>>>;

// export type PrismaViewConfig<
//   TDataModel extends Record<string, any> = any,
//   T extends GetTableName = never
// > = {
//   // data: TDataModel;
//   tableName: T;
//   dbProvider: 'prisma';
//   viewFields: ViewFieldConfig;
//   viewName: string;
//   displayField: {
//     field: keyof GetTableDataType<T>;
//     cell?: (value: GetResultOfTable<TDataModel, T>) => React.ReactNode;
//   };
//   query?: {
//     //
//   };
// } & ViewConfigType<TDataModel>;

export function creatatePrismaViewConfig<T extends GetTableName>(
  tableName: T,
  config: Partial<
    Omit<
      //   ViewConfigType<RegisteredRouter['config']['testType']['post']>,
      //   PrismaViewConfig<>,
      //   PrismaViewConfig<RegisteredPrisma['prisma'], T>,
      ViewConfigType<RegisteredRouter['config']['testType'], T>,
      'viewFields' | 'tableName'
    >
  >
) {
  // type SS = RegisteredPrisma['']
  const viewFields = {} as ViewFieldConfig;
  const searchableFields = {} as any;

  const viewConfig: ViewConfigType<RegisteredRouter['config']['testType'], T> =
    {
      ...config,
      displayField: {
        field: config.displayField?.field as any,
        cell: config.displayField?.cell,
      },
      viewFields: viewFields,
      tableName,
      viewName: config.viewName ?? (tableName as string),
      query: {
        searchableFields: searchableFields,
      },
    };

  const viewConfigManager = new BaseViewConfigManager(viewConfig);

  return viewConfigManager;
}
