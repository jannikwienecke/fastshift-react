import { FieldConfig } from '@apps-next/core';
import { Prisma } from '../prisma.types';
import { prismaViewFieldsHelper } from './prisma-view-fields-helper';

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
              type,
              isIdField,
              isRelationalIdField,
              enumValue,
              relation,
              fieldName,
              isList,
            } = prismaViewFieldsHelper(fieldData, tableData, Prisma);

            return [
              fieldName,
              {
                isId: isIdField,
                isRelationalIdField,
                type,
                name: fieldName,
                isRequired: fieldData.isRequired,
                enum: enumValue,
                relation,
                isList,
              } satisfies FieldConfig,
            ];
          })
        ),
      ];
    })
  );

  return viewFields;
};
