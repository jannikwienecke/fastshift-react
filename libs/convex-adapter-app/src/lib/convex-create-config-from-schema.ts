import {
  BaseConfig,
  BaseConfigInterface,
  FieldConfig,
  generateIncludeFields,
  generateViewFields,
  getTableNamesFromSchema,
  isSystemField,
  ModelSchema,
} from '@apps-next/core';
import { Infer } from 'convex/values';
import { ConvexSchemaType } from './_internal/types.convex';
import { parseConvexSchemaToModelSchema } from './convex-normalize-schema';
import {
  generateIndexFieldsFromConvexSchema,
  generateSearchableFieldsFromConvexSchema,
} from './convex-searchable-fields';

export const createConfigFromConvexSchema = <T extends ConvexSchemaType>(
  schema: T
) => {
  type TableName = keyof T['tables'];

  const normalizedSchema = parseConvexSchemaToModelSchema(schema.tables);

  const tableNames = getTableNamesFromSchema(normalizedSchema);
  const searchableFields = generateSearchableFieldsFromConvexSchema(
    schema.tables
  );

  let indexFields = generateIndexFieldsFromConvexSchema(schema.tables);

  indexFields = Object.keys(indexFields).reduce((acc, key) => {
    const fields = indexFields[key];
    if (!fields) return acc;
    return {
      ...acc,
      [key]: [
        ...fields,
        {
          fields: ['_creationTime'],
          name: 'by_creation_time',
        },
      ],
    };
  }, indexFields);

  let viewFields = generateViewFields(normalizedSchema);

  viewFields = Object.keys(viewFields).reduce((acc, key) => {
    let fields = viewFields[key] as unknown as {
      [key: string]: FieldConfig;
    };

    fields = Object.values(fields).reduce((acc, field: FieldConfig) => {
      return {
        ...acc,
        [field.name]: {
          ...field,
          isSystemField: isSystemField(field.name),
        } satisfies FieldConfig,
      };
    }, fields);

    return {
      ...acc,
      [key]: {
        ...fields,
        _creationTime: {
          isId: false,
          isRelationalIdField: false,
          isRequired: false,
          enum: undefined,
          relation: undefined,
          isList: false,
          name: '_creationTime',
          type: 'Date',
          isSystemField: true,
          editSearchString: '',
        } satisfies FieldConfig,
      },
    };
  }, viewFields);

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
    indexFields,
    viewFields,
    dataModel: normalizedSchema,
    defaultViewConfigs: {},
    tableNames: tableNames as unknown as keyof T['tables'],
  };

  return new BaseConfig(config);
};
