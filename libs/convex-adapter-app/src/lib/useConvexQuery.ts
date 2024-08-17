'use client';
import {
  GlobalConfig,
  invarant,
  QueryDto,
  QueryProps,
  QueryReturnOrUndefined,
  RecordType,
} from '@apps-next/core';
import { convexQuery } from '@convex-dev/react-query';
import { useQuery as useQueryTanstack } from '@tanstack/react-query';

import { useRef } from 'react';
import { parseConvexData } from './_internal/convex-utils';
import { useConvexApi } from './_internal/useConvexApi';

export const useStableQuery = (fn: any, args: QueryDto) => {
  const result = useQueryTanstack(convexQuery(fn, args));
  const stored = useRef(result);

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

export const useConvexQuery = <QueryReturnType extends RecordType[]>({
  queryProps,
  globalConfig,
}: {
  queryProps: QueryProps;
  globalConfig: GlobalConfig;
}): QueryReturnOrUndefined<QueryReturnType[0]> => {
  const api = useConvexApi();

  invarant(Boolean(api), 'convex api is not defined');

  const data = useStableQuery(api.viewLoader, {
    ...queryProps,
    viewConfig: queryProps.viewConfigManager?.viewConfig,

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    viewConfigManager: undefined,
  });

  const records = parseConvexData(data?.data) as QueryReturnType;

  return {
    isLoading: data.isLoading,
    isError: data.isError,
    data: records,
    error: data.error,
    isFetching: data.isFetching,
    isFetched: data.isFetched,
  };
};
