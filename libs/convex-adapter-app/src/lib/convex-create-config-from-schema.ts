import { BaseConfigInterface, BaseConfig } from '@apps-next/core';
import { ConvexSchemaType } from './_internal/types.convex';
import { Infer } from 'convex/values';
import { generateSearchableFieldsFromConvexSchema } from './convex-searchable-fields';
import { generateViewFieldsFromConvexSchema } from './convex-view-fields';

export const createConfigFromConvexSchema = <T extends ConvexSchemaType>(
  schema: T
) => {
  type TableName = keyof T['tables'];

  const searchableFields = generateSearchableFieldsFromConvexSchema(schema);
  const viewFields = generateViewFieldsFromConvexSchema(schema);

  // TODO CONVEX: ADD INCLUDE FIELDS

  const config: BaseConfigInterface<
    T,
    keyof T['tables'],
    {
      [TKey in TableName]: Infer<T['tables'][TKey]['validator']>;
    }
  > = {
    _datamodel: {} as T,
    includeFields: {},
    searchableFields,
    viewFields,
    dataModel: schema,
    defaultViewConfigs: {},
    tableNames: Object.keys(schema.tables) as any as keyof T['tables'],
  };

  return new BaseConfig(config);
};
