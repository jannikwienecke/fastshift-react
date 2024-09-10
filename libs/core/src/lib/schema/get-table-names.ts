import { ModelSchema } from '../types';

export const getTableNamesFromSchema = <TDataModel extends ModelSchema>(
  prisma: TDataModel
) => {
  const schema = prisma as any as ModelSchema;
  const { models } = schema;

  const tableNames = Object.values(models || {}).map((m) =>
    m.name.toLowerCase()
  );

  return tableNames;
};
