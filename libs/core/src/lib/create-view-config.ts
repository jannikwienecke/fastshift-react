import {
  FieldConfig,
  GetTableName,
  SearchableField,
  ViewConfigType,
} from './types';

export function createViewConfig<T extends GetTableName>(
  tableName: T,
  config: Partial<Omit<ViewConfigType<T>, 'viewFields' | 'tableName'>>
) {
  const viewFields = {} as FieldConfig[];
  const searchableFields = {} as SearchableField;

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

  // const viewConfigManager = new BaseViewConfigManager(viewConfig);

  return viewConfig;
}
