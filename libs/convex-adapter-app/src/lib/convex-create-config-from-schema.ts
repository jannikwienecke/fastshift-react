import {
  BaseConfig,
  BaseConfigInterface,
  generateIncludeFields,
  generateViewFields,
  getTableNamesFromSchema,
  ModelSchema,
} from '@apps-next/core';
import { Infer } from 'convex/values';
import { ConvexSchemaType } from './_internal/types.convex';
import { parseConvexSchemaToModelSchema } from './convex-normalize-schema';
import { generateSearchableFieldsFromConvexSchema } from './convex-searchable-fields';

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
    ModelSchema,
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

  return new BaseConfig(config);
};
