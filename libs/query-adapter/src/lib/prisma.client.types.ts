import {
  MutationProps,
  MutationReturnDto,
  QueryDto,
  QueryReturnDto,
} from '@apps-next/core';

export type PrismaClientType = {
  viewLoader: (dto: QueryDto) => Promise<QueryReturnDto>;
  viewMutation: (props: MutationProps) => Promise<MutationReturnDto>;
};
