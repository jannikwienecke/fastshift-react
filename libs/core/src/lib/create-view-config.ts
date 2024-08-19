import { BaseViewConfigManager } from './base-view-config';
import { GetTableName, ViewConfigType, ViewFieldConfig } from './types';

export function createViewConfig<T extends GetTableName>(
  tableName: T,
  config: Partial<Omit<ViewConfigType<T>, 'viewFields' | 'tableName'>>
) {
  // TODO USE REAL IMPLEMENTATIONS FOR PRISMA AND CONVEX
  const viewFields = {} as ViewFieldConfig;
  const searchableFields = {} as any;

  // TODO RENAME testType
  const viewConfig: ViewConfigType<T> = {
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

  const viewConfigManager = new BaseViewConfigManager<any>(viewConfig);

  return viewConfigManager;
}
