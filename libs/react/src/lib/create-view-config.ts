import {
  GetTableName,
  GlobalConfig,
  ViewConfigBaseInfo,
  ViewConfigType,
} from '@apps-next/core';

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
  const includeFieldsDefault =
    globalConfig.includeFields[tableName as string] ?? [];
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
        acc[field] = {
          ...fieldConfig,
        };
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

  if (config.mutation?.softDelete && !config.mutation?.softDeleteField) {
    console.error(
      "'softDelete' is set to true but 'softDeleteField' is not set. To enable soft delete, please set 'softDeleteField' to the field name that will be used for soft delete."
    );
  }

  const softDeleteEnabled =
    config.mutation?.softDelete && config.mutation?.softDeleteField;

  const indexFieldSoftDelete = indexFields?.find((f) =>
    f.fields.find((f) => f === config.mutation?.softDeleteField)
  );

  if (softDeleteEnabled && !indexFieldSoftDelete) {
    throw new Error(
      `Soft delete field ${config.mutation?.softDeleteField?.toString()} is not found in index fields. Please add the soft delete field to the index fields.`
    );
  }

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
    mutation: {
      ...config.mutation,
      softDelete: !!softDeleteEnabled,
    },
    query: {
      showDeleted: config.query?.showDeleted && !!config.mutation?.softDelete,
      searchableFields: searchableFields,
      indexFields: indexFields,
      ...config.query,
    },
  };

  return viewConfig;
}

export function _createViewConfig<T extends GetTableName>(
  tableName: T,
  config: Partial<
    Omit<ViewConfigType<T>, 'viewFields' | 'tableName' | 'viewName'>
  > &
    Pick<ViewConfigBaseInfo<T>, 'icon'>
) {
  return {
    tableName,
    configOptions: {
      viewName: tableName as string,
      ...config,
    },
  };
}
