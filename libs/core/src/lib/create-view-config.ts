import {
  GetTableName,
  GlobalConfig,
  RegisteredViews,
  SearchableField,
  ViewConfigType,
  ViewFieldConfig,
} from './types';
import { registerViewHandler } from './register-view-handler';

// TODO WRITE CLASS THAT MANAGES THIS DATA STRUCTURE
export const REGISTRED_VIEWS: RegisteredViews = {};

export function createViewConfig<T extends GetTableName>(
  tableName: T,
  config: Partial<Omit<ViewConfigType<T>, 'viewFields' | 'tableName'>>
) {
  // in "Client World" we get the viewFields and searchableFields from the globalConfig
  // in the ViewProvider -> we do not want the user to have to pass the viewFields and searchableFields
  const viewFields = {} as ViewFieldConfig;
  const searchableFields = {} as SearchableField;
  const viewName = config.viewName ?? (tableName as string);

  const viewConfig: ViewConfigType<T> = {
    ...config,
    displayField: {
      field: config.displayField?.field as any,
      cell: config.displayField?.cell,
    },
    viewFields: viewFields,
    includeFields: [],
    tableName,
    viewName,
    query: {
      searchableFields: searchableFields,
    },
  };

  registerViewHandler.register(viewName, viewConfig);

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
  const includeFields = globalConfig.includeFields[tableName as string];

  const viewName = config.viewName ?? (tableName as string);

  const viewConfig: ViewConfigType<T> = {
    ...config,
    displayField: {
      field: config.displayField?.field as any,
      cell: config.displayField?.cell,
    },
    viewFields: viewFields,
    includeFields,
    tableName,
    viewName,
    query: {
      searchableFields: searchableFields,
    },
  };

  registerViewHandler.register(viewName, viewConfig);

  return viewConfig;
}
