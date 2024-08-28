'use server';

import {
  BaseViewConfigManager,
  DEFAULT_FETCH_LIMIT_QUERY,
  DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY,
  ERROR_STATUS,
  lldebug,
  llerror,
  MutationContext,
  MutationPropsServer,
  QueryDto,
  QueryReturnDto,
  relationalViewHelper,
  waitFor,
} from '@apps-next/core';
import {
  DbMutation,
  PrismaClient,
  PrismaFindManyArgs,
  PrismaRecord,
} from './prisma.types';

import { MutationProps, MutationReturnDto } from '@apps-next/core';
import { client } from './_internal/prisma-get-client';
import { MUTATION_HANDLER_PRISMA } from './_internal/prisma-mutation.types';
import { mutationHandlers } from './_internal/prisma-mutations-helper';
import { parsePrismaResult } from './_internal/prisma-parse-result';
import { queryHelper } from './_internal/prisma-query.helper';
import { relationalQueryHelper } from './_internal/prisma-relational-query.helper';

export const prismaViewLoader = async (
  prismaClient: unknown,
  args: QueryDto
): Promise<QueryReturnDto> => {
  lldebug('prismaViewLoader: ', {
    table: args.viewConfig?.tableName,
    view: args.viewConfig?.viewName,
    query: args.query,
    relationQuery: args.relationQuery,
  });

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

    const include = helper.getInclude(
      viewConfigManager.getIncludeFieldsForRelation(
        tableNameRelation,
        registeredViews
      ) ?? []
    );

    console.log('include', include);

    const result = await dbQuery.findMany({
      take: DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY,
      where: args.query ? helper.where : undefined,
      include,
      orderBy: helper.orderBy,
    });

    const parsedResult = parsePrismaResult({
      include,
      viewConfigManager,
    }).parseResult(result);

    return {
      data: parsedResult,
    };
  } else {
    const _prismaLoaderExtension: PrismaFindManyArgs =
      args.viewConfig?.loader?._prismaLoaderExtension ?? {};

    const helper = queryHelper({
      displayField,
      query: args.query,
      override: _prismaLoaderExtension,
    });

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

    await waitFor(100);

    const parsedResult = parsePrismaResult({
      include,
      viewConfigManager,
    }).parseResult(result);

    return {
      data: parsedResult,
    };
  }
};

export const prismaViewMutation = async (
  prismaClient: unknown,
  args: MutationProps
): Promise<MutationReturnDto> => {
  lldebug('prismaViewMutation: ', args.mutation.type);

  const { mutation } = args;

  const viewConfigManager = new BaseViewConfigManager(args.viewConfig);

  const dbMutation = (prismaClient as PrismaClient)[args.viewConfig.tableName];

  const handler = mutationHandlers[mutation.type];

  return runMutation(handler, dbMutation, {
    mutation,
    viewConfigManager,
  });
};

const runMutation = async (
  handler: MUTATION_HANDLER_PRISMA[MutationProps['mutation']['type']],
  dbMutation: DbMutation,
  mutation: MutationPropsServer
): Promise<MutationReturnDto> => {
  const mutationContext: MutationContext = {
    table: mutation.viewConfigManager.getTableName(),
    view: mutation.viewConfigManager.getViewName(),
    displayField: mutation.viewConfigManager.getDisplayFieldLabel(),
    payload: mutation.mutation.payload,
    type: mutation.mutation.type,
  };

  try {
    lldebug('Run Mutation: ', mutationContext);

    await waitFor(150);
    return await handler(dbMutation, mutation);
  } catch (error) {
    llerror(`Error running mutation: ${mutation.mutation.type}. Check Context`);
    llerror(mutationContext);
    llerror(error);

    return {
      error: {
        message: `Error running mutation: ${mutation.mutation.type}`,
        error: String(error),
        status: ERROR_STATUS.INTERNAL_SERVER_ERROR,
        context: mutationContext,
      },
    };
  }
};
