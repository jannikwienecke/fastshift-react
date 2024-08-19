// import { createView, ConfigWithouUi, _createView } from './config-model';
import { createConfigFromPrismaSchema, PrismaConfig } from '@apps-next/core';
import { Prisma } from '@prisma/client';
import { prisma, PrismaClientType } from '../db';

const config = createConfigFromPrismaSchema<
  Prisma.DMMF.Datamodel,
  PrismaClientType
>(Prisma.dmmf.datamodel);

const co = config['config']['testType']['post'];

const prismaConfig = new PrismaConfig(prisma);
declare module '@apps-next/core' {
  interface Register {
    config: typeof config;
    // CLEAN UP - Remove from Register
    // infer it based on the config
    prisma: typeof prismaConfig;
  }
}
