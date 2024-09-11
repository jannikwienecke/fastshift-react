import { Prisma } from '@prisma/client';
import { PrismaClientType } from '../db';
import { createConfigFromPrismaSchema } from '@apps-next/prisma-adapter';

export const globalConfig = createConfigFromPrismaSchema<PrismaClientType>(
  Prisma.dmmf.datamodel,
  {
    // option to provide displayField for each table
    smart: {
      guessDisplayFieldIfNotProvided: true,
    },
  }
);

console.log('hier..');
console.log(
  Prisma.dmmf.datamodel.models.find((model) => model.name === 'task')
);

declare module '@apps-next/core' {
  interface Register {
    config: typeof globalConfig;
  }
}
