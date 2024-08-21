import {
  GlobalConfig,
  QUERY_KEY_PREFIX,
  QueryDto,
  QueryProps,
  QueryReturnOrUndefined,
  RecordType,
} from '@apps-next/core';
import { useQuery } from '@tanstack/react-query';
import { usePrismaApi } from './use-prisma-api';
import React from 'react';

export const useStableQuery = (fn: any, args: QueryDto) => {
  const result = useQuery({
    queryKey: [QUERY_KEY_PREFIX, args.viewConfig?.viewName, args.query ?? ''],
    queryFn: fn,
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

export const usePrismaQuery = <QueryReturnType extends RecordType[]>({
  queryProps,
  globalConfig,
}: {
  queryProps: QueryProps;
  globalConfig: GlobalConfig;
}): QueryReturnOrUndefined<QueryReturnType[0]> => {
  const prisma = usePrismaApi();

  const queryReturn = useStableQuery(async () => {
    const res = await prisma.viewLoader({
      ...queryProps,

      viewConfig: queryProps.viewConfigManager?.viewConfig,
      modelConfig: queryProps.viewConfigManager?.modelConfig,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      viewConfigManager: undefined,
    });

    return res;
  }, queryProps);

  return {
    ...queryReturn,
    data: queryReturn.data?.data,
  };
};
