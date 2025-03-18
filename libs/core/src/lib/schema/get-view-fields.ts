import { FieldConfig, FieldRelationType, ModelSchema } from '../types';
import { schemaHelper } from './schema-helper';

export const generateViewFields = (_prisma: Record<string, any>) => {
  const Prisma = _prisma as any as ModelSchema;

  const viewFields = Object.fromEntries(
    Object.entries(Prisma.models).map(([index, tableData]) => {
      return [
        Prisma.models[+index]?.name?.toLowerCase(),
        Object.fromEntries(parseFields(tableData, Prisma)),
      ];
    })
  );

  return viewFields;
};

const parseFields = (
  tableData: ModelSchema['models'][0],
  Prisma: ModelSchema,
  prevTableName?: string
) => {
  return Object.entries(tableData.fields).map(([index, fieldData]) => {
    const {
      type,
      isIdField,
      isRelationalIdField,
      enumValue,
      relation,
      fieldName,
      isList,
    } = schemaHelper(fieldData, tableData, Prisma);

    let manyToManyModelFields: FieldRelationType['manyToManyModelFields'] = [];

    if (
      (relation?.type === 'manyToMany' || relation?.type === 'oneToMany') &&
      relation?.manyToManyTable &&
      prevTableName !== tableData.name
    ) {
      // if this is a many to many relation, we need to get the fields of the many to many table
      const model = Prisma.models.find(
        (m) => m.name === relation?.manyToManyTable
      );

      const parsed = model
        ? parseFields(model, Prisma, tableData.name)
        : undefined;

      const fields = parsed?.map((value) => value[1]) as FieldConfig[];

      manyToManyModelFields = fields;
    }

    return [
      fieldName,
      {
        isId: isIdField,
        isRelationalIdField,
        type,
        name: fieldName,
        isRequired: fieldData.isRequired,
        enum: enumValue,
        relation: relation
          ? {
              ...relation,
              manyToManyModelFields,
            }
          : undefined,
        isList,
        isRecursive: fieldData.isRecursive,
      } satisfies FieldConfig,
    ];
  });
};
