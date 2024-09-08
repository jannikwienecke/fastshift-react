'use client';

import {
  makeQueryKey,
  QueryDto,
  QueryProps,
  QueryReturnDto,
  QueryReturnOrUndefined,
  RecordType,
} from '@apps-next/core';
import { useQuery as useTanstackQuery } from '@tanstack/react-query';
import React from 'react';
import { useApi } from './use-api';
import { useAtomValue } from 'jotai';
import { debouncedQueryAtom } from './ui-components';
import { useView } from './use-view';

export const useStableQuery = (
  fn: () => Promise<QueryReturnDto>,
  args: QueryDto
) => {
  const result = useTanstackQuery({
    queryKey: makeQueryKey({
      viewName: args.viewConfig?.viewName,
      query: args.query,
      relation: args.relationQuery?.tableName,
    }),
    queryFn: fn,
    enabled: args.disabled === true ? false : true,
  });

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

  const queryReturn = useStableQuery(async () => {
    const res = await prisma.viewLoader(queryPropsMerged);

    return res;
  }, queryPropsMerged);

  return {
    ...queryReturn,
    data: queryReturn.data?.data,
    relationalData: queryReturn.data?.relationalData,
  };
};
