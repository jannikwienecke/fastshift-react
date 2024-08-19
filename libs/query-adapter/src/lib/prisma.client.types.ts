// type PrismaFunctionType = {
//   findMany: <T extends Record<string, any>>(options?: any) => Promise<T[]>;
// };

import { MutationProps, QueryDto } from '@apps-next/core';

export type PrismaClientType = {
  //  FIXME should have all the same error and data structure (convex and prisma etc.)
  viewLoader: (props: QueryDto) => Promise<any>;
  viewMutation: (props: MutationProps) => Promise<any>;
};
