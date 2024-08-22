import { FieldConfig, FieldType, TableRelationType } from '@apps-next/core';
import { Prisma, PrismaField } from '../prisma.types';

type PrismaFieldTypeMapping = {
  [key in PrismaField['kind']]: FieldType;
};

const fieldTypeMapping: PrismaFieldTypeMapping = {
  String: 'String',
  Boolean: 'Boolean',
  Int: 'Number',
  Enum: 'Enum',
};

export const generateViewFieldsFromPrismaSchema = (
  _prisma: Record<string, any>
) => {
  const Prisma = _prisma as any as Prisma['dmmf']['datamodel'];

  const viewFields = Object.fromEntries(
    Object.entries(Prisma.models).map(([index, tableData]) => {
      return [
        Prisma.models[+index].name.toLowerCase(),
        Object.fromEntries(
          Object.entries(tableData.fields).map(([index, fieldData]) => {
            const {
              relationName,
              relationFromFields,
              relationToFields,
              name: fieldName,
              type: fieldType,
            } = fieldData;

            const isRelationalIdField = tableData.fields.find(
              (f) => f.relationFromFields?.[0] === fieldName
            );

            const isIdField =
              fieldData.isId && fieldData.default ? true : false;

            const isRelationalField =
              relationName && relationFromFields ? true : false;

            let relationType: TableRelationType = 'oneToMany';

            const isManyToManyRelation =
              relationName &&
              relationFromFields?.length === 0 &&
              relationToFields?.length === 0;

            if (isManyToManyRelation) {
              relationType = 'manyToMany';
            }

            let type = fieldTypeMapping[fieldType] ?? 'String';
            type = isRelationalField ? 'Reference' : type;

            const enumType =
              fieldData.kind === 'enum' ? fieldData.type : undefined;
            const enumValues = enumType
              ? Prisma.enums.find((e) => e.name === enumType)?.values
              : undefined;

            type = enumType ? 'Enum' : type;

            return [
              fieldName,
              {
                isId: isIdField,
                isRelationalIdField: isRelationalIdField ? true : false,
                type,
                name: fieldData.name,
                isRequired: fieldData.isRequired,
                enum:
                  enumType && enumValues
                    ? {
                        name: enumType,
                        values: enumValues,
                      }
                    : undefined,
                relation: isRelationalField
                  ? {
                      tableName: fieldData.name,
                      fieldName: relationFromFields?.[0] ?? '',
                      type: relationType,
                    }
                  : undefined,
              } satisfies FieldConfig,
            ];
          })
        ),
      ];
    })
  );

  return viewFields;
};
