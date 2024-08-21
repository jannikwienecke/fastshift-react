'use server';

import {
  BaseViewConfigManager,
  QueryDto,
  QueryReturnDto,
} from '@apps-next/core';
import { PrismaClient, PrismaRecord } from './prisma.types';

import { MutationProps, MutationReturnDto } from '@apps-next/core';
import { mutationHandlers } from './_internal/prisma-mutations-handler';

export const prismaViewLoader = async (
  prismaClient: unknown,
  args: QueryDto
): Promise<QueryReturnDto> => {
  console.log('prismaViewLoader');

  if (args.viewConfig === undefined) {
    throw new Error('viewLoaderHandler: viewConfig is required');
  }

  const viewConfigManager = new BaseViewConfigManager(
    args.viewConfig,
    args.modelConfig
  );

  const displayField = viewConfigManager.getDisplayFieldLabel();

  const tableName = viewConfigManager.getTableName();

  const dbQuery = (prismaClient as PrismaClient)[tableName];

  let result: PrismaRecord[] | undefined;

  if (args.query) {
    result = await dbQuery.findMany({
      where: {
        OR: [
          {
            [displayField]: {
              contains: args.query,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: {
        id: 'asc',
      },
    });
  } else {
    result = await dbQuery.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  return {
    data: result,
  };
};

export const prismaViewMutation = async (
  prismaClient: unknown,
  args: MutationProps
): Promise<MutationReturnDto> => {
  console.log('prismaViewMutation');

  if (args.viewConfig === undefined) {
    throw new Error('viewLoaderHandler: viewConfig is required');
  }

  const { mutation } = args;

  const viewConfigManager = new BaseViewConfigManager(args.viewConfig);

  const dbMutation = (prismaClient as PrismaClient)[args.viewConfig.tableName];

  const handler = mutationHandlers[mutation.type];

  await handler(dbMutation, {
    mutation,
    viewConfigManager,
  });

  return {
    succes: true,
  };
};
