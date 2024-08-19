import { BaseViewConfigManager } from './base-view-config';
import {
  GetTableName,
  RegisteredRouter,
  ViewConfigType,
  ViewFieldConfig,
} from './types';

export function createViewConfig<T extends GetTableName>(
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
  const viewFields = {} as ViewFieldConfig;
  const searchableFields = {} as any;

  const viewConfig: ViewConfigType<RegisteredRouter['config']['testType'], T> =
    {
      ...config,
      displayField: {
        field: config.displayField?.field as any,
        // cell: config.displayField?.cell,
      },
      viewFields: viewFields,
      tableName,
      viewName: config.viewName ?? (tableName as string),
      query: {
        searchableFields: searchableFields,
      },
    };

  const viewConfigManager = new BaseViewConfigManager<any>(viewConfig);

  return viewConfigManager;
}
