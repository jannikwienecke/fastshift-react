export type RemoveDollarSign<T> = T extends `$${infer _}` ? never : T;

export type PrismaTableName<T> = (keyof T)[];

export type GetPrismaTableName<TPrismaClient extends Record<string, any>> =
  RemoveDollarSign<PrismaTableName<TPrismaClient>[number]>;
