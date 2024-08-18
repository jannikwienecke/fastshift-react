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
  if (process.env.NODE_ENV !== 'production') {
    return new PrismaClient();
  } else {
    // const turso = createClient({
    //   url: process.env.TURSO_DATABASE_URL ?? '',
    //   authToken: process.env.TURSO_AUTH_TOKEN,
    // });
    // const adapter = new PrismaLibSQL(turso);
    // return new PrismaClient({ adapter });
    throw new Error('Not implemented');
  }
});

prisma.$connect();

export { prisma };

export type PrismaClientType = typeof prisma;
