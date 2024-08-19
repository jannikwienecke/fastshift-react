import type { Prisma } from '../prisma.types';

export const getTableNamesFromPrismaSchema = (
  prisma: Prisma['dmmf']['datamodel']
) => {
  const { models } = prisma;

  const tableNames = Object.values(models || {}).map((m) =>
    m.name.toLowerCase()
  );

  return tableNames;
};
