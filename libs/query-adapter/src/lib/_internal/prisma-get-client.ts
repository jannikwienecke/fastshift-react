import { PrismaClient } from '../prisma.types';

export const client = (prisma: unknown) => {
  return {
    tableClient: (tableName: string) => {
      return (prisma as PrismaClient)[tableName];
    },
  };
};
