import { FieldType } from '@apps-next/core';
import { Prisma, PrismaField } from '../prisma.types';

type PrismaFieldTypeMapping = {
  [key in PrismaField['kind']]: FieldType;
};

const fieldTypeMapping: PrismaFieldTypeMapping = {
  String: 'String',
  Boolean: 'Boolean',
  Int: 'Number',
};

export const generateViewFieldsFromPrismaSchema = (
  Prisma: Prisma['dmmf']['datamodel']
) => {
  const viewFields = Object.fromEntries(
    Object.entries(Prisma.models).map(([index, tableData]) => {
      return [
        Prisma.models[+index].name.toLowerCase(),
        Object.fromEntries(
          Object.entries(tableData.fields).map(([index, fieldData]) => {
            const {
              relationName,
              relationFromFields,
              name: fieldName,
              type: fieldType,
            } = fieldData;

            const isRelationalIdField = tableData.fields.find(
              (f) => f.relationFromFields?.[0] === fieldName
            );

            const isIdField =
              fieldData.isId &&
              fieldData.default &&
              typeof fieldData.default === 'object' &&
              'name' in fieldData.default
                ? fieldData.default?.name === 'autoincrement'
                : false;

            const isRelationalField =
              relationName && relationFromFields ? true : false;

            let type = fieldTypeMapping[fieldType] ?? 'String';
            type = isRelationalField ? 'Reference' : type;

            return [
              fieldName,
              {
                isId: isIdField,
                isRelationalIdField: isRelationalIdField ? true : false,
                type,
                name: fieldData.name,
                isRequired: fieldData.isRequired,
                relation: isRelationalField
                  ? {
                      tableName: fieldData.name,
                      fieldName: relationFromFields?.[0] ?? '',
                    }
                  : undefined,
              },
            ];
          })
        ),
      ];
    })
  );

  return viewFields;
};
