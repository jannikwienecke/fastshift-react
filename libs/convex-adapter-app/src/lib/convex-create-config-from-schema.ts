import {
  BaseConfig,
  BaseConfigInterface,
  generateIncludeFields,
  generateViewFields,
  getTableNamesFromSchema,
} from '@apps-next/core';
import { Infer } from 'convex/values';
import { ConvexSchemaType } from './_internal/types.convex';
import { parseConvexSchemaToModelSchema } from './convex-normalize-schema';
import { generateSearchableFieldsFromConvexSchema } from './convex-searchable-fields';
import { generateDefaultViewConfigs } from '@apps-next/react';

export const createConfigFromConvexSchema = <T extends ConvexSchemaType>(
  schema: T
) => {
  type TableName = keyof T['tables'];

  const normalizedSchema = parseConvexSchemaToModelSchema(schema.tables);

  const tableNames = getTableNamesFromSchema(normalizedSchema);
  const searchableFields = generateSearchableFieldsFromConvexSchema(
    schema.tables
  );
  const viewFields = generateViewFields(normalizedSchema);
  const includeFields = generateIncludeFields(normalizedSchema);

  type ConfigType = BaseConfigInterface<
    keyof T['tables'],
    {
      [TKey in TableName]: Infer<T['tables'][TKey]['validator']>;
    }
  >;

  const config: ConfigType = {
    _datamodel: {} as T,
    includeFields,
    searchableFields,
    viewFields,
    dataModel: normalizedSchema,
    defaultViewConfigs: {},
    tableNames: tableNames as unknown as keyof T['tables'],
  };

  // TODO: PRISAM and general -> need to be moved somethwre else. Cannot import from react in adapter
  const defaultViewConfigs = generateDefaultViewConfigs({
    tableNames,
    dataModel: normalizedSchema,
    config,
    guessDisplayFieldIfNotProvided: true,
  });

  const _config = {
    ...config,
    defaultViewConfigs,
  } as ConfigType;

  return new BaseConfig(_config);
};
