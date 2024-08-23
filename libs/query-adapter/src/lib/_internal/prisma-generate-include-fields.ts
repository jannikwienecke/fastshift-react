import { Prisma } from '../prisma.types';
import { prismaViewFieldsHelper } from './prisma-view-fields-helper';

export const generateIncludeFields = (_prisma: Record<string, any>) => {
  const Prisma = _prisma as any as Prisma['dmmf']['datamodel'];

  const includeDict = Prisma.models.reduce((acc, model) => {
    const includeFieldsModel = model?.fields
      .map((fieldData) => {
        const { isIdField, relation, fieldName, isManyToManyRelation } =
          prismaViewFieldsHelper(fieldData, model, Prisma);

        if (isIdField || !relation || isManyToManyRelation) return null;

        return fieldName;
      })
      .filter((f) => f !== null);

    return {
      ...acc,
      [model.name.toLowerCase()]: includeFieldsModel,
    };
  }, {} as Record<string, string[]>);

  return includeDict;
};
