import {
  GetTableName,
  ViewConfigType,
  ViewConfigBaseInfo,
  GlobalConfig,
} from '@apps-next/core';
import { registerView } from './stores';

export function createViewConfig<T extends GetTableName>(
  tableName: T,
  config: Partial<Omit<ViewConfigType<T>, 'viewFields' | 'tableName'>> &
    Pick<ViewConfigBaseInfo<T>, 'icon'>,
  globalConfig: GlobalConfig['config']
) {
  // Clean Up -> Duplicate code in ViewProvider
  const searchableFields = globalConfig.searchableFields[tableName as string];
  const indexFields = globalConfig.indexFields[tableName as string];
  const viewFields = globalConfig.viewFields[tableName as string];
  const includeFieldsDefault = globalConfig.includeFields[tableName as string];
  const viewName = config.viewName ?? (tableName as string);

  const includeFields = [
    ...includeFieldsDefault,
    ...(config.includeFields ?? []),
  ];

  // override fields based on config
  const viewFields_ = Object.entries(viewFields ?? {}).reduce(
    (acc, [field, fieldConfig]) => {
      const override = config.fields?.[field as keyof typeof config.fields];
      if (!override) {
        acc[field] = fieldConfig;
      } else {
        acc[field] = {
          ...fieldConfig,
          type: override.isDateField ? 'Date' : fieldConfig.type,
        };
      }

      return acc;
    },
    { ...viewFields }
  );

  const viewConfig: ViewConfigType<T> = {
    ...config,
    displayField: {
      field: config.displayField?.field as any,
      cell: config.displayField?.cell,
    },
    viewFields: viewFields_,
    includeFields,
    tableName,
    viewName,
    query: {
      searchableFields: searchableFields,
      indexFields: indexFields,
      ...config.query,
    },
  };

  registerView(viewName, viewConfig);

  return viewConfig;
}
