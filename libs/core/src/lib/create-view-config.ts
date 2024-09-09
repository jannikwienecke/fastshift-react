import { registerView } from './config.store';
import {
  GetTableName,
  GlobalConfig,
  ViewConfigBaseInfo,
  ViewConfigType,
} from './types';

export function createViewConfig<T extends GetTableName>(
  tableName: T,
  config: Partial<Omit<ViewConfigType<T>, 'viewFields' | 'tableName'>> &
    Pick<ViewConfigBaseInfo<T>, 'icon'>,
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

  registerView(viewName, viewConfig);

  return viewConfig;
}
