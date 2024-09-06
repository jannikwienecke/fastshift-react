import type { Prisma } from '../prisma.types';

export const getTableNamesFromPrismaSchema = <
  TDataModel extends Record<string, any>
>(
  prisma: TDataModel
) => {
  const _prisma = prisma as any as Prisma['dmmf']['datamodel'];
  const { models } = _prisma;

  const tableNames = Object.values(models || {}).map((m) =>
    m.name.toLowerCase()
  );

  return tableNames;
};
