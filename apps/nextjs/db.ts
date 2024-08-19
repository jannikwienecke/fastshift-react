import { PrismaClient } from '@prisma/client';

export const singleton = <Value>(
  name: string,
  valueFactory: () => Value
): Value => {
  const g = global as any;
  g.__singletons ??= {};
  g.__singletons[name] ??= valueFactory();
  return g.__singletons[name];
};

const prisma = singleton('prisma', () => {
  return new PrismaClient();
});

prisma.$connect();

export { prisma };

export type PrismaClientType = typeof prisma;
