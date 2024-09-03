import { PrismaClient } from '../prisma.types';

export const client = (prisma: unknown) => {
  return {
    tableClient: (fieldName: string) => {
      return (prisma as PrismaClient)[fieldName];
    },
  };
};
