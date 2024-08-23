'use server';

import {
  BaseViewConfigManager,
  DEFAULT_FETCH_LIMIT_QUERY,
  DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY,
  QueryDto,
  QueryReturnDto,
  waitFor,
} from '@apps-next/core';
import { PrismaClient, PrismaRecord } from './prisma.types';

import { MutationProps, MutationReturnDto } from '@apps-next/core';
import { relationalViewHelper } from 'libs/core/src/lib/relational-view.helper';
import { client } from './_internal/prisma-get-client';
import { mutationHandlers } from './_internal/prisma-mutations-handler';
import { queryHelper } from './_internal/prisma-query.helper';
import { relationalQueryHelper } from './_internal/prisma-relational-query.helper';

export const prismaViewLoader = async (
  prismaClient: unknown,
  args: QueryDto
): Promise<QueryReturnDto> => {
  console.debug('prismaViewLoader');

  if (args.viewConfig === undefined) {
    throw new Error('viewLoaderHandler: viewConfig is required');
  }

  const viewConfigManager = new BaseViewConfigManager(
    args.viewConfig,
    args.modelConfig
  );

  const displayField = viewConfigManager.getDisplayFieldLabel();

  const tableName = viewConfigManager.getTableName();

  const { registeredViews, relationQuery } = args;

  const dbQuery = client(prismaClient).dbQuery(tableName);

  let result: PrismaRecord[] | undefined;

  if (relationQuery) {
    const tableNameRelation = relationQuery.tableName;

    const dbQuery = client(prismaClient).dbQuery(tableNameRelation);

    const { displayField } = relationalViewHelper(
      relationQuery.tableName,
      registeredViews
    );

    const helper = queryHelper({ displayField, query: args.query });

    const result = await dbQuery.findMany({
      take: DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY,
      where: args.query ? helper.where : undefined,
      orderBy: helper.orderBy,
    });

    const relationQueryHelper = relationalQueryHelper({
      displayField,
      result,
    });

    return relationQueryHelper.relationQueryData;
  } else {
    const helper = queryHelper({ displayField, query: args.query });

    const include = helper.getInclude(viewConfigManager.getIncludeFields());

    if (args.query) {
      result = await dbQuery.findMany({
        take: DEFAULT_FETCH_LIMIT_QUERY,
        where: helper.where,
        include,
        orderBy: helper.orderBy,
      });
    } else {
      result = await dbQuery.findMany({
        take: DEFAULT_FETCH_LIMIT_QUERY,
        include,
        orderBy: helper.orderBy,
      });
    }

    await waitFor(300);

    return {
      data: result,
    };
  }
};

export const prismaViewMutation = async (
  prismaClient: unknown,
  args: MutationProps
): Promise<MutationReturnDto> => {
  console.debug('prismaViewMutation');

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

  await waitFor(1000);

  return {
    succes: true,
  };
};
