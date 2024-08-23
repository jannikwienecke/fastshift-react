import { IncludeConfig } from '@apps-next/core';
import { PrismaInclude, PrismaOrderBy, PrismaWhere } from '../prisma.types';

export const queryHelper = ({
  displayField,
  query,
}: {
  displayField: string;
  query?: string;
}) => {
  const getOrderBy = (direction?: 'asc' | 'desc'): PrismaOrderBy => {
    return {
      [displayField]: direction ?? 'asc',
    };
  };

  const getWhere = (): PrismaWhere => {
    return {
      OR: [
        {
          [displayField]: {
            contains: query,
            mode: 'insensitive' as const,
          },
        },
      ],
    };
  };

  const getInclude = (includeFields: IncludeConfig[string]): PrismaInclude => {
    return includeFields.reduce(
      (acc, f) => ({
        ...acc,
        [f]: true,
      }),
      {}
    );
  };

  return {
    getOrderBy,
    orderBy: getOrderBy(),
    where: getWhere(),
    getInclude,
  };
};
