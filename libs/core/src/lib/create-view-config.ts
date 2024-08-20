import {
  GetTableName,
  GlobalConfig,
  SearchableField,
  ViewConfigType,
  ViewFieldConfig,
} from './types';

export function createViewConfig<T extends GetTableName>(
  tableName: T,
  config: Partial<Omit<ViewConfigType<T>, 'viewFields' | 'tableName'>>
) {
  // in "Client World" we get the viewFields and searchableFields from the globalConfig
  // in the ViewProvider -> we do not want the user to have to pass the viewFields and searchableFields
  const viewFields = {} as ViewFieldConfig;
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

export function createServerViewConfig<T extends GetTableName>(
  tableName: T,
  config: Partial<Omit<ViewConfigType<T>, 'viewFields' | 'tableName'>>,
  globalConfig: GlobalConfig['config']
) {
  // Clean Up -> Duplicate code in ViewProvider
  const searchableFields = globalConfig.searchableFields[tableName as string];
  const viewFields = globalConfig.viewFields[tableName as string];

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

  return viewConfig;
}
