'use client';

import {
  makeQueryKey,
  QueryDto,
  QueryProps,
  QueryReturnOrUndefined,
  RecordType,
} from '@apps-next/core';
import { useQuery as useTanstackQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import React from 'react';
import { PrismaContextType } from './query-context';
import { debouncedQueryAtom } from './ui-components';
import { useApi } from './use-api';
import { useView } from './use-view';

export const useStableQuery = (api: PrismaContextType, args: QueryDto) => {
  const queryOptions = api.makeQueryOptions
    ? api.makeQueryOptions({
        ...args,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        registeredViews: undefined as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        modelConfig: undefined as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        disabled: undefined as any,
        viewConfigManager: undefined,
        viewName: args.viewConfig?.viewName ?? '',
        relationQuery: args.relationQuery,
      })
    : {
        queryKey: makeQueryKey({
          viewName: args.viewConfig?.viewName,
          query: args.query,
          relation: args.relationQuery?.tableName,
        }),
        queryFn: () => {
          return api.prisma?.viewLoader(args);
        },
      };

  const result = useTanstackQuery({
    ...queryOptions,
    enabled: args.disabled === true ? false : true,
  } as any);

  if (result.error) {
    console.error('ERROR', result.error);
    console.error('USE QUERY', args);
  }

  const stored = React.useRef(result as any);

  if (result.data !== undefined) {
    stored.current = result;
  } else {
    stored.current = {
      ...result,
      data: stored.current?.data,
    };
  }

  return stored.current;
};

export const useQuery = <QueryReturnType extends RecordType[]>(
  queryProps?: Partial<QueryProps>
): QueryReturnOrUndefined<QueryReturnType[0]> => {
  const prisma = useApi();
  const { viewConfigManager, registeredViews } = useView();
  const query = useAtomValue(debouncedQueryAtom);

  const queryPropsMerged = React.useMemo(() => {
    return {
      ...queryProps,
      query: queryProps?.query || query,
      registeredViews: queryProps?.registeredViews ?? registeredViews,
      modelConfig:
        queryProps?.viewConfigManager?.modelConfig ||
        viewConfigManager.modelConfig,
      viewConfig:
        queryProps?.viewConfigManager?.viewConfig ||
        viewConfigManager.viewConfig,

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      viewConfigManager: undefined,
    };
  }, [
    query,
    queryProps,
    registeredViews,
    viewConfigManager.modelConfig,
    viewConfigManager.viewConfig,
  ]);

  const queryReturn = useStableQuery(prisma, queryPropsMerged);

  return {
    ...queryReturn,
    data: queryReturn.data?.data,
    relationalData: queryReturn.data?.relationalData,
  };
};
