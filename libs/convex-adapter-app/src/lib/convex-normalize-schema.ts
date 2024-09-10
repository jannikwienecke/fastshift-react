import { ModelSchema, ModelField, EnumType } from '@apps-next/core';
import { ConvexSchema } from './_internal/convex-schema.types';

function parseConvexSchemaToModelSchema<T extends Record<string, any>>(
  schema: T
): ModelSchema {
  const convexSchema = schema as ConvexSchema;

  const models: ModelSchema['models'] = [];
  const enums: EnumType[] = [];

  for (const [tableName, tableSchema] of Object.entries(convexSchema)) {
    const fields: ModelField[] = [];

    for (const [fieldName, fieldSchema] of Object.entries(
      tableSchema.validator.fields
    )) {
      const field: ModelField = {
        name: fieldSchema.tableName ?? fieldName,
        relationFromFields: fieldSchema.tableName ? [fieldName] : [],
        relationName: fieldSchema.tableName,
        relationToFields: fieldSchema.tableName ? [fieldName] : [],
        kind: fieldSchema.kind,
        isList: fieldSchema.kind === 'array',
        isRequired: fieldSchema.isOptional === 'required',
        isUnique: false, // Convex doesn't have a direct 'unique' property
        isId: false,
        isReadOnly: false, // Convex doesn't have a direct 'readOnly' property
        hasDefaultValue: false, // Convex doesn't have a direct 'default' property
        type:
          fieldSchema.kind === 'id' && fieldSchema.tableName
            ? fieldSchema.tableName
            : fieldSchema.kind,
      };

      if (fieldSchema.kind === 'union' && fieldSchema.members) {
        field.type = 'enum';
        const enumName = `${tableName}_${fieldName}`;
        enums.push({
          name: enumName,
          values: fieldSchema.members.map((member) => ({
            name: member.value,
            dbName: member.value,
          })),
          dbName: null,
        });
        field.type = enumName;
      }

      fields.push(field);
    }

    models.push({
      name: tableName,
      fields,
    });
  }

  return {
    models,
    enums,
    types: {}, // Convex doesn't have a direct equivalent to Prisma's 'types'
  };
}

// Export the function
export { parseConvexSchemaToModelSchema };
