import { BaseConfigInterface, ConfigWithouUi } from '@apps-next/core';
import { ConvexSchemaType } from './_internal/types.convex';
import { Infer } from 'convex/values';

export const createConfigFromConvexSchema = <T extends ConvexSchemaType>(
  schema: T
) => {
  type TableName = keyof T['tables'];

  const config: BaseConfigInterface<
    T,
    keyof T['tables'],
    {
      [TKey in TableName]: Infer<T['tables'][TKey]['validator']>;
    }
  > = {
    testType: {} as T,
    searchableFields: {},
    viewFields: {},
    dataModel: schema,
    tableNames: Object.keys(schema.tables) as any as keyof T['tables'],
  };

  return new ConfigWithouUi(config);
};
