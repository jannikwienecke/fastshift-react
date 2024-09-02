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
  QueryRelationalData,
  QueryReturnDto,
  relationalViewHelper,
  waitFor,
} from '@apps-next/core';
import { PrismaClient, PrismaFindManyArgs, PrismaRecord } from './prisma.types';

import { MutationProps, MutationReturnDto } from '@apps-next/core';
import { client } from './_internal/prisma-get-client';
import { MUTATION_HANDLER_PRISMA } from './_internal/prisma-mutation.types';
import { mutationHandlers } from './_internal/prisma-mutations-helper';
import { parsePrismaResult } from './_internal/prisma-parse-result';
import { queryHelper } from './_internal/prisma-query.helper';

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

  const dbQuery = client(prismaClient).tableClient(tableName);

  let result: PrismaRecord[] | undefined;

  if (relationQuery?.tableName) {
    const tableNameRelation = relationQuery.tableName;

    let dbQuery = client(prismaClient).tableClient(tableNameRelation);
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

    const field = viewConfigManager.getFieldBy(relationQuery.tableName);
    if (field.relation?.manyToManyTable && relationQuery.recordId) {
      const firstLetterLowerCase = (str: string) =>
        str.charAt(0).toLowerCase() + str.slice(1);
      dbQuery = client(prismaClient).tableClient(
        firstLetterLowerCase(field.relation.manyToManyTable)
      );

      const fieldNameTable = field.relation?.manyToManyModelFields?.find(
        (f) =>
          f.name.toLowerCase() ===
          viewConfigManager.getTableName().toLowerCase()
      )?.relation?.fieldName;

      const result = await dbQuery.findMany({
        take: DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY,
        include: {
          [relationQuery.tableName]: true,
        },
        where: relationQuery.recordId
          ? {
              [fieldNameTable ?? '']: relationQuery.recordId,
            }
          : undefined,
      });

      const parsedResult = result.map((r) => r[relationQuery.tableName]);

      return {
        data: parsedResult,
      };
    } else if (relationQuery.recordId) {
      dbQuery = client(prismaClient).tableClient(
        viewConfigManager.getTableName()
      );

      // Implement the missing functionality
      const result = await dbQuery.findMany({
        take: DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY,
        where: {
          id: relationQuery.recordId,
        },
        include: {
          [relationQuery.tableName]: true,
        },
      });

      const parsedResult = result?.map((r) => r[relationQuery.tableName]);

      return {
        data: parsedResult,
      };
    } else {
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
    }
  } else {
    const _prismaLoaderExtension: PrismaFindManyArgs =
      args.viewConfig?.loader?._prismaLoaderExtension ?? {};

    const helper = queryHelper({
      displayField,
      query: args.query,
      override: _prismaLoaderExtension,
    });

    const include = helper.getInclude(viewConfigManager.getIncludeFields());

    const getManyToManyField = (key: string) => {
      return viewConfigManager
        .getViewFieldList()
        .find((f) => f.relation?.manyToManyRelation === key);
    };

    const relationalDataPromises = Object.keys(include).map((key) => {
      const field = getManyToManyField(key);

      let dbQuery = client(prismaClient).tableClient(key);

      if (field?.relation?.type === 'manyToMany') {
        dbQuery = client(prismaClient).tableClient(field.relation.tableName);
      }

      return dbQuery.findMany({
        take: DEFAULT_FETCH_LIMIT_RELATIONAL_QUERY,
      });
    });

    const resultList = await Promise.all(relationalDataPromises);

    const relationalData = Object.keys(include).reduce((acc, key, index) => {
      const field = getManyToManyField(key);
      const _key = field?.relation?.tableName ?? key;

      acc[_key] = resultList[index];
      return acc;
    }, {} as QueryRelationalData);

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
      relationalData,
    };
  }

  // Add a default return statement to satisfy the linter
  return {
    data: [],
  };
};

export const prismaViewMutation = async (
  prismaClient: unknown,
  args: MutationProps
): Promise<MutationReturnDto> => {
  lldebug('prismaViewMutation: ', args.mutation.type);

  const { mutation } = args;

  const viewConfigManager = new BaseViewConfigManager(args.viewConfig);

  const handler = mutationHandlers[mutation.type];

  return runMutation(handler, prismaClient as Record<string, PrismaClient>, {
    mutation,
    viewConfigManager,
  });
};

const runMutation = async (
  handler: MUTATION_HANDLER_PRISMA[MutationProps['mutation']['type']],
  prismaClient: Record<string, PrismaClient>,
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

    await waitFor(500);
    return await handler(prismaClient, mutation);
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

// for all include fields, (tag, project etc)
// some data will be loaded with the view
// when opening the combobo
// we show this loaded that with the data that is loaded with the record (due to the include)
