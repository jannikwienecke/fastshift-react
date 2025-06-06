import { IncludeConfig } from '@apps-next/core';
import { ConvexInclude } from './types.convex';

export const queryHelper = ({
  displayField,
  query,
}: //   override,
{
  displayField: string;
  query?: string;
  //   override?: PrismaFindManyArgs;
}) => {
  //   const getOrderBy = (direction?: 'asc' | 'desc'): PrismaOrderBy => {
  //     return {
  //       [displayField]: direction ?? 'asc',
  //       ...(override?.orderBy ?? {}),
  //     };
  //   };

  //   const getWhere = (): PrismaWhere => {
  //     return {
  //       OR: [
  //         {
  //           [displayField]: {
  //             contains: query,
  //             mode: 'insensitive' as const,
  //           },
  //         },
  //       ],
  //       ...(override?.where ?? {}),
  //     };
  //   };

  const getInclude = (includeFields: IncludeConfig[string]): ConvexInclude => {
    return {
      ...includeFields.reduce(
        (acc, f) => ({
          ...acc,
          [f]: true,
        }),
        {}
      ),
      //   ...(override?.include ?? {}),
    };
  };

  return {
    // getOrderBy,
    // orderBy: getOrderBy(),
    // where: getWhere(),
    getInclude,
  };
};
