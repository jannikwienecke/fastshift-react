import { PrismaClient } from '../prisma.types';

export const client = (prisma: unknown) => {
  return {
    dbQuery: (tableName: string) => {
      return (prisma as PrismaClient)[tableName];
    },
  };
};
