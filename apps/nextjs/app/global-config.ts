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

declare module '@apps-next/core' {
  interface Register {
    config: typeof globalConfig;
  }
}
