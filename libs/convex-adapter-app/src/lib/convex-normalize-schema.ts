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
      let isManyToManyField = false;
      let relationName = '';
      let manyToManyModelName: string | undefined = undefined;
      let isList = false;
      // hasManyTableName: Project has Many Tasks
      let hasManyTableName = '';

      if (fieldSchema.kind === 'array') {
        const optionNameManyToMany = tableName + fieldName;

        manyToManyModelName = Object.keys(convexSchema).find(
          (tableName) =>
            tableName.replace('_', '').toLowerCase() === optionNameManyToMany
        );

        const manyToManyModel = convexSchema[manyToManyModelName ?? ''];

        isManyToManyField = Object.values(
          //
          manyToManyModel?.validator?.fields ?? {}
        ).every((field) => {
          return field.tableName === tableName || field.tableName === fieldName;
        });

        if (isManyToManyField) {
          relationName = tableName + 'To' + manyToManyModelName;
        }
      }

      if (fieldSchema.element?.tableName) {
        isList = true;
        hasManyTableName = fieldSchema.element.tableName;
      }

      const field: ModelField = {
        name: isManyToManyField
          ? fieldName
          : fieldSchema.tableName ?? fieldName,
        relationFromFields: isManyToManyField
          ? []
          : fieldSchema.tableName
          ? [fieldName]
          : [],
        relationName: relationName || fieldSchema.tableName,
        relationToFields: isManyToManyField
          ? []
          : fieldSchema.tableName
          ? [fieldName]
          : [],
        // kind: isManyToManyField ? 'object' : fieldSchema.kind,
        kind: hasManyTableName ? hasManyTableName : fieldSchema.kind,
        isList: fieldSchema.kind === 'array',
        isRequired: fieldSchema.isOptional === 'required',
        isUnique: false, // Convex doesn't have a direct 'unique' property
        isId: false,
        isReadOnly: false, // Convex doesn't have a direct 'readOnly' property
        hasDefaultValue: false, // Convex doesn't have a direct 'default' property
        type: manyToManyModelName
          ? manyToManyModelName
          : fieldSchema.kind === 'id' && fieldSchema.tableName
          ? fieldSchema.tableName
          : isList && hasManyTableName
          ? hasManyTableName
          : fieldSchema.kind,
      };

      if (fieldSchema.kind === 'union' && fieldSchema.members) {
        field.type = 'enum';
        field.kind = 'enum';
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
