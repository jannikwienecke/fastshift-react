import {
  Mutation,
  MutationPropsServer,
  MutationReturnDtoSuccess,
} from '@apps-next/core';
import { PrismaClient } from '../prisma.types';

export type MUTATION_HANDLER_PRISMA = {
  [key in Mutation['type']]: (
    dbMutation: PrismaClient[string],
    args: MutationPropsServer
  ) => Promise<MutationReturnDtoSuccess>;
};
