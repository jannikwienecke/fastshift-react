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
            } = fieldData;

            const isRelationalField = relationName && relationFromFields;

            let type = fieldTypeMapping[fieldData.kind] ?? 'String';
            type = isRelationalField ? 'Reference' : 'String';
            return [
              fieldName,
              {
                type,
                name: fieldData.name,
                isRequired: fieldData.isRequired,
                relation: isRelationalField
                  ? {
                      tableName: fieldData.name,
                      fieldName: relationFromFields[0],
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
